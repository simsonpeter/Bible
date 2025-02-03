let currentBook = null;
let currentChapter = null;
let currentVerseIndex = 0;
let verses = [];

const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseTextElement = document.getElementById('verse-text');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

// Load book names
fetch('books.json')
    .then(response => response.json())
    .then(data => {
        data.forEach((book, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = book;
            bookSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading book names:', error));

// Handle book selection
bookSelect.addEventListener('change', (event) => {
    const bookIndex = event.target.value;
    if (bookIndex === "") return;

    currentBook = bookIndex;
    currentChapter = null;
    currentVerseIndex = 0;
    verses = [];

    // Load chapters for the selected book
    fetch(`books/${bookIndex + 1}.json`)
        .then(response => response.json())
        .then(data => {
            chapterSelect.innerHTML = '<option value="">அதிகாரத்தைத் தேர்ந்தெடுக்கவும்</option>';
            data.chapters.forEach((chapter, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `அதிகாரம் ${chapter.chapter}`;
                chapterSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading chapters:', error));
});

// Handle chapter selection
chapterSelect.addEventListener('change', (event) => {
    const chapterIndex = event.target.value;
    if (chapterIndex === "") return;

    currentChapter = chapterIndex;
    currentVerseIndex = 0;

    // Load verses for the selected chapter
    fetch(`books/${currentBook + 1}.json`)
        .then(response => response.json())
        .then(data => {
            verses = data.chapters[chapterIndex].verses;
            updateVerse();
        })
        .catch(error => console.error('Error loading verses:', error));
});

// Update verse display
function updateVerse() {
    verseTextElement.textContent = verses[currentVerseIndex];
}

// Navigation buttons
prevButton.addEventListener('click', () => {
    if (currentVerseIndex > 0) {
        currentVerseIndex--;
        updateVerse();
    }
});

nextButton.addEventListener('click', () => {
    if (currentVerseIndex < verses.length - 1) {
        currentVerseIndex++;
        updateVerse();
    }
});
