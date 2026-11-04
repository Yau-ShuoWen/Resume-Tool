import { defaultProfile } from './defaults.js';

export const PROFILE_KEY = 'profile';
const DEFAULTS_VERSION_KEY = 'defaultsVersion';
const DEFAULTS_VERSION = 1;

async function bundledResume() {
  const response = await fetch(chrome.runtime.getURL('default-resume.pdf'));
  if (!response.ok) throw new Error('默认简历文件无法读取');
  const blob = await response.blob();
  return readFile(new File([blob], '姚子聪-Java开发.pdf', { type: 'application/pdf' }));
}

export async function loadProfile() {
  const state = await chrome.storage.local.get([PROFILE_KEY, DEFAULTS_VERSION_KEY]);
  if (state[DEFAULTS_VERSION_KEY] >= DEFAULTS_VERSION) return state[PROFILE_KEY] || {};
  const profile = { ...state[PROFILE_KEY] };
  for (const [key, value] of Object.entries(defaultProfile)) {
    if (profile[key] == null || profile[key] === '') profile[key] = value;
  }
  try {
    if (!profile.resumeFile?.data) profile.resumeFile = await bundledResume();
  } catch (_) { /* Text profile still works if the bundled file is unavailable. */ }
  await chrome.storage.local.set({ [PROFILE_KEY]: profile, [DEFAULTS_VERSION_KEY]: DEFAULTS_VERSION });
  return profile;
}

export async function saveProfile(profile) {
  await chrome.storage.local.set({ [PROFILE_KEY]: profile });
}

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type || 'application/octet-stream', data: reader.result });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
