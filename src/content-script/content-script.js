import React from "react";
import ReactDom from "react-dom";
import App from "./App";
import { matchPrData } from "../match-pr-data";

const SUPER_UNIQUE_ID = "gh-pull-extension__";

let shouldRender = true;
let rootNodeCreated = false;
async function bootstrap() {
  let rootNode = document.getElementById(SUPER_UNIQUE_ID);

  const notificationForm = document.querySelector(".sidebar-notifications");
  if (rootNodeCreated && !rootNode) {
    shouldRender = true;
    rootNodeCreated = false;
  }

  if (!notificationForm) {
    return;
  }

  if (shouldRender && matchPrData(window.location.href)) {
    if (rootNode) {
      rootNode.remove();
    }
    rootNode = document.createElement("div");
    rootNode.id = SUPER_UNIQUE_ID;
    rootNode.className = "discussion-sidebar-item js-discussion-sidebar-item";
    notificationForm.insertAdjacentElement("afterend", rootNode);
    rootNodeCreated = true;
    ReactDom.render(<App></App>, document.getElementById(SUPER_UNIQUE_ID));
    shouldRender = false;
  }
}

window.setInterval(bootstrap, 500);
