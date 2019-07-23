import browser from "webextension-polyfill";

export async function getPr({ owner, repository, number }) {
  const key = getStorageKey({ owner, repository, number });
  const item = await browser.storage.local.get([key]);

  if (!Object.keys(item).length) {
    return null;
  }

  return item[key];
}

export async function getAllPrs() {
  const items = await browser.storage.local.get(null);

  return Object.entries(items)
    .filter(([key, item]) => key.startsWith("pr/"))
    .map(([key, item]) => item);
}

export function setPr({ owner, repository, number, status, date }) {
  return browser.storage.local.set({
    [getStorageKey({ owner, repository, number })]: {
      owner,
      repository,
      number,
      status,
      date
    }
  });
}

export function removePr({ owner, repository, number }) {
  return browser.storage.local.remove([
    getStorageKey({ owner, repository, number })
  ]);
}

export async function getToken() {
  const { token } = await getOptions();
  return token;
}

export async function setToken(token) {
  return patchOptions({ token });
}

function getStorageKey({ owner, repository, number }) {
  return `pr/${owner}/${repository}/${number}`;
}

async function patchOptions(options) {
  const currentOptions = await getOptions();
  return browser.storage.local.set({
    options: { ...currentOptions, ...options }
  });
}
async function getOptions() {
  const result = await browser.storage.local.get(["options"]);
  return result.options || {};
}
