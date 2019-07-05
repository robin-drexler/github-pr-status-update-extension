/**
 * Todo:
 *
 * - remove merged PRs
 * - options page for token
 */

import browser from "webextension-polyfill";

import queryPr, { extractPrData } from "./query-pr.js";
import { getAllPrs, getToken, setPr } from "./storage";

async function notificationClickHandler(notifictionId) {
  browser.notifications.clear(notifictionId);

  const { windowId } = await browser.tabs.create({ url: notifictionId });
  await browser.windows.update(windowId, { focused: true });
}

async function checkStatuses() {
  const storedPRs = await getAllPrs();
  storedPRs.map(async item => {
    const { owner, repository, number, status } = item;
    const token = await getToken();
    if (!token) {
      return;
    }

    try {
      const pr = await queryPr({ owner, repository, number, token });
      if (pr.errors) {
        return;
      }
      const { status: newStatus, url, title } = extractPrData(pr);
      console.log(
        "checking",
        owner,
        repository,
        number,
        status,
        newStatus,
        status === newStatus
      );

      if (newStatus !== status) {
        createNotification(url, {
          type: "basic",
          title: newStatus,
          message: `${owner}/${repository}#${number}: ${title}`,
          iconUrl: "./img/icons/icon_256.png",
          buttons: [{ title: "show" }],
          requireInteraction: true
        });

        await setPr({ ...item, status: newStatus });
      }
    } catch (error) {
      console.error(error);
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

function createNotification(
  id,
  { title, message, iconUrl, type, requireInteraction, buttons }
) {
  const isFirefox = browser.runtime.getURL("/").startsWith("moz");

  const additionalOptions = isFirefox ? {} : { requireInteraction, buttons };

  return browser.notifications.create(id, {
    message,
    type,
    title,
    iconUrl,
    ...additionalOptions
  });
}

const DEBUGFUNCTIONS = {
  createNotification() {
    createNotification("https://google.com", {
      type: "basic",
      title: "PR status changed",
      message: `test test can thi\nddd`,
      iconUrl: "./img/icons/icon_256.png",
      buttons: [{ title: "show" }],
      requireInteraction: true
    });
  }
};

// DEBUGFUNCTIONS.createNotification();
