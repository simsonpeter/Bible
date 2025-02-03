// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = 
        document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
});

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.dataset.theme = savedTheme;

// App State
let currentBook = null;
let currentChapter = null;
let chapters = [];
let currentVerses = [];
let allBooksData = [];
let isSearching = false;

// DOM Elements
const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseDisplay = document.getElementById('verse-display');
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');
const searchInput = document.getElementById('search-input');

// Load All Books Data
async function initializeApp() {
    try {
        const booksResponse = await fetch('books.json');
        const books = await booksResponse.json();
        
        // Load all books data in parallel
        allBooksData = await Promise.all(books.map(async book => {
            const response = await fetch(`books/${book.book.file}`);
            const data = await response.json();
            return {
                ...book,
                chapters: data.chapters
            };
        }));
        
        // Populate book selector
        books.forEach((book, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = book.book.tamil;
            bookSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        verseDisplay.innerHTML = '<div class="error">Failed to load Bible data. Please try again later.</div>';
    }
}

// Initialize the app
initializeApp();

// Book Selection
bookSelect.addEventListener('change', async (e) => {
    try {
        currentBook = e.target.value;
        if (currentBook === "") return;

        const selectedBook = allBooksData[currentBook];
        chapters = selectedBook.chapters;
        populateChapters();
        currentChapter = 0;
        loadChapter(currentChapter);
    } catch (error) {
        console.error('Book selection error:', error);
    }
});

function populateChapters() {
    chapterSelect.innerHTML = '<option value="">அதிகாரத்தைத் தேர்ந்தெடுக்கவும்</option>';
    chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `அதிகாரம் ${chapter.chapter}`;
        chapterSelect.appendChild(option);
    });
}

// Chapter Selection
chapterSelect.addEventListener('change', (e) => {
    try {
        currentChapter = parseInt(e.target.value);
        if (isNaN(currentChapter)) return;
        loadChapter(currentChapter);
    } catch (error) {
        console.error('Chapter selection error:', error);
    }
});

// Chapter Navigation
prevChapterBtn.addEventListener('click', () => {
    if (currentChapter > 0) {
        currentChapter--;
        loadChapter(currentChapter);
    }
});

nextChapterBtn.addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) {
        currentChapter++;
        loadChapter(currentChapter);
    }
});

// Load Chapter
function loadChapter(chapterIndex) {
    try {
        isSearching = false;
        if (!chapters[chapterIndex]) return;

        currentChapter = chapterIndex;
        const chapter = chapters[chapterIndex];
        currentVerses = chapter.verses;
        
        verseDisplay.innerHTML = currentVerses
            .map(verse => `
                <div class="verse-item">
                    <strong>${verse.verse}.</strong> ${verse.text}
                </div>
            `).join('');

        chapterSelect.value = chapterIndex;
        updateNavigation();
        clearSearch();
    } catch (error) {
        console.error('Chapter load error:', error);
    }
}

function updateNavigation() {
    prevChapterBtn.disabled = currentChapter === 0;
    nextChapterBtn.disabled = currentChapter === chapters.length - 1;
}

function clearSearch() {
    searchInput.value = '';
}

// Search Utilities
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        
        allBooksData.forEach(book => {
            book.chapters.forEach(chapter => {
                chapter.verses.forEach(verse => {
                    if (verse.text.toLowerCase().includes(normalizedSearch)) {
                        results.push({
                            book: book.book.tamil,
                            chapter: chapter.chapter,
                            verse: verse.verse,
                            text: verse.text
                        });
                    }
                });
            });
        });

        verseDisplay.innerHTML = results
            .map(result => `
                <div class="verse-item">
                    <div class="verse-context">
                        ${result.book} ${result.chapter}:${result.verse}
                    </div>
                    ${highlightText(result.text, searchTerm)}
                </div>
            `).join('');

        if (results.length === 0) {
            verseDisplay.innerHTML = '<div class="no-results">No verses found matching your search.</div>';
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Debounced Search
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(e.target.value.trim());
    }, 300);
});
