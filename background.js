
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


chrome.pageAction.onClicked.addListener(function(tab) {
  console.log("you clicked it");

   // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    console.log("sending message");
    chrome.tabs.sendMessage(activeTab.id, {"message": "get_element_count"});
  });

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "new_post" ) {
      console.log("got it: " + request.url);
    }
  }
);
