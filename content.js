{
  let interrupted = false;
  let baseUserUrl = $('meta[property="al:web:url"]').attr('content')

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === "startFetchingPosts") {
        startFetchingPosts(request.tabId);
      } else if (request.message === "stopFetchingPosts") {
        stopFetchingPosts();
      }
    }
  );


  // May need is we need to get posts off the page instead of via api, for authors with only a few
  // that don't show up in the api????
  // function getPostsFromPage() {
  //   document.querySelectorAll("article.postArticle a")
  // }

  /**
   * Start fetching the post lists via the medium (internal) api.
   */
  function startFetchingPosts(indexTabId) {
    let currentTime = new Date().getTime();
    let apiBaseUrl = "https://medium.com/_/api/";
    let userId = $("a[data-user-id]").attr("data-user-id");
    let url = apiBaseUrl + "users/" + userId + "/profile/stream?limit=8&to=" + currentTime + "&source=latest&page=1"

    interrupted = false;
    fetchPosts(url, indexTabId);
  }

  let foo = 0;

  function fetchPosts(url, indexTabId) {
    $.ajax(url, {
        // Use 'text' since there is a security prefix on the returned json.
        dataType: "text"
      })
      .done(function(text) {
        try {
          foo++;
          let json = stripSecurityPrefix(text);
          let nextUrl = processPosts(json, indexTabId);
          if (foo > 1 || interrupted) {
            chrome.runtime.sendMessage({
              "message": "interrupted",
              "tabId": indexTabId
            });
          } else if (nextUrl) {
            // Be nice to the server :)
            setTimeout(function() {
              fetchPosts(nextUrl)
            }, 1000);
          } else {
            chrome.runtime.sendMessage({
              "message": "complete",
              "tabId": indexTabId
            });
          }
        } catch (err) {
          console.log("MediumPress: there was a problem creating the index. " + err.message);
        }
      })
      .fail(function(jqXHR, textStatus, error) {
        chrome.runtime.sendMessage({
          "message": "failed",
          "tabId": indexTabId,
          "error": jqXHR.responseText
        });
      });
  }

  function processPosts(data, indexTabId) {
    posts = getPosts(data);

    for (let post of posts) {
      let user = getUser(post.creatorId, data)
      chrome.runtime.sendMessage({
        // ryanm why is key quoted??
        "message": "addPost",
        "tabId": indexTabId,
        "url": getPostUrl(post, data),
        "title": post.title,
        "authorName": user.name,
        "imageUrl": getImageUrl(user),
        "recommends": getRecommendsCount(post),
        "responses": getResponsesCount(post),
        "publishedAt": post.latestPublishedAt
      });
    }

    if (data.payload.paging.next) {
      let url = "https://medium.com" +
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
    let cleaned = response.slice(16);
    return JSON.parse(cleaned);
  }

  function getImageUrl(user) {
    return "https://cdn-images-1.medium.com/fit/c/72/72/" + user.imageId;
  }

  function getRecommendsCount(post) {
    return post.virtuals.recommends;
  }

  function getResponsesCount(post) {
    return post.virtuals.responsesCreatedCount;
  }

  function fetchPost(url) {
    return $.ajax(url, {
        // Use 'text' since there is a security prefix on the returned json, which causees
        // trouble for jQuery if using dataType: json.
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
    let postData = data.payload.references.Post;
    let posts = []
    for (let postId in postData) {
      posts.push(postData[postId]);
    }
    return posts;
  }

  function getUser(userId, data) {
    let userData = data.payload.references.User;
    return userData[userId];
  }

  function getPostUrl(post, data) {
    let collections = data.payload.references.Collection;

    let url = "https://medium.com/";
    if (post.homeCollectionId && post.homeCollectionId.length) {
      url += collections[post.homeCollectionId].slug + "/";
    } else {
      url = baseUserUrl;
    }
    url += post.uniqueSlug;
    return url;
  }

  function stopFetchingPosts() {
    interrupted = true;
  }
}