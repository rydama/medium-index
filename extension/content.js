/**
 * Chrome extension content script.
 *
 * This script runs on all medium.com pages. It is responsible for reading the DOM
 * and making calls to the internal medium api to fetch the author's posts.
 */
{
  let interrupted = false;
  let baseUserUrl = getBaseUserUrl();

  /**
   * Add a listener for the start/stop fetching messages.
   */
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.message === "startFetchingPosts") {
        startFetchingPosts(request.tabId);
      } else if (request.message === "stopFetchingPosts") {
        stopFetchingPosts();
      }
    }
  );

  /**
   * Start fetching the post lists via the medium (internal) api.
   */
  function startFetchingPosts(indexTabId) {
    let currentTime = new Date().getTime();
    let apiBaseUrl = "https://medium.com/_/api/";
    let userId = $("a[data-user-id]").attr("data-user-id");
    let url = `${apiBaseUrl}users/${userId}/profile/stream?limit=8&to=${currentTime}&source=latest&page=1`

    interrupted = false;
    fetchPosts(url, indexTabId);
  }

  /**
   * Recursively fetch posts until we reach the end (there is no nextUrl).
   */
  function fetchPosts(url, indexTabId) {
    $.ajax(url, {
        // Use 'text' since there is a security prefix on the returned json.
        dataType: "text"
      })
      .done(function(text) {
        try {
          let json = stripSecurityPrefix(text);
          let nextUrl = processPosts(json, indexTabId);

          if (interrupted) {
            chrome.runtime.sendMessage({
              message: "interrupted",
              tabId: indexTabId
            });
          } else if (nextUrl) {
            // Be nice to the server :)
            setTimeout(function() {
              fetchPosts(nextUrl, indexTabId);
            }, 1000);
          } else {
            chrome.runtime.sendMessage({
              message: "complete",
              tabId: indexTabId
            });
          }
        } catch (err) {
          chrome.runtime.sendMessage({
            message: "failed",
            tabId: indexTabId,
            "error": `There was a problem creating the index. ${err.message}`
          });
        }
      })
      .fail(function(jqXHR, textStatus, error) {
        chrome.runtime.sendMessage({
          message: "failed",
          tabId: indexTabId,
          error: jqXHR.responseText
        });
      });
  }

  /**
   * Parse post info from the data and send it in a message (to be picked up by
   * the post-index script).
   */
  function processPosts(data, indexTabId) {
    posts = getPosts(data);

    for (let post of posts) {
      let user = getUser(post.creatorId, data)
      chrome.runtime.sendMessage({
        message: "addPost",
        tabId: indexTabId,
        url: getPostUrl(post, data),
        title: post.title,
        authorName: user.name,
        imageUrl: getImageUrl(user),
        recommends: getRecommendsCount(post),
        responses: getResponsesCount(post),
        publishedAt: post.firstPublishedAt
      });
    }

    if (data.payload.paging.next) {
      let paging = data.payload.paging;
      return `${paging.path}?limit=${paging.next.limit}&to=${paging.next.to}&source=${paging.next.source}&page=${paging.next.page}`;
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
    let url = null;
    let collectionSlug = getCollectionSlug(post, data);

    if (collectionSlug) {
      url = `https://medium.com/${collectionSlug}/`;
    } else {
      url = baseUserUrl;
    }

    // Some posts have an empty uniqueSlug. Fall back to slug-id.
    url = addUrlSegment(url, post.uniqueSlug || `${post.slug}-${post.id}`);
    return url;
  }

  function getCollectionSlug(post, data) {
    let collections = data.payload.references.Collection;

    if (collections) {
      if (post.homeCollectionId && post.homeCollectionId.length) {
        let collection = collections[post.homeCollectionId];
        if (collection) {
          return collection.slug;
        }
      }
    }
    return null;
  }

  function addUrlSegment(url, segment) {
    if (url.endsWith("/")) {
      return `${url}${segment}`;
    }

    return `${url}/${segment}`;
  }

  function stopFetchingPosts() {
    interrupted = true;
  }

  function getBaseUserUrl() {
    let baseUserUrl = $('meta[property="al:web:url"]').attr('content')

    // The url may be a post url like https://medium.com/@shpigford/do-you-work-alone,
    // so chop it down to just https://medium.com/@shpigford
    let parts = baseUserUrl.split("/")
    return `${parts[0]}//${parts[2]}/${parts[3]}`;
  }
}
