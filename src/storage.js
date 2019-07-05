import browser from "webextension-polyfill";

export async function getPr({ owner, repository, number }) {
  const item = await browser.storage.local.get([
    getStorageKey({ owner, repository, number })
  ]);

  if (!Object.keys(item).length) {
    return null;
  }

  return item;
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
  return ``;
}

function getStorageKey({ owner, repository, number }) {
  return `pr/${owner}/${repository}/${number}`;
}
