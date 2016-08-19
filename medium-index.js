chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "addPost") {
      console.log("got addPost message")
      $("#content").prepend('<a href="' + request.url + '">' + request.title + '</a> ' + moment(request.publishedAt).format("MMMM DD, YYYY") + '<br/>');
    }
  }
);

