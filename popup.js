import { fields } from './fields.js';
import { loadProfile } from './storage.js';
import { recordTypes } from './records.js';

const button = document.querySelector('#fill');
const result = document.querySelector('#result');
const details = document.querySelector('#details');
const reportElement = document.querySelector('#report');
const saveStatus = document.querySelector('#save-status');
const saveButton = document.querySelector('#save-bundle');
let reportText = '';
let latestTotals = null;
const download = (name, content, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
const fileStamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const labels = { filled: '已填入', missing: '资料未填', unsupported: '控件暂不支持', unmatched: '未识别' };
function showReport(totals) {
  latestTotals = totals;
  result.textContent = `识别 ${totals.recognized} 项，填入 ${totals.filled} 项；资料未填 ${totals.missing} 项，控件暂不支持 ${totals.unsupported} 项，未识别 ${totals.unmatched} 项。请检查后提交。`;
  reportElement.replaceChildren();
  for (const item of totals.report) {
    const row = document.createElement('div');
    row.className = 'report-row';
    row.dataset.status = item.status;
    const name = document.createElement('span');
    name.textContent = item.label;
    const status = document.createElement('span');
    status.textContent = labels[item.status] || item.status;
    row.append(name, status);
    reportElement.append(row);
  }
  reportText = ['简历表单助手诊断（不含填写内容）', result.textContent, ...totals.report.map(item => `${labels[item.status] || item.status}：${item.label}`)].join('\n');
  saveButton.disabled = false;
  details.hidden = false;
}
const [initialTab] = await chrome.tabs.query({ active: true, currentWindow: true });
const previous = (await chrome.storage.session.get('lastFillReport')).lastFillReport;
if (previous?.tabId === initialTab?.id && previous?.pageUrl === initialTab?.url) showReport(previous.totals);
document.querySelector('#copy-report').addEventListener('click', async () => {
  await navigator.clipboard.writeText(reportText);
  document.querySelector('#copy-report').textContent = '已复制';
});
saveButton.addEventListener('click', async () => {
  if (!latestTotals) return;
  saveButton.disabled = true;
  saveStatus.textContent = '正在读取当前页面…';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const previousReport = (await chrome.storage.session.get('lastFillReport')).lastFillReport;
    if (!tab?.id || previousReport?.tabId !== tab.id || previousReport?.pageUrl !== tab.url) throw new Error('请先在当前页面填入资料');
    const output = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        const doctype = document.doctype;
        const prefix = doctype ? `<!DOCTYPE ${doctype.name}${doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : ''}${doctype.systemId ? ` "${doctype.systemId}"` : ''}>\n` : '';
        return { url: location.href, html: prefix + document.documentElement.outerHTML };
      }
    });
    if (!output.length || !output.some(item => item.frameId === 0 && item.result?.html)) throw new Error('页面内容为空');
    const bundle = {
      format: 'resume-tool-diagnostic-v1',
      capturedAt: new Date().toISOString(),
      pageUrl: tab.url,
      diagnosis: { summary: result.textContent, text: reportText, totals: latestTotals },
      pages: output.map(item => ({ frameId: item.frameId, url: item.result?.url, html: item.result?.html }))
    };
    download(`简历表单诊断与页面-${fileStamp()}.json`, JSON.stringify(bundle, null, 2), 'application/json;charset=utf-8');
    saveStatus.textContent = '诊断与页面已保存为一个文件。';
  } catch (error) {
    saveStatus.textContent = `无法保存：${error.message}。`;
  } finally { saveButton.disabled = false; }
});
button.addEventListener('click', async () => {
  button.disabled = true;
  latestTotals = null;
  reportText = '';
  saveButton.disabled = true;
  details.hidden = true;
  result.textContent = '正在填入…';
  try {
    const profile = await loadProfile();
    if (!Object.values(profile).some(Boolean)) throw new Error('请先填写并保存资料。');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('未找到当前页面。');
    const target = { tabId: tab.id, allFrames: true };
    await chrome.scripting.executeScript({ target, files: ['content-fill.js'] });
    const output = await chrome.scripting.executeScript({ target, func: (data, singles, repeats) => globalThis.resumeToolFill(data, singles, repeats), args: [profile, fields, recordTypes] });
    const totals = output.map(item => item.result || {}).reduce((sum, item) => ({ recognized: sum.recognized + (item.recognized || 0), filled: sum.filled + (item.filled || 0), missing: sum.missing + (item.missing || 0), unsupported: sum.unsupported + (item.unsupported || 0), unmatched: sum.unmatched + (item.unmatched || 0), report: [...sum.report, ...(item.report || [])] }), { recognized: 0, filled: 0, missing: 0, unsupported: 0, unmatched: 0, report: [] });
    showReport(totals);
    await chrome.storage.session.set({ lastFillReport: { tabId: tab.id, pageUrl: tab.url, totals } });
  } catch (error) {
    result.textContent = `无法填入：${error.message}。请确认当前页面是普通网页。`;
  } finally { button.disabled = false; }
});
