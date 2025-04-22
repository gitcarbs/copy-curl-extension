chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        chrome.runtime.sendMessage({
            type: "xhrRequest",
            details: details,
        });
    },
    { urls: ["<all_urls>"] },
    []
);
