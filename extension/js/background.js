/**
 * Todo:
 *
 * - remove merged PRs
 * - options page for token
 */

const TOKEN = ``;

import queryPr, { extractPrData } from "./query-pr.js";

function matchUrl(url) {
  return url.match(
    /github\.com\/(?<owner>.*?)\/(?<repository>.*?)\/pull\/(?<number>\d+)/
  );
}

function getStorageKey({ owner, repository, number }) {
  return `${owner}/${repository}/${number}`;
}

function updateHandler() {
  chrome.tabs.query({ active: true }, ([{ url, id }]) => {
    const match = matchUrl(url);

    if (!match) {
      chrome.pageAction.hide(id);
      return;
    }

    chrome.pageAction.show(id);

    const { owner, repository, number } = match.groups;
  });
}

chrome.tabs.onUpdated.addListener(updateHandler);
chrome.tabs.onActivated.addListener(updateHandler);

chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true }, ([{ url, id }]) => {
    const match = matchUrl(url);

    if (!match) {
      return;
    }

    const { owner, repository, number } = match.groups;

    const storageKey = getStorageKey({ owner, repository, number });

    chrome.storage.local.get([storageKey], async item => {
      if (Object.keys(item).length) {
        // chrome.storage.local.remove(storageKey);
        return;
      }

      const pr = await queryPr({ owner, repository, number, token: TOKEN });
      if (pr.errors) {
        console.error(pr);
        return;
      }

      const { status } = extractPrData(pr);

      chrome.storage.local.set({
        [storageKey]: {
          owner,
          repository,
          number,
          status,
          date: new Date().toString()
        }
      });
    });
  });
});

function checkStatuses() {
  chrome.storage.local.get(null, items => {
    Object.values(items).map(async item => {
      const { owner, repository, number, status } = item;
      const storageKey = getStorageKey({ owner, repository, number });
      console.log("checking", storageKey);
      const pr = await queryPr({ owner, repository, number, token: TOKEN });
      if (pr.errors) {
        return;
      }
      const { status: newStatus, url } = extractPrData(pr);

      if (newStatus !== status) {
        chrome.notifications.create(url, {
          type: "basic",
          title: "PR status changed",
          message: `${owner}/${repository}#${number} is now ${newStatus}`,
          iconUrl: "./img/icons/icon_256.png",
          buttons: [{ title: "show" }]
        });

        chrome.storage.local.set({
          [storageKey]: { ...item, status: newStatus }
        });
      }
    });
  });
}

window.setInterval(checkStatuses, 30000);
checkStatuses();

chrome.notifications.onButtonClicked.addListener(id => {
  chrome.tabs.create({ url: id });
});
chrome.notifications.onClicked.addListener(id => {
  chrome.tabs.create({ url: id });
});

// window.setInterval(() => {
//   console.log("hello");
// }, 5000);
