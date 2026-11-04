// Runs in an isolated extension world on the active page.
globalThis.resumeToolFill = async function (profile, fields, recordTypes) {
  const norm = value => String(value || '').toLowerCase().replace(/[\s\u00a0:：*＊（）()\[\]【】_\-]/g, '');
  const text = el => (el?.innerText || el?.textContent || '').trim();
  const isVisible = el => !!el?.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const allControls = () => [...document.querySelectorAll('input,textarea,select,[contenteditable="true"],[role="combobox"]')]
    .filter(el => !el.disabled && !['hidden', 'submit', 'reset', 'button', 'image', 'password'].includes(el.type))
    .filter(el => !el.querySelector('input,textarea,select,[contenteditable="true"]'));
  const labelCache = [...document.querySelectorAll('label')];
  const genericPlaceholder = /^(请输入|请选择|请填写|pleaseenter|pleaseselect|select|enter)$/i;
  const ownLabels = el => {
    const parts = [el.getAttribute('aria-label'), el.getAttribute('data-label'), el.getAttribute('title')];
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) for (const id of labelledBy.split(/\s+/)) parts.push(text(document.getElementById(id)));
    parts.push(...[...(el.labels || [])].map(text));
    if (el.id) parts.push(...labelCache.filter(item => item.htmlFor === el.id).map(text));
    const placeholder = el.getAttribute('placeholder');
    if (placeholder && !genericPlaceholder.test(norm(placeholder))) parts.push(placeholder);
    return parts.filter(part => part && !genericPlaceholder.test(norm(part)));
  };
  const rowLabel = el => {
    let node = el.parentElement;
    for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
      const count = node.querySelectorAll('input,textarea,select,[contenteditable="true"],[role="combobox"]').length;
      if (count > 3) break;
      const candidates = [...node.querySelectorAll('label,[class*="label"],[class*="Label"],span')]
        .filter(item => !item.contains(el) && !item.querySelector('input,textarea,select'))
        .map(text).filter(value => value.length > 0 && value.length <= 32 && !genericPlaceholder.test(norm(value)));
      if (candidates.length) return candidates.slice(0, 4).join(' ');
      const own = text(node).replace(text(el), '').trim();
      if (own && own.length <= 32 && !genericPlaceholder.test(norm(own))) return own;
    }
    return '';
  };
  const geometricLabel = el => {
    const box = el.getBoundingClientRect();
    let best = '', bestDistance = Infinity;
    for (const node of document.querySelectorAll('label,span,div')) {
      if (node.contains(el) || node.querySelector('input,textarea,select,[role="combobox"]')) continue;
      const value = text(node);
      if (!value || value.length > 24 || genericPlaceholder.test(norm(value))) continue;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.height > 70) continue;
      const sameRow = Math.abs((rect.top + rect.bottom) / 2 - (box.top + box.bottom) / 2) < 28 && rect.right <= box.left + 8;
      const above = rect.bottom <= box.top + 8 && box.top - rect.bottom < 35 && Math.abs(rect.left - box.left) < 100;
      if (!sameRow && !above) continue;
      const distance = sameRow ? Math.abs(box.left - rect.right) + Math.abs(box.top - rect.top) : box.top - rect.bottom + Math.abs(box.left - rect.left);
      if (distance < bestDistance) { best = value; bestDistance = distance; }
    }
    return best;
  };
  const descriptor = el => {
    const direct = ownLabels(el);
    const row = rowLabel(el);
    const near = direct.length || row ? '' : geometricLabel(el);
    return { primary: norm([...direct, row, near].join(' ')), secondary: norm([el.name, el.id, el.getAttribute('data-field')].join(' ')) };
  };
  const matchField = (el, candidates) => {
    const { primary, secondary } = descriptor(el);
    let best = null, bestScore = 0;
    for (const field of candidates) for (const term of field.terms) {
      const word = norm(term);
      if (!word) continue;
      const primaryHit = primary.includes(word);
      const secondaryHit = secondary.includes(word);
      if (!primaryHit && !secondaryHit) continue;
      const score = (primaryHit ? 100 : 30) + word.length * 3 + (primary === word ? 30 : 0);
      if (score > bestScore) { best = field; bestScore = score; }
    }
    return best;
  };
  const notify = el => {
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  };
  const samePlace = (a, b) => {
    const left = norm(a).replace(/[省市区县族]/g, '');
    const right = norm(b).replace(/[省市区县族]/g, '');
    return left === right || (right === '共青团员' && left === '团员') || (right === '全日制' && left === '普通全日制');
  };
  const findOption = wanted => {
    const candidates = [...document.querySelectorAll('[role="option"],li,[class*="option"],[class*="Option"],[class*="dropdown-item"],div,span')]
      .filter(item => isVisible(item) && !item.querySelector('input,textarea,select') && text(item).length <= 24)
      .filter(item => ![...item.children].some(child => samePlace(text(child), wanted)));
    return candidates.find(item => samePlace(text(item), wanted));
  };
  const write = async (el, value) => {
    if (value == null || value === '') return 'missing';
    if (Array.isArray(value)) {
      if (!(el.readOnly || el.getAttribute('role') === 'combobox')) return 'unsupported';
      el.click();
      for (const part of value) {
        await new Promise(resolve => setTimeout(resolve, 120));
        const option = findOption(part);
        if (!option) return 'unsupported';
        option.click();
      }
      await new Promise(resolve => setTimeout(resolve, 80));
      return value.every(part => norm(text(el.parentElement)).includes(norm(part).replace(/[省市区县]/g, ''))) ? 'filled' : 'unsupported';
    }
    if (norm(value) === '至今') {
      let row = el.parentElement;
      for (let depth = 0; row && depth < 4; depth++, row = row.parentElement) {
        const current = [...row.querySelectorAll('input[type="checkbox"]')].find(box =>
          norm([box.value, ...ownLabels(box), text(box.parentElement)].join(' ')).includes('至今'));
        if (current) {
          if (!current.checked) current.click();
          notify(current);
          return 'filled';
        }
      }
    }
    if (el.type === 'file') {
      if (!value?.data) return 'missing';
      const encoded = value.data.slice(value.data.indexOf(',') + 1);
      const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
      const transfer = new DataTransfer();
      transfer.items.add(new File([bytes], value.name, { type: value.type }));
      el.files = transfer.files;
      notify(el);
      return 'filled';
    }
    if (el.type === 'month' && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) value = String(value).slice(0, 7);
    if (el.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return 'unsupported';
    if (el.type === 'month' && !/^\d{4}-\d{2}$/.test(String(value))) return 'unsupported';
    if (el.type !== 'date' && el.type !== 'month' && /^\d{4}-\d{2}(-\d{2})?$/.test(String(value))) {
      const hint = [el.placeholder, el.getAttribute('data-format'), el.getAttribute('format')].filter(Boolean).join(' ');
      if (/年.*月/.test(hint)) value = String(value).replace(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/, (_, year, month, day) => `${year}年${month}月${day ? `${day}日` : ''}`);
      else if (/y{2,4}\/m{1,2}/i.test(hint)) value = String(value).replaceAll('-', '/');
      else if (/y{2,4}\.m{1,2}/i.test(hint)) value = String(value).replaceAll('-', '.');
    }
    if (el.type === 'checkbox' || el.type === 'radio') {
      const choice = norm([el.value, ...ownLabels(el), text(el.parentElement).slice(0, 30)].join(' '));
      if (!choice.includes(norm(value))) return 'unsupported';
      if (!el.checked) el.click();
      notify(el);
      return 'filled';
    }
    if (el.tagName === 'SELECT') {
      const wanted = norm(value);
      const option = [...el.options].find(item => samePlace(item.value, wanted) || samePlace(text(item), wanted))
        || [...el.options].find(item => wanted && norm(text(item)).includes(wanted));
      if (!option) return 'unsupported';
      el.value = option.value;
      notify(el);
      return 'filled';
    }
    if (el.isContentEditable) { el.textContent = String(value); notify(el); return 'filled'; }
    if (el.readOnly || el.getAttribute('role') === 'combobox') {
      if (el.type === 'date' || el.type === 'month' || /日期|时间/.test(rowLabel(el))) {
        if (el.tagName !== 'INPUT') return 'unsupported';
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(el, String(value)); else el.value = String(value);
        notify(el);
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 100));
        return el.value === String(value) ? 'filled' : 'unsupported';
      }
      el.click();
      await new Promise(resolve => setTimeout(resolve, 120));
      let option = findOption(value);
      if (!option && el.parentElement) {
        el.parentElement.click();
        await new Promise(resolve => setTimeout(resolve, 120));
        option = findOption(value);
      }
      if (!option) return 'unsupported';
      option.click();
      notify(el);
      await new Promise(resolve => setTimeout(resolve, 80));
      return samePlace(el.value || text(el.parentElement), value) || norm(text(el.parentElement)).includes(norm(value)) ? 'filled' : 'unsupported';
    }
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, String(value)); else el.value = String(value);
    notify(el);
    return el.value === String(value) ? 'filled' : 'unsupported';
  };
  const titles = {
    educationEntries: ['教育经历', '教育背景'],
    workEntries: ['工作经历', '实习经历', '工作经验', '工作/实习经历', '任职经历'],
    projectEntries: ['项目经历', '项目经验'],
    awardEntries: ['获奖经历', '荣誉奖项', '证书奖项', '获奖证书'],
    campusEntries: ['在校职务', '校园经历', '学生工作']
  };
  const sectionTitles = Object.values(titles).flat();
  const isHeadingText = value => sectionTitles.some(title => norm(value).startsWith(norm(title)) && norm(value).length <= norm(title).length + 6);
  const candidateHeadings = [...document.querySelectorAll('h1,h2,h3,h4,h5,legend,div,span,p')]
    .filter(el => isVisible(el) && isHeadingText(text(el)))
    .filter(el => ![...el.children].some(child => isHeadingText(text(child))));
  const controlsBetween = (start, end) => allControls().filter(el =>
    !!(start.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
    && (!end || !!(el.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING)));
  const used = new Set();
  const stats = { recognized: 0, filled: 0, missing: 0, unsupported: 0, unmatched: 0, report: [] };
  const colors = { filled: '#198754', missing: '#d99000', unsupported: '#c43c3c', unmatched: '#7b8794' };
  const captions = { filled: '已填入', missing: '资料未填', unsupported: '控件暂不支持', unmatched: '未识别' };
  const mark = (el, status, label) => {
    el.style.outline = `2px solid ${colors[status]}`;
    el.style.outlineOffset = '2px';
    el.title = `简历表单助手：${label} · ${captions[status]}`;
    el.dataset.resumeToolMark = status;
    if (stats.report.length < 120) stats.report.push({ label: String(label).slice(0, 48), status });
  };
  const originalLabels = new Map(allControls().map(el => [el, ownLabels(el)[0] || rowLabel(el) || geometricLabel(el) || '未标注字段']));
  const visibleLabel = el => originalLabels.get(el) || ownLabels(el)[0] || rowLabel(el) || geometricLabel(el) || '未标注字段';
  const placeTarget = el => {
    const label = norm(visibleLabel(el));
    const kind = label.includes('籍贯') || label.includes('户籍') ? 'hometown' : label.includes('现居') || label.includes('居住地') ? 'residence' : null;
    if (!kind) return null;
    const title = kind === 'hometown' ? '籍贯' : '现居住地';
    const parts = ['Province', 'City', 'District'].map(suffix => profile[kind + suffix]);
    const explicit = label.includes('省份') || label.endsWith('省') ? 0 : label.includes('城市') || label.endsWith('市') ? 1 : label.includes('区县') || label.endsWith('区') ? 2 : -1;
    if (explicit >= 0) return { label: `${title} · ${['省份', '城市', '区县'][explicit]}`, value: parts[explicit] };
    const siblings = allControls().filter(item => norm(visibleLabel(item)) === label);
    if (siblings.length >= 2 && siblings.length <= 3) {
      const index = siblings.indexOf(el);
      return { label: `${title} · ${['省份', '城市', '区县'][index]}`, value: parts[index] };
    }
    return { label: title, value: el.readOnly || el.getAttribute('role') === 'combobox' ? parts.filter(Boolean) : profile[kind] };
  };
  const track = async (el, value, label) => {
    stats.recognized++;
    let status;
    try { status = await write(el, value); }
    catch (_) { status = 'unsupported'; }
    stats[status]++;
    mark(el, status, label);
    used.add(el);
  };
  for (const type of recordTypes) {
    const entries = profile[type.key] || [];
    if (!entries.length) continue;
    const heading = candidateHeadings.find(el => titles[type.key]?.some(title => norm(text(el)).startsWith(norm(title))));
    if (!heading) continue;
    const next = candidateHeadings.find(el => el !== heading && !!(heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
    const sectionControls = () => controlsBetween(heading, next);
    const sectionButtons = [...document.querySelectorAll('button,[role="button"],a')].filter(el =>
      !!(heading.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
      && (!next || !!(el.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING)));
    const add = sectionButtons.find(el => /新增|添加|增加|add/i.test(text(el)) && (norm(text(el)).length <= 14));
    const grouped = () => {
      const map = new Map();
      for (const el of sectionControls()) {
        const field = matchField(el, type.fields);
        if (field) map.set(field.key, [...(map.get(field.key) || []), el]);
      }
      return map;
    };
    if (add) for (let attempts = 0; attempts < entries.length - 1; attempts++) {
      const before = Math.max(0, ...[...grouped().values()].map(items => items.length));
      if (before >= entries.length) break;
      add.click();
      await new Promise(resolve => setTimeout(resolve, 150));
      const after = Math.max(0, ...[...grouped().values()].map(items => items.length));
      if (after <= before) break;
    }
    const map = grouped();
    for (const field of type.fields) for (let index = 0; index < entries.length; index++) {
      const el = map.get(field.key)?.[index];
      if (el && !used.has(el)) await track(el, entries[index]?.[field.key], `${type.title} ${index + 1} · ${field.label}`);
    }
    for (const el of sectionControls()) if (!used.has(el) && isVisible(el)) {
      stats.unmatched++;
      mark(el, 'unmatched', `${type.title} · ${visibleLabel(el)}`);
      used.add(el);
    }
  }
  for (const el of allControls()) {
    if (used.has(el) || (!isVisible(el) && el.type !== 'file')) continue;
    const place = placeTarget(el);
    if (place) { await track(el, place.value, place.label); continue; }
    const controlLabel = norm(visibleLabel(el));
    if (/证件号码|证件号/.test(controlLabel) && (el.tagName === 'SELECT' || el.readOnly || el.getAttribute('role') === 'combobox')) {
      await track(el, profile.identityType, '证件类型');
      continue;
    }
    const field = matchField(el, fields.filter(item => Boolean(item.file) === (el.type === 'file')));
    if (field) await track(el, profile[field.key], field.label);
    else {
      stats.unmatched++;
      mark(el, 'unmatched', visibleLabel(el));
    }
  }
  return stats;
};
