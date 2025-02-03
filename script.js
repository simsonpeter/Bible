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

// Search Functionality
const searchInput = document.getElementById('search-input');
let currentVerses = [];

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
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

// Modified loadChapter function
function loadChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= chapters.length) return;

    const chapter = chapters[chapterIndex];
    currentVerses = chapter.verses;
    verseDisplay.innerHTML = currentVerses
        .map(verse => `
            <div class="verse-item">
                <strong>${verse.verse}.</strong> ${verse.text}
            </div>
        `).join('');

    // Update chapter dropdown
    chapterSelect.value = chapterIndex;

    // Enable/disable navigation buttons
    prevChapterBtn.disabled = chapterIndex === 0;
    nextChapterBtn.disabled = chapterIndex === chapters.length - 1;

    // Scroll to top and clear search
    verseDisplay.scrollTo({ top: 0, behavior: 'smooth' });
    searchInput.value = '';
}
