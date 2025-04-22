/**
 * Builds a cURL command from a request object
 * @param {Object} request - Request object
 * @returns {string} Formatted cURL command
 */
export function buildCurlCommand(request) {
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

/**
 * Format JSON data with proper indentation
 * @param {string} jsonString - JSON string to format
 * @returns {string} Formatted JSON string
 */
export function formatJSON(jsonString) {
    try {
        const jsonData = JSON.parse(jsonString || "{}");
        return JSON.stringify(jsonData, null, 2);
    } catch (e) {
        console.error("Failed to parse JSON:", e);
        return "Error parsing JSON: " + e.message;
    }
}
