chrome.devtools.panels.create(
    "Request Tracker", // Title
    "", // Icon
    "panel.html", // HTML page for the panel
    function (panel) {
        // You can hook into panel lifecycle here
        console.log("Custom DevTools panel created.");
    }
);
