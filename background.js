/**
 * Chrome extension background script.
 *
 * This script runs whenever the extension is loaded. It manages the listeners and sends messages
 * to control the content script and post-index script.
 */
{
  let contentTab = null;
  let indexTab = null;

  /**
   * The listener for our page action button click. This click is what kicks off the
   * creation of the index page and the fetching of posts.
   */
  chrome.pageAction.onClicked.addListener(function(tab) {
    contentTab = tab;

    // Create an index page to contain Medium post links.
    chrome.tabs.create({ 'url': chrome.extension.getURL('post-index.html') }, function(theIndexTab) {
      indexTab = theIndexTab;
      // Tell the content script to start fetching posts for this index page.
      chrome.tabs.sendMessage(tab.id, {
        "message": "startFetchingPosts",
        "tabId": theIndexTab.id
      });
    });
  });

  /**
   * Add a listener for tab removal. We want to stop fetching posts if the index tab we're
   * building happens to be closed during the process.
   */
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

  /**
   * Add a listener for a new tab being added.
   */
  chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (change.status == "complete") {
      updateActionEnablement();
    }
  });

  /**
   * Add a listener for selected tab changed.
   */
  chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
    updateActionEnablement();
  });

  /**
   * Show the extension's page action, only if the page is a medium.com page.
   */
  function updateActionEnablement() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let activeTab = tabs[0];
      if (activeTab.url.indexOf("https://medium.com/") >= 0) {
        chrome.pageAction.show(activeTab.id);
      }
    });
  };
}
