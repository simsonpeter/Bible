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

// Theme Management
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
});

document.body.dataset.theme = localStorage.getItem('theme') || 'light';

// Data Loading
async function loadBibleData() {
    try {
        const booksResponse = await fetch('books.json');
        const books = await booksResponse.json();
        
        allBooksData = await Promise.all(books.map(async (book, index) => {
            try {
                const response = await fetch(`books/${book.book.file}`);
                if (!response.ok) throw new Error(`Failed to load ${book.book.file}`);
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
        
        // Filter out null values from failed loads
        allBooksData = allBooksData.filter(book => book !== null);
        
        populateBookSelect(books);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        verseDisplay.innerHTML = '<div class="error">பைபிள் தரவுத்தளத்தை ஏற்ற முடியவில்லை</div>';
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
bookSelect.addEventListener('change', (e) => {
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
            <div class="verse-item">
                <strong>${verse.verse}.</strong> ${verse.text}
            </div>
        `).join('');
        
        chapterSelect.value = chapterIndex;
        updateNavigation();
    } catch (error) {
        console.error('Chapter load error:', error);
    }
}

function updateNavigation() {
    const chapters = allBooksData[currentBook]?.chapters || [];
    prevChapterBtn.disabled = currentChapter === 0;
    nextChapterBtn.disabled = currentChapter === chapters.length - 1;
}

// Search Implementation
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

        verseDisplay.innerHTML = results.length > 0 
            ? results.map(result => `
                <div class="verse-item">
                    <div class="verse-context">
                        ${result.book} ${result.chapter}:${result.verse}
                    </div>
                    ${highlightText(result.text, searchTerm)}
                </div>
              `).join('')
            : '<div class="no-results">எந்த வசனங்களும் கிடைக்கவில்லை</div>';
    } catch (error) {
        console.error('Search error:', error);
    }
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

let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(e.target.value.trim());
    }, 300);
});

// Initialize App
loadBibleData();
