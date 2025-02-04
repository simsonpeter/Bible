// Daily Verse Feature
function getDailyVerse() {
    const today = new Date().toDateString();
    const storedVerse = JSON.parse(localStorage.getItem('dailyVerse'));

    // Return cached verse if it's for today
    if (storedVerse && storedVerse.date === today) {
        return storedVerse.verse;
    }

    // Generate a new random verse
    const randomBookIndex = Math.floor(Math.random() * allBooksData.length);
    const randomBook = allBooksData[randomBookIndex];
    const randomChapterIndex = Math.floor(Math.random() * randomBook.chapters.length);
    const randomChapter = randomBook.chapters[randomChapterIndex];
    const randomVerseIndex = Math.floor(Math.random() * randomChapter.verses.length);
    const randomVerse = randomChapter.verses[randomVerseIndex];

    const dailyVerse = {
        date: today,
        verse: {
            bookIndex: randomBookIndex,
            bookName: randomBook.book.tamil,
            chapterIndex: randomChapterIndex,
            chapterNumber: randomChapter.chapter,
            verseNumber: randomVerse.verse,
            text: randomVerse.text
        }
    };

    // Save to localStorage
    localStorage.setItem('dailyVerse', JSON.stringify(dailyVerse));
    return dailyVerse.verse;
}

function displayDailyVerse() {
    const dailyVerse = getDailyVerse();
    const dailyVerseElement = document.createElement('div');
    dailyVerseElement.className = 'daily-verse';
    dailyVerseElement.innerHTML = `
        <h3>இன்றைய வசனம்</h3>
        <p><strong>${dailyVerse.bookName} ${dailyVerse.chapterNumber}:${dailyVerse.verseNumber}</strong></p>
        <p>${dailyVerse.text}</p>
        <button onclick="navigateToVerse(${dailyVerse.bookIndex}, ${dailyVerse.chapterIndex}, ${dailyVerse.verseNumber})">
            இந்த வசனத்திற்கு செல்
        </button>
    `;
    verseDisplay.prepend(dailyVerseElement);
}

// Call this function after loading the app
function initializeApp() {
    loadBibleData().then(() => {
        displayDailyVerse();
    });
}

// Update the loadChapter function to include daily verse
function loadChapter(chapterIndex) {
    try {
        isSearching = false;
        const chapters = allBooksData[currentBook].chapters;
        
        if (chapterIndex < 0 || chapterIndex >= chapters.length) return;
        
        currentChapter = chapterIndex;
        const chapter = chapters[chapterIndex];
        
        verseDisplay.innerHTML = ''; // Clear previous content
        displayDailyVerse(); // Show daily verse at the top
        
        // Add chapter verses
        verseDisplay.innerHTML += chapter.verses.map(verse => `
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
