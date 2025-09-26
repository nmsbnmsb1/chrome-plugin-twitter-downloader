document.addEventListener('DOMContentLoaded', function () {
    const clearHistroyBtn = document.getElementById('clearHistroyBtn');
    const newListName = document.getElementById('newListName');
    const newListId = document.getElementById('newListId');
    const addListBtn = document.getElementById('addListBtn');
    const listsContainer = document.getElementById('listsContainer');
    const emptyState = document.getElementById('emptyState');

    let twitterLists = [];

    // Load saved lists from storage
    function loadLists() {
        chrome.storage.local.get(['twitter_lists'], function (result) {
            twitterLists = result.twitter_lists || [];
            renderLists();
        });
    }

    // Save lists to storage
    function saveLists() {
        chrome.storage.local.set({ twitter_lists: twitterLists });
    }

    // Render the lists
    function renderLists() {
        if (twitterLists.length === 0) {
            listsContainer.innerHTML = '<div class="empty-state">No lists configured. Add a list above to get started.</div>';
            return;
        }

        let html = '';
        twitterLists.forEach((list, index) => {
            html += `
                <div class="list-item">
                    <input type="checkbox" class="list-checkbox"
                           ${list.enabled ? 'checked' : ''}
                           data-index="${index}">
                    <div class="list-info">
                        <div class="list-name">${escapeHtml(list.name)}</div>
                        <div class="list-id">ID: ${escapeHtml(list.id)}</div>
                    </div>
                    <button class="list-remove" data-index="${index}" title="Remove list">×</button>
                </div>
            `;
        });
        listsContainer.innerHTML = html;

        // Add event listeners
        document.querySelectorAll('.list-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });

        document.querySelectorAll('.list-remove').forEach(button => {
            button.addEventListener('click', handleRemoveList);
        });
    }

    // Handle checkbox change
    function handleCheckboxChange(event) {
        const index = parseInt(event.target.dataset.index);
        twitterLists[index].enabled = event.target.checked;
        saveLists();
    }

    // Handle remove list
    function handleRemoveList(event) {
        const index = parseInt(event.target.dataset.index);
        twitterLists.splice(index, 1);
        saveLists();
        renderLists();
    }

    // Handle add list
    addListBtn.addEventListener('click', () => {
        const name = newListName.value.trim();
        const id = newListId.value.trim();

        if (!name || !id) {
            showMessage('Please enter both list name and ID', 'error');
            return;
        }

        // Check if list already exists
        if (twitterLists.some(list => list.id === id)) {
            showMessage('This list ID already exists', 'error');
            return;
        }

        // Add new list
        twitterLists.push({
            name: name,
            id: id,
            enabled: true
        });

        saveLists();
        renderLists();

        // Clear inputs
        newListName.value = '';
        newListId.value = '';

        showMessage('List added successfully!', 'success');
    });

    // Show message
    function showMessage(message, type) {
        addListBtn.textContent = message;
        addListBtn.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        setTimeout(() => {
            addListBtn.textContent = 'Add List';
            addListBtn.style.backgroundColor = '';
        }, 2000);
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Handle Enter key in inputs
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            addListBtn.click();
        }
    }

    newListName.addEventListener('keydown', handleEnterKey);
    newListId.addEventListener('keydown', handleEnterKey);

    // Clear history functionality
    clearHistroyBtn.addEventListener('click', async () => {
        await chrome.storage.local.set({ ['download_history']: [] });
        clearHistroyBtn.textContent = 'Cleared!';
        clearHistroyBtn.style.backgroundColor = '#ffffff';
        setTimeout(() => {
            clearHistroyBtn.textContent = 'Clear History';
            clearHistroyBtn.style.backgroundColor = '';
        }, 1500);
    });

    // Initialize
    loadLists();
});