import { defaultProfile, defaultRecords } from './defaults.js';

export const PROFILE_KEY = 'profile';
const DEFAULTS_VERSION_KEY = 'defaultsVersion';
const DEFAULTS_VERSION = 5;
const legacyKeys = { educationEntries: 'education', workEntries: 'experience', projectEntries: 'projects', awardEntries: 'certificates' };

async function bundledResume() {
  const response = await fetch(chrome.runtime.getURL('default-resume.pdf'));
  if (!response.ok) throw new Error('默认简历文件无法读取');
  const blob = await response.blob();
  return readFile(new File([blob], '姚子聪-Java开发.pdf', { type: 'application/pdf' }));
}

export async function loadProfile() {
  const state = await chrome.storage.local.get([PROFILE_KEY, DEFAULTS_VERSION_KEY]);
  if (state[DEFAULTS_VERSION_KEY] >= DEFAULTS_VERSION) return state[PROFILE_KEY] || {};
  const profile = state[DEFAULTS_VERSION_KEY] >= 2 ? { ...state[PROFILE_KEY] } : { ...defaultProfile };
  for (const key of ['birthDate', 'ethnicity', 'politicalStatus', 'identityNumber', 'identityType', 'heightCm', 'weightKg', 'hometown', 'hometownProvince', 'hometownCity', 'hometownDistrict', 'residence', 'residenceProvince', 'residenceCity', 'residenceDistrict', 'city', 'salary', 'arrivalDate']) {
    if (profile[key] == null || profile[key] === '') profile[key] = defaultProfile[key];
  }
  for (const [key, entries] of Object.entries(defaultRecords)) {
    if (Array.isArray(profile[key])) continue;
    profile[key] = structuredClone(entries);
    const legacyKey = legacyKeys[key];
    const legacy = profile[legacyKey];
    if (legacyKey && legacy && legacy !== defaultProfile[legacyKey] && profile[key][0]) {
      profile[key][0].description = `${profile[key][0].description || ''}\n\n之前填写的补充内容：\n${legacy}`.trim();
    }
    if (legacyKey) delete profile[legacyKey];
  }
  if (profile.educationEntries?.length) {
    for (const key of ['studyMode', 'languageType', 'languageLevel']) {
      if (profile.educationEntries[0][key] == null || profile.educationEntries[0][key] === '') {
        profile.educationEntries[0][key] = defaultRecords.educationEntries[0][key];
      }
    }
  }
  if (!profile.resumeFile?.data) {
    try { profile.resumeFile = await bundledResume(); }
    catch (_) { /* Text profile still works if the bundled file is unavailable. */ }
  }
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
