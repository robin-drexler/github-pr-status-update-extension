import React from "react";
import ReactDom from "react-dom";
import App from "./App";

const SUPER_UNIQUE_ID = "gh-pull-extension__";

async function bootstrap() {
  let rootNode = document.getElementById(SUPER_UNIQUE_ID);
  const notificationForm = document.querySelector(".sidebar-notifications");
  if (rootNode || !notificationForm) {
    return;
  }

  rootNode = document.createElement("div");
  rootNode.id = SUPER_UNIQUE_ID;
  rootNode.className = "discussion-sidebar-item js-discussion-sidebar-item";
  notificationForm.insertAdjacentElement("afterend", rootNode);
  ReactDom.render(<App></App>, rootNode);
}

window.setInterval(bootstrap, 1000);
