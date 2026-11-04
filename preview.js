import { loadProfile } from './storage.js';
import { recordTypes } from './records.js';
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="records.css">');

const data = await loadProfile();
const root = document.querySelector('#resume');
const add = (tag, text, parent = root, className = '') => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.append(node);
  return node;
};

add('h2', data.name || '未填写姓名');
const meta = [data.phone, data.email, data.city, data.address, data.website, data.github, data.linkedin].filter(Boolean);
if (meta.length) add('p', meta.join('  ·  '), root, 'resume-meta');
const facts = [data.gender, data.birthDate, data.school, data.degree, data.major, data.graduationDate, data.workYears && `${data.workYears} 工作经验`, data.company, data.position, data.targetPosition && `目标岗位 ${data.targetPosition}`, data.salary && `期望薪资 ${data.salary}`].filter(Boolean);
if (facts.length) add('p', facts.join('  ·  '), root, 'resume-facts');
for (const [title, key] of [['个人简介', 'summary'], ['专业技能', 'skills']]) {
  if (!data[key]) continue;
  const section = document.createElement('section');
  add('h3', title, section);
  add('p', data[key], section, 'resume-body');
  root.append(section);
}
for (const type of recordTypes) {
  const entries = data[type.key] || [];
  if (!entries.length) continue;
  const section = document.createElement('section');
  add('h3', type.title, section);
  for (const entry of entries) {
    const block = document.createElement('div');
    block.className = 'resume-entry';
    const name = entry.school || entry.company || entry.name || '未命名';
    add('div', name, block, 'resume-entry-title');
    const meta = [entry.degree, entry.major, entry.position, entry.role, entry.startDate && entry.endDate ? `${entry.startDate}—${entry.endDate}` : entry.date || entry.startDate || entry.endDate, entry.url].filter(Boolean);
    if (meta.length) add('div', meta.join('  ·  '), block, 'resume-entry-meta');
    if (entry.description) add('p', entry.description, block, 'resume-entry-description');
    section.append(block);
  }
  root.append(section);
}
const files = [data.resumeFile?.name, data.coverLetterFile?.name].filter(Boolean);
if (files.length) add('p', `已保存附件：${files.join('、')}`, root, 'resume-meta');
if (!Object.values(data).some(Boolean)) add('p', '还没有资料。请先填写并保存。');
