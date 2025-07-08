chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_TOKEN") {
    chrome.storage.local.get("token", (result) => {
      sendResponse({ token: result.token });
    });
    return true;
  }
});
