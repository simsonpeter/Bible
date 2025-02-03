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

// Theme management
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', document.body.dataset.theme);
});

// Initialize theme
document.body.dataset.theme = localStorage.getItem('theme') || 'light';

// Load initial data
async function initializeApp() {
    try {
        const booksResponse = await fetch('books.json');
        const books = await booksResponse.json();
        
        allBooksData = await Promise.all(books.map(async book => {
            const response = await fetch(`books/${book.book.file}`);
            return await response.json();
        }));
        
        populateBookSelect(books);
    } catch (error) {
        console.error('Failed to load Bible data:', error);
        verseDisplay.innerHTML = '<div class="error">Failed to load Bible database</div>';
    }
}

function populateBookSelect(books) {
    books.forEach((book, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = book.book.tamil;
        bookSelect.appendChild(option);
    });
}

bookSelect.addEventListener('change', async (e) => {
    currentBook = e.target.value;
    if (currentBook === "") return;
    
    const bookData = allBooksData[currentBook];
    populateChapterSelect(bookData.chapters);
    currentChapter = 0;
    loadChapter(bookData.chapters[0]);
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

function loadChapter(chapter) {
    verseDisplay.innerHTML = chapter.verses.map(verse => `
        <div class="verse-item">
            <strong>${verse.verse}.</strong> ${verse.text}
        </div>
    `).join('');
}

chapterSelect.addEventListener('change', (e) => {
    const chapterIndex = e.target.value;
    if (chapterIndex === "") return;
    currentChapter = chapterIndex;
    loadChapter(allBooksData[currentBook].chapters[chapterIndex]);
});

// Navigation buttons
prevChapterBtn.addEventListener('click', () => {
    if (currentChapter > 0) {
        currentChapter--;
        chapterSelect.value = currentChapter;
        loadChapter(allBooksData[currentBook].chapters[currentChapter]);
    }
});

nextChapterBtn.addEventListener('click', () => {
    const maxChapter = allBooksData[currentBook].chapters.length - 1;
    if (currentChapter < maxChapter) {
        currentChapter++;
        chapterSelect.value = currentChapter;
        loadChapter(allBooksData[currentBook].chapters[currentChapter]);
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (searchTerm.length < 2) return;
    
    const results = [];
    allBooksData.forEach((book, bookIndex) => {
        book.chapters.forEach(chapter => {
            chapter.verses.forEach(verse => {
                if (verse.text.toLowerCase().includes(searchTerm)) {
                    results.push({
                        book: bookIndex,
                        chapter: chapter.chapter,
                        verse: verse.verse,
                        text: verse.text
                    });
                }
            });
        });
    });
    
    verseDisplay.innerHTML = results.map(result => `
        <div class="verse-item">
            <div class="verse-context">
                ${bookSelect.options[result.book].text} ${result.chapter}:${result.verse}
            </div>
            ${result.text.replace(
                new RegExp(searchTerm, 'gi'), 
                match => `<span class="highlight">${match}</span>`
            )}
        </div>
    `).join('');
});

// Initialize the app
initializeApp();
