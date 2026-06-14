// Runs on every github.com page. Responds to messages from the popup
// asking for the current page URL.
chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg.type === 'GET_REPO_URL') {
    respond({ url: window.location.href });
  }
  return true;
});
