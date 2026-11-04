import { loadProfile } from './storage.js';

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
for (const [title, key] of [['个人简介', 'summary'], ['教育经历', 'education'], ['工作经历', 'experience'], ['项目经历', 'projects'], ['专业技能', 'skills'], ['证书奖项', 'certificates']]) {
  if (!data[key]) continue;
  const section = document.createElement('section');
  add('h3', title, section);
  add('p', data[key], section, 'resume-body');
  root.append(section);
}
const files = [data.resumeFile?.name, data.coverLetterFile?.name].filter(Boolean);
if (files.length) add('p', `已保存附件：${files.join('、')}`, root, 'resume-meta');
if (!Object.values(data).some(Boolean)) add('p', '还没有资料。请先填写并保存。');
