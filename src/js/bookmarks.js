/**
 * Web Checklist - Bookmarks Management
 */

const BOOKMARKS_STORAGE_KEY = 'web-checklist-bookmarks';

/**
 * Load bookmarks from localStorage
 * @returns {Array} Array of bookmark objects {title, url}
 */
export function loadBookmarks() {
    try {
        const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (!stored) {
            return [];
        }
        const bookmarks = JSON.parse(stored);
        // Validate structure
        if (!Array.isArray(bookmarks)) {
            console.warn('Invalid bookmarks format in localStorage');
            return [];
        }
        return bookmarks.filter(b => b && typeof b.title === 'string' && typeof b.url === 'string');
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        return [];
    }
}

/**
 * Save bookmarks to localStorage
 * @param {Array} bookmarks - Array of bookmark objects
 * @returns {boolean} True if successful
 */
export function saveBookmarks(bookmarks) {
    try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
        return true;
    } catch (error) {
        console.error('Error saving bookmarks:', error);
        return false;
    }
}

/**
 * Clear all bookmarks
 */
export function clearBookmarks() {
    try {
        localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing bookmarks:', error);
        return false;
    }
}

/**
 * Initialize bookmark UI
 */
export function initBookmarks() {
    const manageBtn = document.getElementById('manage-bookmarks-btn');
    const bookmarkSection = document.getElementById('bookmark-section');
    const bookmarkTextarea = document.getElementById('bookmark-input');
    const updateBookmarksBtn = document.getElementById('update-bookmarks-btn');
    const discardBookmarksBtn = document.getElementById('discard-bookmarks-btn');
    const jsonEditor = document.querySelector('.json-editor');
    const bookmarksContainer = document.getElementById('bookmarks-container');

    if (!manageBtn || !bookmarkSection || !bookmarkTextarea || !updateBookmarksBtn ||
        !discardBookmarksBtn || !jsonEditor || !bookmarksContainer) {
        console.error('Bookmark UI elements not found');
        return;
    }

    // Show/hide bookmark editor
    manageBtn.addEventListener('click', () => {
        showBookmarkEditor();
    });

    // Update bookmarks
    updateBookmarksBtn.addEventListener('click', () => {
        handleUpdateBookmarks();
    });

    // Discard changes
    discardBookmarksBtn.addEventListener('click', () => {
        hideBookmarkEditor();
    });

    // Add bookmark from URL - show title popup
    const addBookmarkBtn = document.getElementById('url-add-bookmark-btn');
    const bookmarkTitlePopup = document.getElementById('bookmark-title-popup');
    const bookmarkTitleInput = document.getElementById('bookmark-title-input');
    const bookmarkTitleSave = document.getElementById('bookmark-title-save');
    const bookmarkTitleCancel = document.getElementById('bookmark-title-cancel');

    if (addBookmarkBtn && bookmarkTitlePopup && bookmarkTitleInput) {
        addBookmarkBtn.addEventListener('click', () => {
            showBookmarkTitleInput();
        });

        if (bookmarkTitleSave) {
            bookmarkTitleSave.addEventListener('click', () => {
                const title = bookmarkTitleInput.value.trim();
                if (title) {
                    handleAddBookmarkFromUrl(title);
                    hideBookmarkTitleInput();
                }
            });
        }

        if (bookmarkTitleCancel) {
            bookmarkTitleCancel.addEventListener('click', () => {
                hideBookmarkTitleInput();
            });
        }

        // Close popup when clicking outside the content
        bookmarkTitlePopup.addEventListener('click', (e) => {
            if (e.target === bookmarkTitlePopup) {
                hideBookmarkTitleInput();
            }
        });

        // Allow Enter key to save
        bookmarkTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const title = bookmarkTitleInput.value.trim();
                if (title) {
                    handleAddBookmarkFromUrl(title);
                    hideBookmarkTitleInput();
                }
            }
        });

        // Allow Escape key to cancel
        bookmarkTitleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideBookmarkTitleInput();
            }
        });
    }

    // Floating bookmark button and popup
    const floatingBookmarksBtn = document.getElementById('floating-bookmarks-btn');
    const floatingBookmarksPopup = document.getElementById('floating-bookmarks-popup');
    const closeFloatingBookmarks = document.getElementById('close-floating-bookmarks');

    if (floatingBookmarksBtn && floatingBookmarksPopup) {
        // Toggle popup when clicking the floating button
        floatingBookmarksBtn.addEventListener('click', () => {
            toggleFloatingBookmarksPopup();
        });

        // Close popup when clicking the close button
        if (closeFloatingBookmarks) {
            closeFloatingBookmarks.addEventListener('click', () => {
                closeFloatingBookmarksPopup();
            });
        }

        // Close popup when clicking outside the content
        floatingBookmarksPopup.addEventListener('click', (e) => {
            if (e.target === floatingBookmarksPopup) {
                closeFloatingBookmarksPopup();
            }
        });
    }

    // Initial render of bookmarks
    renderBookmarks();

    // Set initial visibility state for floating bookmark button
    // Check if edit section is currently visible
    const editSection = document.getElementById('edit-section');
    const isEditSectionVisible = editSection && !editSection.classList.contains('hidden');
    updateBookmarkVisibility(isEditSectionVisible);
}

