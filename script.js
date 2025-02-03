let currentBook = null;
let currentChapter = null;
let chapters = [];

const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseDisplay = document.getElementById('verse-display');
const prevChapterBtn = document.getElementById('prev-chapter-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');

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
    chapters = [];
    verseDisplay.innerHTML = ""; // Clear verse display

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
                    chapters = data.chapters; // Store all chapters
                    chapterSelect.innerHTML = '<option value="">அதிகாரத்தைத் தேர்ந்தெடுக்கவும்</option>';
                    if (chapters.length > 0) {
                        chapters.forEach((chapter, index) => {
                            const option = document.createElement('option');
                            option.value = index;
                            option.textContent = `அதிகாரம் ${chapter.chapter}`;
                            chapterSelect.appendChild(option);
                        });
                        currentChapter = 0; // Set the first chapter as default
                        loadChapter(currentChapter); // Load the first chapter
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
    loadChapter(currentChapter); // Load the selected chapter
});

// Function to load a chapter
function loadChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= chapters.length) return;

    const chapter = chapters[chapterIndex];
    verseDisplay.innerHTML = ""; // Clear previous verses
    chapter.verses.forEach(verse => {
        const verseItem = document.createElement('div');
        verseItem.className = 'verse-item';
        verseItem.innerHTML = `<strong>${verse.verse}.</strong> ${verse.text}`;
        verseDisplay.appendChild(verseItem);
    });

    // Update chapter dropdown
    chapterSelect.value = chapterIndex;

    // Enable/disable navigation buttons
    prevChapterBtn.disabled = chapterIndex === 0;
    nextChapterBtn.disabled = chapterIndex === chapters.length - 1;

    // Scroll to the top of the verse display
    verseDisplay.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top
}

// Handle "Previous Chapter" button click
prevChapterBtn.addEventListener('click', () => {
    if (currentChapter > 0) {
        currentChapter--;
        loadChapter(currentChapter);
    }
});

// Handle "Next Chapter" button click
nextChapterBtn.addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) {
        currentChapter++;
        loadChapter(currentChapter);
    }
});
