import { fields } from './fields.js';
import { loadProfile } from './storage.js';
import { fillPage } from './fill.js';

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
    const output = await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, func: fillPage, args: [profile, fields] });
    const totals = output.map(item => item.result || {}).reduce((sum, item) => ({ filled: sum.filled + (item.filled || 0), skipped: sum.skipped + (item.skipped || 0) }), { filled: 0, skipped: 0 });
    result.textContent = `已填入 ${totals.filled} 项；${totals.skipped} 项未匹配或不适用。请检查后提交。`;
  } catch (error) {
    result.textContent = `无法填入：${error.message}。请确认当前页面是普通网页。`;
  } finally { button.disabled = false; }
});
