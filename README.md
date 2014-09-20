## Chrom Window Sync

This is a tiny chrome extension for syncing the tab URL across multiple open windows. The tab that is open when the extension icon is clicked becomes the master tab. Any URL changes in the master tab are pushed to any active tabs in other windows via `history.pushState`. Because it uses pushState Chrome Window Sync will only work on javascript apps that utilize the HTML5 History API.
