import { fields, groups } from './fields.js';
import { loadProfile, saveProfile, readFile } from './storage.js';
import { recordTypes } from './records.js';
document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="records.css">');

const form = document.querySelector('#profile-form');
const status = document.querySelector('#status');
let profile = await loadProfile();
const longFields = new Set(['summary', 'skills']);

for (const group of groups) {
  const section = document.createElement('section');
  section.className = 'panel';
  const heading = document.createElement('h2');
  heading.textContent = group.title;
  section.append(heading);
  const grid = document.createElement('div');
  grid.className = 'field-grid';
  for (const key of group.keys) {
    const field = fields.find(item => item.key === key);
    const wrapper = document.createElement('label');
    wrapper.className = longFields.has(key) || field.file ? 'field wide' : 'field';
    const caption = document.createElement('span');
    caption.textContent = field.label;
    wrapper.append(caption);
    const input = field.file ? document.createElement('input') : longFields.has(key) ? document.createElement('textarea') : document.createElement('input');
    input.dataset.key = key;
    if (field.file) {
      input.type = 'file';
      input.accept = key === 'resumeFile' ? '.pdf,.doc,.docx' : '.pdf,.doc,.docx,.txt';
      const note = document.createElement('small');
      note.textContent = profile[key]?.name ? `已保存：${profile[key].name}。重新选择可替换。` : '选择文件后点击保存；文件保存在本机浏览器中。';
      wrapper.append(input, note);
    } else {
      input.value = profile[key] || '';
      if (key === 'email') input.type = 'email';
      if (key === 'phone') input.type = 'tel';
      if (longFields.has(key)) input.rows = 5;
      wrapper.append(input);
    }
    grid.append(wrapper);
  }
  section.append(grid);
  form.append(section);
}

for (const type of recordTypes) {
  const section = document.createElement('section');
  section.className = 'panel';
  const header = document.createElement('div');
  header.className = 'record-header';
  const heading = document.createElement('h2');
  heading.textContent = type.title;
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'button secondary';
  addButton.textContent = type.addText;
  header.append(heading, addButton);
  const list = document.createElement('div');
  list.dataset.recordList = type.key;
  const appendRecord = (entry = {}) => {
    const card = document.createElement('div');
    card.className = 'record-card';
    const cardHeader = document.createElement('div');
    cardHeader.className = 'record-header';
    const title = document.createElement('strong');
    title.textContent = `第 ${list.children.length + 1} 条`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'text-button';
    remove.textContent = '删除此条';
    remove.addEventListener('click', () => {
      card.remove();
      [...list.children].forEach((item, index) => { item.querySelector('strong').textContent = `第 ${index + 1} 条`; });
    });
    cardHeader.append(title, remove);
    const grid = document.createElement('div');
    grid.className = 'field-grid';
    for (const item of type.fields) {
      const wrapper = document.createElement('label');
      wrapper.className = item.multiline ? 'field wide' : 'field';
      const caption = document.createElement('span');
      caption.textContent = item.label;
      const input = document.createElement(item.multiline ? 'textarea' : 'input');
      input.dataset.recordField = item.key;
      input.value = entry[item.key] || '';
      if (item.multiline) input.rows = 4;
      wrapper.append(caption, input);
      grid.append(wrapper);
    }
    card.append(cardHeader, grid);
    list.append(card);
  };
  addButton.addEventListener('click', () => appendRecord());
  for (const entry of profile[type.key] || []) appendRecord(entry);
  section.append(header, list);
  form.append(section);
}

document.querySelector('#save').addEventListener('click', async () => {
  const button = document.querySelector('#save');
  button.disabled = true;
  status.textContent = '保存中…';
  try {
    const next = { ...profile };
    for (const input of form.querySelectorAll('[data-key]')) {
      const key = input.dataset.key;
      if (input.type === 'file') {
        if (input.files[0]) next[key] = await readFile(input.files[0]);
      } else next[key] = input.value.trim();
    }
    for (const type of recordTypes) {
      const list = form.querySelector(`[data-record-list="${type.key}"]`);
      next[type.key] = [...list.children].map(card => Object.fromEntries(
        [...card.querySelectorAll('[data-record-field]')].map(input => [input.dataset.recordField, input.value.trim()])
      )).filter(entry => Object.values(entry).some(Boolean));
    }
    await saveProfile(next);
    profile = next;
    status.textContent = '已保存';
  } catch (error) {
    status.textContent = `保存失败：${error.message}。大文件可能超过浏览器存储限额。`;
  } finally { button.disabled = false; }
});
