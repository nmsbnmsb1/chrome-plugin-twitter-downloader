// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
        chrome.downloads.download({
            url: request.task.url,
            filename: !request.task.saveAs ? `Twitter/${request.task.name}` : `Twitter`,
            saveAs: !request.task.saveAs ? false : true,
            conflictAction: 'uniquify'
        }).then((downloadId) => {
            sendResponse({ status: "resolved", downloadId });
        }).catch((error) => {
            sendResponse({ status: "rejected", error: error.message });
        })
    }
    return true;
});