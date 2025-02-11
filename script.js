
const themeToggle = document.getElementById('theme-toggle');
const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseDisplay = document.getElementById('verse-display');
const searchInput = document.getElementById('search-input');
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');

let currentBook = null;
let currentChapter = null;
let allBooksData = [];
let isSearching = false;
let deferredPrompt;

// Theme Management
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
});

document.body.dataset.theme = localStorage.getItem('theme') || 'light';

// Load Bible Data
async function loadBibleData() {
    try {
        const booksResponse = await fetch('books.json');
        const books = await booksResponse.json();
        
        allBooksData = await Promise.all(books.map(async (book, index) => {
            try {
                const response = await fetch(`books/${book.book.file}`);
                const data = await response.json();
                return {
                    ...book,
                    chapters: data.chapters
                };
            } catch (error) {
                console.error(`Error loading ${book.book.tamil}:`, error);
                return null;
            }
        }));
        
        allBooksData = allBooksData.filter(book => book !== null);
        populateBookSelect(books);
    } catch (error) {
        console.error('Failed to load Bible data:', error);
        showError('பைபிள் தரவுத்தளத்தை ஏற்ற முடியவில்லை');
    }
}

function populateBookSelect(books) {
    bookSelect.innerHTML = '<option value="">புத்தகத்தைத் தேர்ந்தெடுக்கவும்</option>';
    books.forEach((book, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = book.book.tamil;
        bookSelect.appendChild(option);
    });
}

// Book Selection
bookSelect.addEventListener('change', async (e) => {
    currentBook = e.target.value;
    if (currentBook === "") return;
    
    const selectedBook = allBooksData[currentBook];
    if (!selectedBook) return;
    
    populateChapterSelect(selectedBook.chapters);
    currentChapter = 0;
    loadChapter(currentChapter);
});

function populateChapterSelect(chapters) {
    chapterSelect.innerHTML = '<option value="">அதிகாரத்தைத் தேர்ந்தெடுக்கவும்</option>';
    chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `அதிகாரம் ${chapter.chapter}`;
        chapterSelect.appendChild(option);
    });
}

// Chapter Navigation
function loadChapter(chapterIndex) {
    try {
        isSearching = false;
        const chapters = allBooksData[currentBook].chapters;
        
        if (chapterIndex < 0 || chapterIndex >= chapters.length) return;
        
        currentChapter = chapterIndex;
        const chapter = chapters[chapterIndex];
        
        verseDisplay.innerHTML = chapter.verses.map(verse => `
            <div class="verse-item" data-verse="${verse.verse}">
                <strong>${verse.verse}.</strong> ${verse.text}
            </div>
        `).join('');
        
        updateSelections();
        updateNavigation();
    } catch (error) {
        console.error('Chapter load error:', error);
        showError('அதிகாரத்தை ஏற்ற முடியவில்லை');
    }
}

function updateSelections() {
    bookSelect.value = currentBook;
    chapterSelect.value = currentChapter;
}

function updateNavigation() {
    const chapters = allBooksData[currentBook]?.chapters || [];
    prevChapterBtn.disabled = currentChapter === 0;
    nextChapterBtn.disabled = currentChapter === chapters.length - 1;
}

// Search Functionality
function performSearch(searchTerm) {
    try {
        if (searchTerm.length < 2) {
            if (isSearching) loadChapter(currentChapter);
            return;
        }

        isSearching = true;
        const normalizedSearch = searchTerm.toLowerCase();
        const results = [];
        
        allBooksData.forEach((book, bookIndex) => {
            book.chapters.forEach((chapter, chapterIndex) => {
                chapter.verses.forEach(verse => {
                    if (verse.text.toLowerCase().includes(normalizedSearch)) {
                        results.push({
                            bookIndex: bookIndex,
                            bookName: book.book.tamil,
                            chapterIndex: chapterIndex,
                            chapterNumber: chapter.chapter,
                            verse: verse
                        });
                    }
                });
            });
        });

        displaySearchResults(results, searchTerm);
    } catch (error) {
        console.error('Search error:', error);
        showError('தேடல் செயல்பாட்டில் பிழை');
    }
}

function displaySearchResults(results, searchTerm) {
    verseDisplay.innerHTML = results.length > 0 
        ? results.map(result => `
            <div class="search-result" 
                 data-book-index="${result.bookIndex}"
                 data-chapter-index="${result.chapterIndex}"
                 data-verse-number="${result.verse.verse}">
                <div class="verse-context">
                    ${result.bookName} ${result.chapterNumber}:${result.verse.verse}
                </div>
                ${highlightText(result.verse.text, searchTerm)}
            </div>
          `).join('')
        : '<div class="no-results">எந்த வசனங்களும் கிடைக்கவில்லை</div>';

    addSearchResultHandlers();
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Search Result Navigation
function addSearchResultHandlers() {
    document.querySelectorAll('.search-result').forEach(result => {
        result.addEventListener('click', handleSearchResultClick);
    });
}

function handleSearchResultClick(event) {
    const result = event.currentTarget;
    const bookIndex = parseInt(result.dataset.bookIndex);
    const chapterIndex = parseInt(result.dataset.chapterIndex);
    const verseNumber = parseInt(result.dataset.verseNumber);

    navigateToVerse(bookIndex, chapterIndex, verseNumber);
}

async function navigateToVerse(bookIndex, chapterIndex, verseNumber) {
    try {
        currentBook = bookIndex;
        const selectedBook = allBooksData[currentBook];
        
        bookSelect.value = currentBook;
        populateChapterSelect(selectedBook.chapters);
        
        setTimeout(() => {
            chapterSelect.value = chapterIndex;
            loadChapter(chapterIndex);
            highlightVerse(verseNumber);
        }, 100);
        
    } catch (error) {
        console.error('Navigation error:', error);
        showError('வசனத்திற்கு செல்ல முடியவில்லை');
    }
}

function highlightVerse(verseNumber) {
    setTimeout(() => {
        const verseElement = document.querySelector(`.verse-item[data-verse="${verseNumber}"]`);
        if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseElement.classList.add('highlight-verse');
            setTimeout(() => verseElement.classList.remove('highlight-verse'), 2000);
        }
    }, 200);
}

// Error Handling
function showError(message) {
    verseDisplay.innerHTML = `<div class="error">${message}</div>`;
}

// Event Listeners
chapterSelect.addEventListener('change', (e) => {
    currentChapter = parseInt(e.target.value);
    if (!isNaN(currentChapter)) loadChapter(currentChapter);
});

prevChapterBtn.addEventListener('click', () => {
    if (currentChapter > 0) loadChapter(currentChapter - 1);
});

nextChapterBtn.addEventListener('click', () => {
    const maxChapter = allBooksData[currentBook]?.chapters.length - 1 || 0;
    if (currentChapter < maxChapter) loadChapter(currentChapter + 1);
});

// Debounced Search Input
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(e.target.value.trim());
    }, 300);
});

// PWA Installation
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installButton = document.createElement('button');
    installButton.id = 'install-btn';
    installButton.textContent = 'ஆப் நிறுவு';
    installButton.className = 'install-prompt';
    document.body.appendChild(installButton);

    installButton.addEventListener('click', async () => {
        installButton.disabled = true;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted install');
        }
        installButton.remove();
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
                registration.update();
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Initialize App
loadBibleData();
