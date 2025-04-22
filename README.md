# XHR Request Viewer

## Overview

The **XHR Request Viewer** is a Chrome extension designed to help developers view and copy XHR (XMLHttpRequest) requests as cURL commands. This tool simplifies debugging and testing by allowing developers to easily replicate network requests in their terminal or other tools.

## Features

- **View XHR Requests**: Inspect all XHR requests made by a webpage.
- **Copy as cURL**: Quickly copy any XHR request as a cURL command for use in the terminal.
- **Permissions**:
  - `webRequest` and `webRequestBlocking`: To monitor and intercept network requests.
  - `activeTab`: To access the currently active tab.
  - `clipboardWrite`: To copy cURL commands to the clipboard.
- **Host Permissions**: Supports all URLs (`<all_urls>`).

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the folder containing this extension.

## Usage

1. Open the Chrome Developer Tools (`F12` or `Ctrl+Shift+I`).
2. Navigate to the **XHR Request Viewer** tab.
3. View the list of XHR requests and click the "Copy as cURL" button to copy the desired request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.