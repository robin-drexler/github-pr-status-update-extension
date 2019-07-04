console.log("loesl");

chrome.storage.local.get(null, r => {
  console.log(r);
});
