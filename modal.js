/**
 * Creates and displays a modal dialog with content and copy functionality
 * @param {string} modalId - ID for the modal element
 * @param {string} title - Title to display in the modal header
 * @param {string} content - Content to display in the modal body
 * @param {string} copyButtonText - Text to display on the copy button
 */
export function createModal(modalId, title, content, copyButtonText) {
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        modal.className = "modal";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <span class="close-modal">&times;</span>
            <h2>${title}</h2>
            <button id="${modalId}-copy-btn" class="btn">${copyButtonText}</button>
        </div>
        <div class="modal-body">
            <pre>${content}</pre>
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

    // Add copy functionality
    const copyBtn = modal.querySelector(`#${modalId}-copy-btn`);
    copyBtn.onclick = () => {
        copyToClipboard(content, copyBtn, copyButtonText);
    };
}

/**
 * Copies text to clipboard and updates button text temporarily
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element to update
 * @param {string} originalText - Original button text to restore
 */
export function copyToClipboard(text, button, originalText) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        button.textContent = "Copied!";
    } catch (err) {
        console.error("Copy failed", err);
        button.textContent = "Copy failed";
    }
    document.body.removeChild(textarea);
    setTimeout(() => (button.textContent = originalText), 1000);
}
