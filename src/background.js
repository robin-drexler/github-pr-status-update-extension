/**
 * Todo:
 *
 * - remove merged PRs
 * - options page for token
 */

const TOKEN = ``;

import browser from "webextension-polyfill";
import queryPr, { extractPrData } from "./query-pr.js";
function matchUrl(url) {
  return url.match(
    /github\.com\/(?<owner>.*?)\/(?<repository>.*?)\/pull\/(?<number>\d+)/
  );
}

function getStorageKey({ owner, repository, number }) {
  return `pr/${owner}/${repository}/${number}`;
}

async function getAllPRsFromStorage() {
  const items = await browser.storage.local.get(null);

  return Object.entries(items)
    .filter(([key, item]) => key.startsWith("pr/"))
    .map(([key, item]) => item);
}

async function updateHandler() {
  const [{ url, id }] = await browser.tabs.query({ active: true });
  const match = matchUrl(url);

  if (!match) {
    browser.pageAction.hide(id);
    return;
  }

  browser.pageAction.show(id);
}

async function notificationClickHandler(notifictionId) {
  browser.notifications.clear(notifictionId);

  const { windowId } = await browser.tabs.create({ url: notifictionId });
  await browser.windows.update(windowId, { focused: true });
}

browser.tabs.onUpdated.addListener(updateHandler);
browser.tabs.onActivated.addListener(updateHandler);

browser.pageAction.onClicked.addListener(async () => {
  const [{ url }] = await browser.tabs.query({ active: true });
  const match = matchUrl(url);

  if (!match) {
    return;
  }

  const { owner, repository, number } = match.groups;

  const storageKey = getStorageKey({ owner, repository, number });
  const item = await browser.storage.local.get([storageKey]);

  if (Object.keys(item).length) {
    return;
  }
  const pr = await queryPr({ owner, repository, number, token: TOKEN });

  if (pr.errors) {
    console.error(pr);
    return;
  }
  const { status } = extractPrData(pr);

  browser.storage.local.set({
    [storageKey]: {
      owner,
      repository,
      number,
      status,
      date: new Date().toString()
    }
  });
});

async function checkStatuses() {
  const storedPRs = await getAllPRsFromStorage();
  storedPRs.map(async item => {
    const { owner, repository, number, status } = item;
    const storageKey = getStorageKey({ owner, repository, number });
    const pr = await queryPr({ owner, repository, number, token: TOKEN });

    if (pr.errors) {
      return;
    }
    const { status: newStatus, url } = extractPrData(pr);
    console.log(
      "checking",
      storageKey,
      status,
      newStatus,
      status === newStatus
    );

    if (newStatus !== status) {
      browser.notifications.create(url, {
        type: "basic",
        title: "PR status changed",
        message: `${owner}/${repository}#${number} is now ${newStatus}`,
        iconUrl: "./img/icons/icon_256.png",
        buttons: [{ title: "show" }],
        requireInteraction: true
      });

      browser.storage.local.set({
        [storageKey]: { ...item, status: newStatus }
      });
    }
  });
}

browser.notifications.onButtonClicked.addListener(notificationClickHandler);
browser.notifications.onClicked.addListener(notificationClickHandler);

window.setInterval(checkStatuses, 30000);
checkStatuses();

// window.setInterval(() => {
//   console.log("hello");
// }, 5000);

const DEBUGFUNCTIONS = {
  createNotification() {
    browser.notifications.create("https://google.com", {
      type: "basic",
      title: "PR status changed",
      message: `test test `,
      iconUrl: "./img/icons/icon_256.png",
      buttons: [{ title: "show" }],
      requireInteraction: true
    });
  }
};

// DEBUGFUNCTIONS.createNotification();
