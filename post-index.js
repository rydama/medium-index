chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "addPost") {
      addPost(request); // ryanm .call(request.message) ?
    } else if (request.message === "complete") {
      complete(request);
    } else if (request.message === "failed") {
      failed(request);
    } else if (request.message === "interrupted") {
      interrupted(request);
    }
  }
);

function addPost(request) {
  console.log("got addPost message")
  $("#content").prepend('<a target="_blank" href="' + request.url + '">' + request.title + '</a> ' + moment(request.publishedAt).format("MMMM DD, YYYY") + '<br/>');
}

function complete(request) {
  $("#content").prepend("<h3>Done!</h3>");
  NProgress.done();
}

function failed(request) {
  $("#content").prepend("<h3>failed: " + request.error +  "</h3>");
  NProgress.done();
}

function interrupted(request) {
  $("#content").prepend("<h3>interrupted!</h3>");
  NProgress.done();
}

$(function() {
  NProgress.start();
});