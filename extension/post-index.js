/**
 * Script for the post-index page. This page is created whenever the user
 * clicks the Medium Index button. It receives messages from the content script
 * and adds the post html accordingly.
 */
{
  let tabId = null;
  let postTemplate = null;

  /**
   * Store our own tabId for later comparison.
   */
  chrome.tabs.query({active:true, windowType:"normal", currentWindow: true},
    function(tabs) {
      tabId = tabs[0].id;
    }
  );

  /**
   * Listener for receiving messages from the content script.
   */
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.tabId != tabId) {
        return;
      }

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

  /**
   * Prepend a post to the DOM, so they appear in chronological order.
   */
  function addPost(request) {
    let publishedAt = moment(request.publishedAt).format("MMMM DD, YYYY");
    let html = postTemplate({
      url: request.url,
      title: request.title,
      authorName: request.authorName,
      imageUrl: request.imageUrl,
      recommends: request.recommends,
      responses: request.responses,
      publishedAt: publishedAt
    });
    $("#content").prepend(html);
  }

  function complete(request) {
    NProgress.done();
  }

  function failed(request) {
    //ryanm string interpolate
    $("#content").prepend("<h3>Error: " + request.error + "</h3>");
    NProgress.done();
  }

  function interrupted(request) {
    NProgress.done();
  }

  $(function() {
    postTemplate = Handlebars.compile($("#post-template").html());

    NProgress.configure({
      trickleRate: 0.05,
      showSpinner: false
    });

    NProgress.start();
  });
}
