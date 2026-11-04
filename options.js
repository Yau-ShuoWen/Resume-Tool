import { fields, groups } from './fields.js';
import { loadProfile, saveProfile, readFile } from './storage.js';

const form = document.querySelector('#profile-form');
const status = document.querySelector('#status');
let profile = await loadProfile();
const longFields = new Set(['summary', 'education', 'experience', 'projects', 'skills', 'certificates']);

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
    await saveProfile(next);
    profile = next;
    status.textContent = '已保存';
  } catch (error) {
    status.textContent = `保存失败：${error.message}。大文件可能超过浏览器存储限额。`;
  } finally { button.disabled = false; }
});
