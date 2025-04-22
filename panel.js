import { createModal, copyToClipboard } from "./modal.js";
import { buildCurlCommand, formatJSON } from "./utils.js";

const logEl = document.getElementById("log");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear");

const allRequests = [];

searchInput.addEventListener("input", () => {
    renderFilteredRequests();
});

clearBtn.addEventListener("click", () => {
    allRequests.length = 0;
    searchInput.value = "";
    renderFilteredRequests();
});

function renderFilteredRequests() {
    const filter = searchInput.value.toLowerCase();
    logEl.innerHTML = "";

    allRequests.forEach(
        ({ method, url, status, curl, postData, responseBody, headers }) => {
            const combined = `${method} ${url} ${status}`.toLowerCase();
            if (!combined.includes(filter)) return;

            const row = createRequestRow(
                method,
                url,
                status,
                curl,
                postData,
                responseBody,
                headers
            );
            logEl.appendChild(row);
        }
    );

    // Ensure auto-scroll happens after the DOM is updated
    requestAnimationFrame(() => {
        logEl.scrollTop = logEl.scrollHeight;
    });
}

/**
 * Creates a row for a request in the UI
 */
function createRequestRow(
    method,
    url,
    status,
    curl,
    postData,
    responseBody,
    headers
) {
    const row = document.createElement("div");
    row.className = "row";
    row.classList.add(status >= 400 ? "error" : "success");

    // Create method, URL, and status elements
    const methodEl = createTextElement("div", "method", method);
    const urlEl = createTextElement("div", "url", url);
    const statusEl = createTextElement("div", "status", status);

    // Create cURL copy button
    const copyCurlBtn = createButton("Copy cURL", () => {
        copyToClipboard(curl, copyCurlBtn, "Copy cURL");
    });

    // Create token copy button
    const copyTokenBtn = createButton("Token", () => {
        const tokenHeader = headers.find(
            (header) => header.name.toLowerCase() === "authorization"
        );
        if (tokenHeader && tokenHeader.value.startsWith("Bearer ")) {
            const token = tokenHeader.value.slice(7); // Strip "Bearer " prefix
            copyToClipboard(token, copyTokenBtn, "Copy Token");
        } else {
            alert("Bearer token not found in headers.");
        }
    });

    // Create view response button
    const viewResponseBtn = createButton("Resp", () => {
        try {
            const formattedJson = formatJSON(responseBody);
            createModal(
                "response-modal",
                "Response Body",
                formattedJson,
                "Copy Response"
            );
        } catch (e) {
            alert("Failed to parse response as JSON: " + e.message);
        }
    });

    // Always create view payload button for consistent spacing
    const viewPayloadBtn = createButton("Req", () => {
        if (!postData || !postData.trim()) {
            alert("No request payload data available.");
            return;
        }
        try {
            const formattedJson = formatJSON(postData);
            createModal(
                "payload-modal",
                "Request Payload",
                formattedJson,
                "Copy Payload"
            );
        } catch (e) {
            alert("Failed to parse payload as JSON: " + e.message);
        }
    });

    // Disable the button if no payload data
    if (!postData || !postData.trim()) {
        viewPayloadBtn.disabled = true;
        viewPayloadBtn.classList.add("disabled-btn");
    }

    // Append all elements to the row in desired order - always include viewPayloadBtn
    row.appendChild(viewPayloadBtn);
    row.appendChild(viewResponseBtn);
    row.appendChild(methodEl);
    row.appendChild(urlEl);
    row.appendChild(statusEl);
    row.appendChild(copyCurlBtn);
    row.appendChild(copyTokenBtn);

    return row;
}

/**
 * Helper function to create a text element
 */
function createTextElement(tag, className, textContent) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = textContent;
    return element;
}

/**
 * Helper function to create a button with an onclick handler
 */
function createButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = "btn";
    button.onclick = onClick;
    return button;
}

chrome.devtools.network.onRequestFinished.addListener((request) => {
    const { method, url, headers, postData } = request.request;
    const status = request.response.status;

    // Ignore requests with "app.pendo.io" in the URL
    if (url.includes("app.pendo.io")) return;

    // Only keep XHR/fetch requests
    const isXHR =
        request._resourceType === "xhr" ||
        request.request.headers.some(
            (h) =>
                h.name.toLowerCase() === "x-requested-with" &&
                h.value.toLowerCase() === "xmlhttprequest"
        );
    if (!isXHR) return;

    request.getContent((content) => {
        const curl = buildCurlCommand(request);
        const postDataText = postData?.text || "";

        allRequests.push({
            method,
            url,
            status,
            curl,
            headers,
            postData: postDataText,
            responseBody: content,
        });
        renderFilteredRequests();
    });

    // Force scroll to bottom after adding a new request
    setTimeout(() => {
        logEl.scrollTop = logEl.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
        requestAnimationFrame(() => {
            logEl.scrollTop = logEl.scrollHeight;
        });
    }, 50);
});
