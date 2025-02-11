// Bible Data (Sample Data)
const bibleData = {
    books: [
        {
            id: 1,
            name: "ஆதியாகமம்",
            chapters: [
                {
                    chapter: 1,
                    verses: [
                        {verse: 1, text: "தொடக்கத்தில் தேவன் வானத்தையும் பூமியையும் சிருஷ்டித்தார்."},
                        {verse: 2, text: "பூமியானது வெறுமையாயும் களங்கமாயும் இருந்தது..."}
                    ]
                }
            ]
        }
    ]
};

// App State
let currentState = {
    book: null,
    chapter: null,
    verses: [],
    bookmarks: [],
    fontSize: 1,
    theme: 'light'
};

// Initialize App
function initApp() {
    // Populate Books
    const bookSelect = document.getElementById('book-select');
    bibleData.books.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.name;
        bookSelect.appendChild(option);
    });

    // Load saved state
    const savedState = localStorage.getItem('bibleAppState');
    if(savedState) {
        currentState = JSON.parse(savedState);
        applySavedState();
    }

    // Event Listeners
    document.getElementById('book-select').addEventListener('change', loadChapters);
    document.getElementById('chapter-select').addEventListener('change', loadVerses);
    document.getElementById('search-input').addEventListener('input', searchVerses);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('text-size-up').addEventListener('click', () => adjustTextSize(0.1));
    document.getElementById('text-size-down').addEventListener('click', () => adjustTextSize(-0.1));
    document.getElementById('prev-chapter-btn').addEventListener('click', prevChapter);
    document.getElementById('next-chapter-btn').addEventListener('click', nextChapter);
    document.getElementById('bookmark-btn').addEventListener('click', toggleBookmark);
}

// Core Functions
function loadChapters() {
    const bookId = this.value;
    currentState.book = bibleData.books.find(b => b.id == bookId);
    
    const chapterSelect = document.getElementById('chapter-select');
    chapterSelect.innerHTML = '<option value="">அதிகாரத்தைத் தேர்ந்தெடு</option>';
    
    currentState.book.chapters.forEach(ch => {
        const option = document.createElement('option');
        option.value = ch.chapter;
        option.textContent = `அதிகாரம் ${ch.chapter}`;
        chapterSelect.appendChild(option);
    });
}

function loadVerses() {
    const chapterNum = this.value;
    currentState.chapter = currentState.book.chapters.find(ch => ch.chapter == chapterNum);
    currentState.verses = currentState.chapter.verses;
    displayVerses(currentState.verses);
    saveState();
}

function displayVerses(verses) {
    const container = document.getElementById('verse-display');
    container.innerHTML = verses.map(v => `
        <div class="verse-item">
            <span class="verse-number">${v.verse}</span> 
            ${v.text}
        </div>
    `).join('');
}

// Additional Features
function toggleTheme() {
    currentState.theme = currentState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentState.theme);
    saveState();
}

function adjustTextSize(change) {
    currentState.fontSize = Math.min(2, Math.max(0.8, currentState.fontSize + change));
    document.documentElement.style.setProperty('--font-size', `${currentState.fontSize}rem
