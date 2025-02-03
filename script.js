let currentVerseIndex = 0;
let bibleData = [];

const verseTextElement = document.getElementById('verse-text');
const verseReferenceElement = document.getElementById('verse-reference');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

// Load the Tamil Bible data
fetch('tamil_bible.json')
    .then(response => response.json())
    .then(data => {
        bibleData = data;
        updateVerse();
    })
    .catch(error => console.error('Error loading JSON:', error));

function updateVerse() {
    const verse = bibleData[currentVerseIndex];
    verseTextElement.textContent = verse.text;
    verseReferenceElement.textContent = `- ${verse.book} ${verse.chapter}:${verse.verse}`;
}

prevButton.addEventListener('click', () => {
    if (currentVerseIndex > 0) {
        currentVerseIndex--;
        updateVerse();
    }
});

nextButton.addEventListener('click', () => {
    if (currentVerseIndex < bibleData.length - 1) {
        currentVerseIndex++;
        updateVerse();
    }
});