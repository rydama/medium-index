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
  var currentTime = new Date().getTime();
  var apiBaseUrl = "https://medium.com/_/api/";
  var userId = $("a[data-user-id]").attr("data-user-id");
  var url = apiBaseUrl + "users/" + userId + "/profile/stream?limit=8&to=" + currentTime + "&source=latest&page=1"


  $.ajax(url, {
    dataType: "text"
  })
  .done(function(text) {
    // trim ])}while(1);</x>
    // http://stackoverflow.com/questions/2669690/why-does-google-prepend-while1-to-their-json-responses
    cleaned = text.slice(16);
    json = JSON.parse(cleaned);
    console.log("paging path: " + json.payload.paging.path)
    // why is key quoted??
    posts = getPosts(json);

    $.each(posts, function(i, post) {
      chrome.runtime.sendMessage({
        "message": "addPost",
        "url": getPostUrl(post, json),
        "title": post.title,
        "publishedAt": post.latestPublishedAt});
    });

    chrome.runtime.sendMessage({
      "message": "complete"
    });

  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "finished" );
  });
}

function getPosts(data) {
  var postData = data.payload.references.Post;
  var posts = []
  for (var postId in postData) {
    posts.push(postData[postId]);
  }
  return posts;
}

function getPostUrl(post, data) {
  var collections = data.payload.references.Collection;
  return "https://medium.com/" +
    collections[post.homeCollectionId].slug + "/" +
    post.uniqueSlug;
}
