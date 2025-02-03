let currentBook = null;
let currentChapter = null;

const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const verseDisplay = document.getElementById('verse-display');

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
                    const verses = data.chapters[chapterIndex].verses;
                    displayVerses(verses); // Display all verses
                })
                .catch(error => console.error('Error loading verses:', error));
        })
        .catch(error => console.error('Error loading books.json:', error));
});

// Function to display all verses
function displayVerses(verses) {
    verseDisplay.innerHTML = ""; // Clear previous verses
    verses.forEach(verse => {
        const verseItem = document.createElement('div');
        verseItem.className = 'verse-item';
        verseItem.innerHTML = `<strong>${verse.verse}.</strong> ${verse.text}`;
        verseDisplay.appendChild(verseItem);
    });
}