/**
 * Show bookmark editor section
 */
function showBookmarkEditor() {
    const bookmarkSection = document.getElementById('bookmark-section');
    const bookmarkTextarea = document.getElementById('bookmark-input');
    const checklistEditorSection = document.getElementById('checklist-editor-section');

    // Load current bookmarks into textarea
    const bookmarks = loadBookmarks();
    bookmarkTextarea.value = JSON.stringify(bookmarks, null, 2);

    // Hide checklist editor section, show bookmark editor
    if (checklistEditorSection) checklistEditorSection.classList.add('hidden');
    bookmarkSection.classList.remove('hidden');
}

/**
 * Hide bookmark editor section
 */
function hideBookmarkEditor() {
    const bookmarkSection = document.getElementById('bookmark-section');
    const checklistEditorSection = document.getElementById('checklist-editor-section');
    const errorBox = document.getElementById('error-box');

    // Hide any errors that might be showing
    if (errorBox) errorBox.classList.add('hidden');

    // Show checklist editor section, hide bookmark editor
    bookmarkSection.classList.add('hidden');
    if (checklistEditorSection) checklistEditorSection.classList.remove('hidden');
}

/**
 * Handle update bookmarks button click
 */
function handleUpdateBookmarks() {
    const bookmarkTextarea = document.getElementById('bookmark-input');
    const errorBox = document.getElementById('error-box');
    const errorMessage = document.getElementById('error-message');

    try {
        const jsonText = bookmarkTextarea.value.trim();

        // Allow empty bookmarks
        if (!jsonText) {
            saveBookmarks([]);
            hideBookmarkEditor();
            renderBookmarks();
            return;
        }

        const bookmarks = JSON.parse(jsonText);

        // Validate structure
        if (!Array.isArray(bookmarks)) {
            throw new Error('Bookmarks must be an array');
        }

        // Validate each bookmark
        for (let i = 0; i < bookmarks.length; i++) {
            const bookmark = bookmarks[i];
            if (!bookmark || typeof bookmark !== 'object') {
                throw new Error(`Bookmark at index ${i} must be an object`);
            }
            if (typeof bookmark.title !== 'string' || !bookmark.title.trim()) {
                throw new Error(`Bookmark at index ${i} must have a non-empty "title" string`);
            }
            if (typeof bookmark.url !== 'string' || !bookmark.url.trim()) {
                throw new Error(`Bookmark at index ${i} must have a non-empty "url" string`);
            }
        }

        // Save and update UI
        if (saveBookmarks(bookmarks)) {
            hideBookmarkEditor();
            renderBookmarks();
        } else {
            throw new Error('Failed to save bookmarks to localStorage');
        }

    } catch (error) {
        // Show error
        errorMessage.textContent = `Invalid bookmark JSON: ${error.message}`;
        errorBox.classList.remove('hidden');

        // Auto-hide error after 5 seconds
        setTimeout(() => {
            errorBox.classList.add('hidden');
        }, 5000);
    }
}

/**
 * Render bookmark buttons
 */
function renderBookmarks() {
    const bookmarksContainer = document.getElementById('bookmarks-container');

    if (!bookmarksContainer) return;

    const bookmarks = loadBookmarks();

    // Clear existing bookmark buttons (but keep background icon and label)
    const existingButtons = bookmarksContainer.querySelectorAll('.bookmark-btn');
    existingButtons.forEach(btn => btn.remove());

    // Hide container if no bookmarks
    if (bookmarks.length === 0) {
        bookmarksContainer.classList.add('hidden');
        return;
    }

    // Show container and create buttons
    bookmarksContainer.classList.remove('hidden');

    bookmarks.forEach((bookmark, index) => {
        const button = document.createElement('button');
        button.className = 'bookmark-btn';
        button.textContent = bookmark.title;
        button.title = `Load checklist from: ${bookmark.url}`;
        button.addEventListener('click', () => {
            handleBookmarkClick(bookmark.url);
        });
        bookmarksContainer.appendChild(button);
    });
}

/**
 * Handle bookmark button click
 * @param {string} url - The URL to load
 */
function handleBookmarkClick(url) {
    // Construct full URL with parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('url', url);

    // Navigate to the URL (this will reload the page with the URL parameter)
    window.location.href = currentUrl.toString();
}

/**
 * Update bookmark visibility based on edit section state
 * @param {boolean} editSectionVisible - Whether edit section is visible
 */
