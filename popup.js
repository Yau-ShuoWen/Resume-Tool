import { fields } from './fields.js';
import { loadProfile } from './storage.js';
import { recordTypes } from './records.js';

const button = document.querySelector('#fill');
const result = document.querySelector('#result');
button.addEventListener('click', async () => {
  button.disabled = true;
  result.textContent = '正在填入…';
  try {
    const profile = await loadProfile();
    if (!Object.values(profile).some(Boolean)) throw new Error('请先填写并保存资料。');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('未找到当前页面。');
    const target = { tabId: tab.id, allFrames: true };
    await chrome.scripting.executeScript({ target, files: ['content-fill.js'] });
    const output = await chrome.scripting.executeScript({ target, func: (data, singles, repeats) => globalThis.resumeToolFill(data, singles, repeats), args: [profile, fields, recordTypes] });
    const totals = output.map(item => item.result || {}).reduce((sum, item) => ({ recognized: sum.recognized + (item.recognized || 0), filled: sum.filled + (item.filled || 0), missing: sum.missing + (item.missing || 0), unsupported: sum.unsupported + (item.unsupported || 0) }), { recognized: 0, filled: 0, missing: 0, unsupported: 0 });
    result.textContent = `识别 ${totals.recognized} 项，填入 ${totals.filled} 项；资料未填 ${totals.missing} 项，控件暂不支持 ${totals.unsupported} 项。请检查后提交。`;
  } catch (error) {
    result.textContent = `无法填入：${error.message}。请确认当前页面是普通网页。`;
  } finally { button.disabled = false; }
});
