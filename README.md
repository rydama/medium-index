# Medium Index

Create a chronological index of posts from your favorite Medium author.

## Available on the Chrome app store

- https://chrome.google.com/webstore/detail/medium-index/kfplffpjlibemfbjicocjpjepgidpdga

## Using it

- Go to a medium author page, such as https://medium.com/@shpigford
- Click the Medium Index button
- A new page will open listing all posts in chronological order

![Medium Index Button](medium-index-button.png?raw=true)

## Developing

### Loading the extension locally

- Go to chrome://extensions
- Check the "Developer mode" checkbox
- Then click the "Load unpacked extension" button and navigate to the `extension` directory in the filesystem

### Reloading

After making changes, you'll need to:

1. Click Reload in chrome://extensions
2. Refresh the Medium page that you're trying to index
3. Click the Medium Index button to open the index for the Medium page

### Extension code

The extension code is found in the [extension](https://github.com/rydama/medium-index/tree/master/extension) directory.

- `content.js` This is the code that runs on the Medium page, such as https://medium.com/@shpigford. It is responsible for reading the DOM and making calls to the internal Medium api to fetch the author's posts.
- `background.js` This code runs whenever the extension is loaded. It manages the listeners and sends messages to control the content script and post-index script.
- `post-index.html/js` This page/code is created whenever the user clicks the Medium Index button. It receives messages from the content script and adds html for each post.

### Debugging

Be aware of what page each script is running on. You need to open devtools on
the correct page in order to see console logging and debug the corresponding script.

### Building a new version

- Be sure to update version in `manifest.json`
- Run ./build.sh to create a new extension.zip in the current directory
- Upload the new zip to the Chrome store