export function updateBookmarkVisibility(editSectionVisible) {
    const manageBtn = document.getElementById('manage-bookmarks-btn');
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const floatingBookmarksBtn = document.getElementById('floating-bookmarks-btn');

    const bookmarks = loadBookmarks();
    const hasBookmarks = bookmarks.length > 0;

    console.log('updateBookmarkVisibility called:', {
        editSectionVisible,
        hasBookmarks,
        bookmarksCount: bookmarks.length,
        floatingBtnExists: !!floatingBookmarksBtn
    });

    if (manageBtn) {
        if (editSectionVisible) {
            manageBtn.classList.remove('hidden');
        } else {
            manageBtn.classList.add('hidden');
        }
    }

    if (bookmarksContainer) {
        if (editSectionVisible && hasBookmarks) {
            bookmarksContainer.classList.remove('hidden');
        } else {
            bookmarksContainer.classList.add('hidden');
        }
    }

    // Show floating bookmark button only when edit section is hidden AND bookmarks exist
    if (floatingBookmarksBtn) {
        if (!editSectionVisible && hasBookmarks) {
            console.log('Showing floating bookmark button');
            floatingBookmarksBtn.classList.remove('hidden');
        } else {
            console.log('Hiding floating bookmark button - editVisible:', editSectionVisible, 'hasBookmarks:', hasBookmarks);
            floatingBookmarksBtn.classList.add('hidden');
        }
    } else {
        console.error('Floating bookmark button element not found!');
    }
}

/**
 * Show bookmark title popup
 */
function showBookmarkTitleInput() {
    const bookmarkTitlePopup = document.getElementById('bookmark-title-popup');
    const bookmarkTitleInput = document.getElementById('bookmark-title-input');

    if (bookmarkTitlePopup && bookmarkTitleInput) {
        bookmarkTitlePopup.classList.remove('hidden');
        bookmarkTitleInput.value = ''; // Clear previous value
        bookmarkTitleInput.focus(); // Focus the input
    }
}

/**
 * Hide bookmark title popup
 */
function hideBookmarkTitleInput() {
    const bookmarkTitlePopup = document.getElementById('bookmark-title-popup');
    const bookmarkTitleInput = document.getElementById('bookmark-title-input');

    if (bookmarkTitlePopup && bookmarkTitleInput) {
        bookmarkTitlePopup.classList.add('hidden');
        bookmarkTitleInput.value = ''; // Clear the input
    }
}

/**
 * Handle adding a bookmark from the current URL parameter
 * @param {string} title - Custom title for the bookmark
 */
function handleAddBookmarkFromUrl(title) {
    // Get the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('url');

    if (!url) {
        console.warn('No URL parameter found to bookmark');
        return;
    }

    // Load existing bookmarks
    const bookmarks = loadBookmarks();

    // Use provided title or generate a unique one
    if (!title) {
        title = 'New';
        let counter = 0;
        const existingTitles = bookmarks.map(b => b.title);

        // Check if "New" exists, if so, try "New 1", "New 2", etc.
        while (existingTitles.includes(title)) {
            counter++;
            title = `New ${counter}`;
        }
    }

    // Add the new bookmark
    const newBookmark = {
        title: title,
        url: url
    };

    bookmarks.push(newBookmark);

    // Save and re-render
    if (saveBookmarks(bookmarks)) {
        renderBookmarks();

        // Optional: Show a brief success message
        console.log(`Bookmark "${title}" added successfully`);
    } else {
        console.error('Failed to save bookmark');
    }
}

/**
 * Toggle the floating bookmarks popup
 */
function toggleFloatingBookmarksPopup() {
    const popup = document.getElementById('floating-bookmarks-popup');
    if (!popup) return;

    if (popup.classList.contains('hidden')) {
        openFloatingBookmarksPopup();
    } else {
        closeFloatingBookmarksPopup();
    }
}

/**
 * Open the floating bookmarks popup
 */
function openFloatingBookmarksPopup() {
    const popup = document.getElementById('floating-bookmarks-popup');
    const floatingList = document.getElementById('floating-bookmarks-list');

    if (!popup || !floatingList) return;

    // Render bookmarks in the floating list
    const bookmarks = loadBookmarks();
    floatingList.innerHTML = '';

    bookmarks.forEach((bookmark) => {
        const button = document.createElement('button');
        button.className = 'bookmark-btn';
        button.textContent = bookmark.title;
        button.title = `Load checklist from: ${bookmark.url}`;
        button.addEventListener('click', () => {
            handleBookmarkClick(bookmark.url);
        });
        floatingList.appendChild(button);
    });

    popup.classList.remove('hidden');
}

/**
 * Close the floating bookmarks popup
 */
function closeFloatingBookmarksPopup() {
    const popup = document.getElementById('floating-bookmarks-popup');
    if (!popup) return;

    popup.classList.add('hidden');
}
