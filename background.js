
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
  console.log("you clicked it");
  // Open a new tab
  chrome.tabs.create({'url': chrome.extension.getURL('mediumindex.html')}, function(tab) {
    console.log("opened: " + tab.id)
  });


   // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    console.log("sending message");
    chrome.tabs.sendMessage(activeTab.id, {"message": "get_element_count"});
  });

  url = "https://medium.com/_/api/users/46b03c875ccb/profile/stream?limit=8&to=1469940062507&source=latest&page=1"

  $.ajax(url, {
    dataType: "text"
  })
  .done(function(text) {
    console.log( " success" );

    // trim ])}while(1);</x>
    // http://stackoverflow.com/questions/2669690/why-does-google-prepend-while1-to-their-json-responses
    cleaned = text.slice(16);
    json = JSON.parse(cleaned);
    console.log(json.success)
    console.log(json.payload.streamItems.length)
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "finished" );
  });

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "new_post" ) {
      console.log("got it: " + request.url);
    }
  }
);
