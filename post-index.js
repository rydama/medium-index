chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "addPost") {
      addPost(request); // ryanm .call(request.message) ?
    } else if (request.message === "complete") {
      complete(request);
    }
  }
);

function addPost(request) {
  console.log("got addPost message")
  $("#content").prepend('<a href="' + request.url + '">' + request.title + '</a> ' + moment(request.publishedAt).format("MMMM DD, YYYY") + '<br/>');
}

function complete(request) {
  NProgress.done();
}

$(function() {
  NProgress.start();
});