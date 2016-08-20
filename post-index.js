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
  var context = {title: "My New Post", body: "This is my first post!"};
  var publishedAt = moment(request.publishedAt).format("MMMM DD, YYYY");
  var html = postTemplate({
    url: request.url,
    title: request.title,
    authorName: request.authorName,
    imageUrl: request.imageUrl,
    recommends: request.recommends,
    responses: request.responses,
    publishedAt: publishedAt});
  $("#content").prepend(html);
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
  NProgress.done();
}

$(function() {
  //ryanm IIFE
  postTemplateSource = $("#post-template").html();
  postTemplate = Handlebars.compile(postTemplateSource);

  NProgress.configure({ trickleRate: 0.05, showSpinner: false });
  NProgress.start();
});