chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "get_element_count" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
      chrome.runtime.sendMessage({"message": "new_post", "url": firstHref});

    }
  }
);