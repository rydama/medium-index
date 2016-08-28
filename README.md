# Medium Index

Create a chronological index from your favorite Medium author

## Installing from the Chrome app store

## Using it

- Go to a medium author page, such as https://medium.com/@shpigford
- Click the Medium Index button

(medium-index-button.png?raw=true)


## Developing

### Loading the extension locally

### Reloading

- Click Reload in chrome://extensions
- Refresh the Medium page
- Click the Medium Index button to open the index for the Medium page

### Debugging

#### Background script

- logging
- breakpoints

#### Content script

- logging
- breakpoints
    - open devtools on the content page
    - add `debugger;` to the content script
    - or open the Content Scripts subtab under Sources, find your file and set a breakpoint

#### Other UI page scripts

