document.addEventListener('DOMContentLoaded', function () {
    //const status = document.getElementById('status');
    //const downloadDir = document.getElementById('downloadDir');
    //const selectDirBtn = document.getElementById('selectDirBtn');
    const clearHistroyBtn = document.getElementById('clearHistroyBtn');

    // Load saved directory from storage
    // chrome.storage.local.get(['download_directory'], function (result) {
    //     if (result.download_directory) {
    //         downloadDir.value = result.download_directory;
    //     }
    // });

    // Handle directory selection
    // selectDirBtn.addEventListener('click', async () => {
    //     try {
    //         // Create a temporary download to trigger directory selection
    //         const downloadId = await chrome.downloads.download({
    //             url: 'data:text/plain;base64,',
    //             filename: 'select_directory.txt',
    //             saveAs: true
    //         });

    //         // Listen for the download complete event
    //         chrome.downloads.onChanged.addListener(function downloadListener(delta) {
    //             if (delta.id === downloadId && delta.state) {
    //                 if (delta.state.current === 'complete') {
    //                     // Get the directory path
    //                     chrome.downloads.search({ id: downloadId }, function (items) {
    //                         if (items && items[0]) {
    //                             const path = items[0].filename.split('/').slice(0, -1).join('/');
    //                             downloadDir.value = path;

    //                             // Save the directory path
    //                             chrome.storage.local.set({ download_directory: path }, function () {
    //                                 status.textContent = 'Ready to download';
    //                             });
    //                         }
    //                     });

    //                     // Remove the temporary file
    //                     chrome.downloads.removeFile(downloadId);
    //                     chrome.downloads.erase({ id: downloadId });

    //                     // Remove the listener
    //                     chrome.downloads.onChanged.removeListener(downloadListener);
    //                 }
    //             }
    //         });
    //     } catch (error) {
    //         status.textContent = 'Error selecting directory: ' + error.message;
    //     }
    // });


    clearHistroyBtn.addEventListener('click', async () => {
        await chrome.storage.local.set({ ['download_history']: [] });
    });
});