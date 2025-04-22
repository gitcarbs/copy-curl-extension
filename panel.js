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

function buildCurlCommand(request) {
    const { method, url, headers, postData } = request.request;
    let command = [`curl '${url}'`];

    if (method !== "GET") {
        command.push(`-X ${method}`);
    }

    headers.forEach(({ name, value }) => {
        if (name.toLowerCase() === "content-length") return;
        command.push(`-H '${name}: ${value}'`);
    });

    if (postData?.text) {
        const escapedData = postData.text.replace(/'/g, `'\\''`);
        command.push(`--data-raw '${escapedData}'`);
    }

    command.push(`--compressed`);

    return command.join(" \\\n  ");
}

function renderFilteredRequests() {
    const filter = searchInput.value.toLowerCase();
    logEl.innerHTML = "";

    allRequests.forEach(({ method, url, status, curl, postData }) => {
        const combined = `${method} ${url} ${status}`.toLowerCase();
        if (!combined.includes(filter)) return;

        const row = document.createElement("div");
        row.className = "row";
        row.classList.add(status >= 400 ? "error" : "success");

        const methodEl = document.createElement("div");
        methodEl.className = "method";
        methodEl.textContent = method;

        const urlEl = document.createElement("div");
        urlEl.className = "url";
        urlEl.textContent = url;

        const statusEl = document.createElement("div");
        statusEl.className = "status";
        statusEl.textContent = status;

        const copyCurlBtn = document.createElement("button");
        copyCurlBtn.textContent = "Copy cURL";
        copyCurlBtn.className = "btn";
        copyCurlBtn.onclick = () => {
            const textarea = document.createElement("textarea");
            textarea.value = curl;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                copyCurlBtn.textContent = "Copied!";
            } catch (err) {
                console.error("Copy failed", err);
                copyCurlBtn.textContent = "Copy failed";
            }
            document.body.removeChild(textarea);
            setTimeout(() => (copyCurlBtn.textContent = "Copy cURL"), 1000);
        };

        const copyTokenBtn = document.createElement("button");
        copyTokenBtn.textContent = "Copy Token";
        copyTokenBtn.className = "btn";
        copyTokenBtn.onclick = () => {
            const tokenHeader = allRequests
                .find((req) => req.url === url)
                ?.headers.find(
                    (header) => header.name.toLowerCase() === "authorization"
                );

            if (tokenHeader && tokenHeader.value.startsWith("Bearer ")) {
                const token = tokenHeader.value.slice(7); // Strip "Bearer " prefix
                const textarea = document.createElement("textarea");
                textarea.value = token;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand("copy");
                    copyTokenBtn.textContent = "Copied!";
                } catch (err) {
                    console.error("Copy failed", err);
                    copyTokenBtn.textContent = "Copy failed";
                }
                document.body.removeChild(textarea);
                setTimeout(
                    () => (copyTokenBtn.textContent = "Copy Token"),
                    1000
                );
            } else {
                alert("Bearer token not found in headers.");
            }
        };

        // Add View Payload button if there's postData
        const viewPayloadBtn = document.createElement("button");
        viewPayloadBtn.textContent = "View Payload";
        viewPayloadBtn.className = "btn";

        // Only show the button if there's postData
        if (postData && postData.trim()) {
            viewPayloadBtn.onclick = () => {
                try {
                    const jsonData = JSON.parse(postData);
                    const formattedJson = JSON.stringify(jsonData, null, 2);

                    // Check if a payload modal already exists
                    let modal = document.getElementById("payload-modal");
                    if (!modal) {
                        modal = document.createElement("div");
                        modal.id = "payload-modal";
                        modal.className = "modal";
                        document.body.appendChild(modal);
                    }

                    modal.innerHTML = `
                        <div class="modal-content">
                            <div class="modal-header">
                                <span class="close-modal">&times;</span>
                                <h2>Request Payload</h2>
                            </div>
                            <div class="modal-body">
                                <pre>${formattedJson}</pre>
                            </div>
                        </div>
                    `;

                    modal.style.display = "block";

                    // Add close functionality
                    const closeBtn = modal.querySelector(".close-modal");
                    closeBtn.onclick = () => {
                        modal.style.display = "none";
                    };

                    // Close when clicking outside the modal
                    window.onclick = (event) => {
                        if (event.target === modal) {
                            modal.style.display = "none";
                        }
                    };
                } catch (e) {
                    alert("Failed to parse payload as JSON: " + e.message);
                }
            };
            row.appendChild(viewPayloadBtn);
        }

        row.appendChild(methodEl);
        row.appendChild(urlEl);
        row.appendChild(statusEl);
        row.appendChild(copyCurlBtn);
        row.appendChild(copyTokenBtn);
        if (postData && postData.trim()) {
            row.appendChild(viewPayloadBtn);
        }
        logEl.appendChild(row);
    });

    // Ensure auto-scroll happens after the DOM is updated
    requestAnimationFrame(() => {
        logEl.scrollTop = logEl.scrollHeight;
    });
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

    const curl = buildCurlCommand(request);
    const postDataText = postData?.text || "";

    // Include headers and postData in the stored request object
    allRequests.push({
        method,
        url,
        status,
        curl,
        headers,
        postData: postDataText,
    });
    renderFilteredRequests();

    // Force scroll to bottom after adding a new request
    // Use multiple approaches to ensure it works
    setTimeout(() => {
        logEl.scrollTop = logEl.scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);

        // Another attempt with RAF for more reliability
        requestAnimationFrame(() => {
            logEl.scrollTop = logEl.scrollHeight;
        });
    }, 50);
});
