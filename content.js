// chrome.tabs.onRemoved.addListener(function (tabId) {
//   console.log("closed: " + tabId)
//   // todo cancel post fetching for this closed tab
// });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "startFetchingPosts") {
      startFetchingPosts(request.tabId);
    } else if (request.message === "stopFetchingPosts") {
      stopFetchingPosts();
    }
  }
);


var interrupted = false;
var baseUserUrl = $('meta[property="al:web:url"]').attr('content')

function getPostsFromPage() {
  document.querySelectorAll("article.postArticle a")
}

/**
 * Start fetching the post lists via the medium (internal) api.
 */
function startFetchingPosts(tabId) {
  var currentTime = new Date().getTime();
  var apiBaseUrl = "https://medium.com/_/api/";
  var userId = $("a[data-user-id]").attr("data-user-id");
  var url = apiBaseUrl + "users/" + userId + "/profile/stream?limit=8&to=" + currentTime + "&source=latest&page=1"

  interrupted = false;
  fetchPosts(url);
}

var foo = 0;

function fetchPosts(url) {
  console.log("fetching " + url);

  $.ajax(url, {
    // Use 'text' since there is a security prefix on the returned json.
    dataType: "text"
  })
  .done(function(text) {
    try {
      foo++;
      json = stripSecurityPrefix(text);
      nextUrl = processPosts(json);
      if (foo > 3 || interrupted) {
        console.log("fetchPosts interrupted");
        chrome.runtime.sendMessage({"message": "interrupted"});
      } else if (nextUrl) {
        // Be nice to the server :)
        setTimeout(function() {
          fetchPosts(nextUrl)
        }, 1000);
      } else {
        chrome.runtime.sendMessage({"message": "complete"});
      }
    } catch(err) {
      console.log("There was a problem creating the index. " + err.message);
    }
  })
  .fail(function(jqXHR, textStatus, error) {
    chrome.runtime.sendMessage({"message": "failed", "error": jqXHR.responseText});
  });
}

function processPosts(data) {
  posts = getPosts(json);

  $.each(posts, function(i, post) {
    chrome.runtime.sendMessage({
      // ryanm why is key quoted??
      "message": "addPost",
      "url": getPostUrl(post, data),
      "title": post.title,
      "publishedAt": post.latestPublishedAt});
  });

  if (data.payload.paging.next) {
    var url = "https://medium.com" +
      data.payload.paging.path +
      "?limit=" + data.payload.paging.next.limit +
      "&to=" + data.payload.paging.next.to +
      "&source=" + data.payload.paging.next.source +
      "&page=" + data.payload.paging.next.page;
    return url;
  }

  return null;
}

/**
 * Medium internal api reponses are prefixed with some js that prevents eval, and also
 * causes JSON.parse to fail, so we need to strip it off.
 * See also: http://stackoverflow.com/questions/2669690/why-does-google-prepend-while1-to-their-json-responses
 *
 * Returns a json object.
 */
function stripSecurityPrefix(response) {
  // Strip off the...  ])}while(1);</x>
  var cleaned = response.slice(16);
  return JSON.parse(cleaned);
}

function fetchPost(url) {
  return $.ajax(url, {
    // Use 'text' since there is a security prefix on the returned json.
    dataType: "text"
  })
  .done(function(text) {
    // Strip the security prefix...  ])}while(1);</x>
    // http://stackoverflow.com/questions/2669690/why-does-google-prepend-while1-to-their-json-responses
    cleaned = text.slice(16);
    json = JSON.parse(cleaned);
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

  var url = "https://medium.com/";
  if (post.homeCollectionId && post.homeCollectionId.length) {
    url += collections[post.homeCollectionId].slug + "/";
  } else {
    console.log("no collection: " + post.uniqueSlug)
    url = baseUserUrl;
  }
  url += post.uniqueSlug;
  return url;
}

function stopFetchingPosts() {
  interrupted = true;
}