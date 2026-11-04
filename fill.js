// This function is injected into the active page; keep it self-contained.
export function fillPage(profile, fields) {
  const controls = [...document.querySelectorAll('input, textarea, select, [contenteditable="true"]')];
  const normalize = value => String(value || '').toLowerCase().replace(/[\s\u00a0:：*＊（）()\[\]【】_\-]/g, '');
  const visible = el => !!(el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  const descriptor = el => {
    const id = el.id;
    const labels = [...(el.labels || [])].map(x => x.innerText);
    if (id) labels.push(...[...document.querySelectorAll('label[for]')].filter(x => x.htmlFor === id).map(x => x.innerText));
    const nearby = el.closest('label, .form-item, .form-group, .field, .ant-form-item, .el-form-item, [class*="formItem"]');
    return normalize([el.name, id, el.getAttribute('aria-label'), el.getAttribute('placeholder'), el.getAttribute('data-label'), ...labels, nearby?.innerText?.slice(0, 100)].filter(Boolean).join(' '));
  };
  const match = el => {
    const text = descriptor(el);
    let best = null;
    let score = 0;
    for (const field of fields) {
      if (!profile[field.key] || field.file !== (el.type === 'file')) continue;
      for (const term of field.terms) {
        const needle = normalize(term);
        if (!needle || !text.includes(needle)) continue;
        const current = needle.length + (text === needle ? 20 : 0);
        if (current > score) { best = field; score = current; }
      }
    }
    return best;
  };
  const emit = el => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  };
  const choose = (el, value) => {
    const wanted = normalize(value);
    const options = [...el.options];
    const option = options.find(x => normalize(x.value) === wanted || normalize(x.textContent) === wanted)
      || options.find(x => normalize(x.textContent).includes(wanted) && wanted);
    if (!option) return false;
    el.value = option.value;
    emit(el);
    return true;
  };
  let filled = 0;
  let skipped = 0;
  const radioDone = new Set();
  for (const el of controls) {
    if (!visible(el) || el.disabled || el.readOnly || ['hidden', 'submit', 'reset', 'button', 'image', 'password'].includes(el.type)) continue;
    const field = match(el);
    if (!field) { skipped++; continue; }
    const value = profile[field.key];
    try {
      if (el.type === 'file') {
        if (!value?.data) { skipped++; continue; }
        const [, encoded] = value.data.split(',', 2);
        const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
        const transfer = new DataTransfer();
        transfer.items.add(new File([bytes], value.name, { type: value.type }));
        el.files = transfer.files;
        emit(el);
      } else if (el.tagName === 'SELECT') {
        if (!choose(el, value)) { skipped++; continue; }
      } else if (el.type === 'radio' || el.type === 'checkbox') {
        const key = `${el.name}|${field.key}`;
        if (radioDone.has(key)) continue;
        const label = normalize([el.value, el.labels?.[0]?.innerText, el.parentElement?.innerText?.slice(0, 40)].join(' '));
        if (!label.includes(normalize(value))) { skipped++; continue; }
        el.checked = true;
        radioDone.add(key);
        emit(el);
      } else if (el.isContentEditable) {
        el.textContent = String(value);
        emit(el);
      } else {
        if (el.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) { skipped++; continue; }
        if (el.type === 'month' && !/^\d{4}-\d{2}$/.test(String(value))) { skipped++; continue; }
        const setter = Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(el, String(value)); else el.value = String(value);
        emit(el);
      }
      filled++;
    } catch (_) { skipped++; }
  }
  return { filled, skipped };
}
