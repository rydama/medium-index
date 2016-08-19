// chrome.tabs.onRemoved.addListener(function (tabId) {
//   console.log("closed: " + tabId)
//   // todo cancel post fetching for this closed tab
// });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("got message: " + request.message);
    if (request.message === "startFetchingPosts") {
      startFetchingPosts(request.tabId);
    }
  }
);

function startFetchingPosts(tabId) {
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
    chrome.runtime.sendMessage({"message": "addPost", "url": "http://foo.com", "title": "hey hey"});
    // why is key quoted??
    //chrome.tabs.sendMessage(tabId, {"message": "addPost", "url": "http://foo.com", "title": "Yo Dawg"});

  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "finished" );
  });
}