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
        data.forEach((bookObj, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = bookObj.book.tamil; // Use Tamil book name
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

    // Load the selected book's file name from books.json
    fetch('books.json')
        .then(response => response.json())
        .then(booksData => {
            const selectedBook = booksData[bookIndex];
            const bookFileName = selectedBook.book.file; // Get the file name (e.g., Genesis.json)

            // Load chapters for the selected book
            fetch(`books/${bookFileName}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Loaded book data:", data); // Debugging: Log the loaded book data
                    chapterSelect.innerHTML = '<option value="">அதிகாரத்தைத் தேர்ந்தெடுக்கவும்</option>';
                    if (data.chapters && data.chapters.length > 0) {
                        data.chapters.forEach((chapter, index) => {
                            const option = document.createElement('option');
                            option.value = index;
                            option.textContent = `அதிகாரம் ${chapter.chapter}`;
                            chapterSelect.appendChild(option);
                        });
                    } else {
                        console.error("No chapters found in the book data.");
                    }
                })
                .catch(error => console.error('Error loading chapters:', error));
        })
        .catch(error => console.error('Error loading books.json:', error));
});

// Handle chapter selection
chapterSelect.addEventListener('change', (event) => {
    const chapterIndex = event.target.value;
    if (chapterIndex === "") return;

    currentChapter = chapterIndex;
    currentVerseIndex = 0;

    // Load the selected book's file name from books.json
    fetch('books.json')
        .then(response => response.json())
        .then(booksData => {
            const selectedBook = booksData[currentBook];
            const bookFileName = selectedBook.book.file; // Get the file name (e.g., Genesis.json)

            // Load verses for the selected chapter
            fetch(`books/${bookFileName}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Loaded chapter data:", data.chapters[chapterIndex]); // Debugging: Log the loaded chapter data
                    verses = data.chapters[chapterIndex].verses;
                    updateVerse();
                })
                .catch(error => console.error('Error loading verses:', error));
        })
        .catch(error => console.error('Error loading books.json:', error));
});

// Update verse display
function updateVerse() {
    const verse = verses[currentVerseIndex];
    verseTextElement.textContent = `${verse.verse}. ${verse.text}`;
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
