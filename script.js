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

// DOM Elements
const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseDisplay = document.getElementById('verse-display');
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');
const searchInput = document.getElementById('search-input');

// Load Books
fetch('books.json')
    .then(response => response.json())
    .then(data => populateBooks(data))
    .catch(error => console.error('Error loading books:', error));

function populateBooks(books) {
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

    const booksData = await fetch('books.json').then(res => res.json());
    const selectedBook = booksData[currentBook];
    
    const bookData = await fetch(`books/${selectedBook.book.file}`)
        .then(res => res.json())
        .catch(error => console.error('Error loading book:', error));

    chapters = bookData.chapters;
    populateChapters();
    currentChapter = 0;
    loadChapter(currentChapter);
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
    currentChapter = parseInt(e.target.value);
    if (isNaN(currentChapter)) return;
    loadChapter(currentChapter);
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
    scrollToTop();
    clearSearch();
}

function updateNavigation() {
    prevChapterBtn.disabled = currentChapter === 0;
    nextChapterBtn.disabled = currentChapter === chapters.length - 1;
}

function scrollToTop() {
    verseDisplay.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearSearch() {
    searchInput.value = '';
}

// Search Functionality
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterVerses(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase();
    verseDisplay.innerHTML = currentVerses
        .filter(verse => verse.text.toLowerCase().includes(normalizedSearch))
        .map(verse => `
            <div class="verse-item">
                <strong>${verse.verse}.</strong> 
                ${highlightText(verse.text, searchTerm)}
            </div>
        `).join('');
}

searchInput.addEventListener('input', (e) => {
    filterVerses(e.target.value.trim());
});
