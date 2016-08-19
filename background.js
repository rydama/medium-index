
console.log("hello background")

function updateActionEnablement() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    if (activeTab.url.indexOf('://medium.com/') >= 0) {
      chrome.pageAction.show(activeTab.id);
    }
  });
};

 // Enabled the button on the active tab.
// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.pageAction.show(tabs[0].id);
// });

chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
  if (change.status == "complete") {
    updateActionEnablement();
  }
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
  updateActionEnablement();
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  console.log("closed: " + tabId)
});


chrome.pageAction.onClicked.addListener(function(tab) {
  // Create an index page to contain Medium post links.
  chrome.tabs.create({'url': chrome.extension.getURL('post-index.html')}, function(indexTab) {
    // Tell the content script to start fetching posts for this index page.
    // can't sent to content this way: chrome.runtime.sendMessage({"message": "startFetchingPosts", "tabId": tab.id});
    chrome.tabs.sendMessage(tab.id, {"message": "startFetchingPosts", "tabId": indexTab.id });
  });
});
