// Injected into the target page. Only handles sections with recognizable headings.
export async function fillRecords(profile, recordTypes) {
  const norm = value => String(value || '').toLowerCase().replace(/[\s:：*＊（）()\[\]【】_\-]/g, '');
  const controls = root => [...root.querySelectorAll('input, textarea, select')].filter(el => el.type !== 'hidden' && !el.disabled && el.getClientRects().length);
  const label = el => norm([el.name, el.id, el.placeholder, el.getAttribute('aria-label'), ...(el.labels || []).map(x => x.innerText), el.closest('label')?.innerText].filter(Boolean).join(' '));
  const match = (el, fields) => {
    const text = label(el);
    let best = null, score = 0;
    for (const field of fields) for (const term of field.terms) {
      const word = norm(term);
      if (word && text.includes(word) && word.length > score) { best = field; score = word.length; }
    }
    return best;
  };
  const set = (el, value) => {
    if (!value || el.type === 'file' || el.type === 'radio' || el.type === 'checkbox') return false;
    if (el.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    if (el.type === 'month' && !/^\d{4}-\d{2}$/.test(value)) return false;
    if (el.tagName === 'SELECT') {
      const option = [...el.options].find(x => norm(x.value) === norm(value) || norm(x.textContent) === norm(value));
      if (!option) return false;
      el.value = option.value;
    } else {
      const setter = Object.getOwnPropertyDescriptor(el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(el, value); else el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dataset.resumeToolRecordFilled = 'true';
    return true;
  };
  const titles = {
    educationEntries: ['教育经历', '教育背景'],
    workEntries: ['工作经历', '实习经历', '工作经验'],
    projectEntries: ['项目经历', '项目经验'],
    awardEntries: ['获奖经历', '荣誉奖项', '证书奖项', '获奖证书']
  };
  let filled = 0, skipped = 0;
  for (const type of recordTypes) {
    const entries = profile[type.key] || [];
    if (!entries.length) continue;
    const heading = [...document.querySelectorAll('h1,h2,h3,h4,legend,[role="heading"]')].find(el => titles[type.key].some(title => norm(el.textContent).includes(norm(title))));
    if (!heading) { skipped += entries.length; continue; }
    let section = heading.closest('section,fieldset,[class*="section"],[class*="Section"]');
    if (!section) {
      section = heading.parentElement;
      while (section?.parentElement && controls(section).length === 0 && section !== document.body) section = section.parentElement;
    }
    if (!section || section === document.body) { skipped += entries.length; continue; }
    const addButton = [...section.querySelectorAll('button,[role="button"]')].find(el => {
      const text = norm(el.textContent);
      return /^(新增|添加|增加|add)$/i.test(text) || (/新增|添加|增加|add/i.test(text) && titles[type.key].some(title => text.includes(norm(title).slice(0, 2))));
    });
    const countRows = () => {
      const counts = new Map();
      for (const el of controls(section)) {
        const field = match(el, type.fields);
        if (field) counts.set(field.key, (counts.get(field.key) || 0) + 1);
      }
      return Math.max(0, ...counts.values());
    };
    if (addButton) {
      for (let attempt = 0; attempt < entries.length && countRows() < entries.length; attempt++) {
        const before = countRows();
        addButton.click();
        await new Promise(resolve => setTimeout(resolve, 120));
        if (countRows() <= before) break;
      }
    }
    const buckets = new Map();
    for (const el of controls(section)) {
      const field = match(el, type.fields);
      if (field) buckets.set(field.key, [...(buckets.get(field.key) || []), el]);
    }
    for (const field of type.fields) for (let index = 0; index < entries.length; index++) {
      const value = entries[index]?.[field.key];
      if (!value) continue;
      const el = buckets.get(field.key)?.[index];
      if (el && set(el, String(value))) filled++; else skipped++;
    }
  }
  return { filled, skipped };
}
