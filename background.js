{
  let contentTab = null;
  let indexTab = null;

  function updateActionEnablement() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      let activeTab = tabs[0];
      if (activeTab.url.indexOf("https://medium.com/") >= 0) {
        chrome.pageAction.show(activeTab.id);
      }
    });
  };

  chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status == "complete") {
      updateActionEnablement();
    }
  });

  chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
    updateActionEnablement();
  });

  chrome.tabs.onRemoved.addListener(function(tabId) {
    // If the index tab is closed, stop fetching posts.
    if (tabId == indexTab.id) {
      if (contentTab) {
        chrome.tabs.sendMessage(contentTab.id, {
          "message": "stopFetchingPosts"
        });
      }
    }
  });

  chrome.pageAction.onClicked.addListener(function(tab) {
    contentTab = tab;

    // Create an index page to contain Medium post links.
    chrome.tabs.create({'url': chrome.extension.getURL('post-index.html') }, function(theIndexTab) {
      indexTab = theIndexTab;
      // Tell the content script to start fetching posts for this index page.
      chrome.tabs.sendMessage(tab.id, {
        "message": "startFetchingPosts",
        "tabId": theIndexTab.id
      });
    });
  });
}