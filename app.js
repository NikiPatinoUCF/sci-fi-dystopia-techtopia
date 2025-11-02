// Global state
let booksData = [];
let currentBook = null;
const STORAGE_KEY = 'techtopia_reading_data';

// Theme Icons and Colors for Visualization
const themeVisuals = {
    'surveillance': { icon: '👁️', color: '#e74c3c' },
    'totalitarianism': { icon: '⚔️', color: '#c0392b' },
    'thought-control': { icon: '🧠', color: '#8e44ad' },
    'propaganda': { icon: '📢', color: '#d35400' },
    'genetic-engineering': { icon: '🧬', color: '#27ae60' },
    'social-control': { icon: '🎭', color: '#2980b9' },
    'consumerism': { icon: '🛒', color: '#f39c12' },
    'conditioning': { icon: '🔗', color: '#7f8c8d' },
    'censorship': { icon: '🚫', color: '#e67e22' },
    'anti-intellectualism': { icon: '📖', color: '#95a5a6' },
    'media-control': { icon: '📺', color: '#34495e' },
    'conformity': { icon: '👥', color: '#7f8c8d' },
    'theocracy': { icon: '⛪', color: '#8e44ad' },
    'gender-oppression': { icon: '⚥', color: '#e74c3c' },
    'reproduction-control': { icon: '👶', color: '#c0392b' },
    'resistance': { icon: '✊', color: '#e74c3c' },
    'cyberpunk': { icon: '🌃', color: '#9b59b6' },
    'AI': { icon: '🤖', color: '#3498db' },
    'virtual-reality': { icon: '🥽', color: '#1abc9c' },
    'corporate-power': { icon: '🏢', color: '#34495e' },
    'post-apocalyptic': { icon: '☢️', color: '#95a5a6' },
    'survival': { icon: '🔥', color: '#e67e22' },
    'climate-change': { icon: '🌡️', color: '#27ae60' },
    'pandemic': { icon: '🦠', color: '#e74c3c' },
    'rebellion': { icon: '⚡', color: '#f39c12' },
    'class-divide': { icon: '⚖️', color: '#95a5a6' },
    'privacy': { icon: '🔒', color: '#3498db' },
    'identity': { icon: '🎭', color: '#9b59b6' },
    'revolution': { icon: '🔥', color: '#e74c3c' },
    'mutation': { icon: '🧬', color: '#16a085' },
    'technology': { icon: '⚙️', color: '#34495e' },
    'empathy': { icon: '💜', color: '#9b59b6' },
    'religion': { icon: '🕊️', color: '#3498db' },
    'memory': { icon: '💭', color: '#8e44ad' },
    'politics': { icon: '🏛️', color: '#2c3e50' },
    'war': { icon: '⚔️', color: '#c0392b' }
};

// Get theme visual
function getThemeVisual(theme) {
    return themeVisuals[theme] || { icon: '📚', color: '#95a5a6' };
}

// Local Storage Manager
const StorageManager = {
    getData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    setData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    getBookData(bookId) {
        const data = this.getData();
        return data[bookId] || { read: false, rating: 0 };
    },

    setBookData(bookId, bookData) {
        const data = this.getData();
        data[bookId] = bookData;
        this.setData(data);
    },

    clearAllData() {
        if (confirm('Are you sure you want to clear all reading data? This action cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    }
};

// Writing style similarity calculator
function calculateStyleSimilarity(style1, style2) {
    if (!style1 || !style2) return 0;

    const keywords1 = style1.toLowerCase().split(/[\s-]+/);
    const keywords2 = style2.toLowerCase().split(/[\s-]+/);

    const commonKeywords = keywords1.filter(word => keywords2.includes(word));
    return commonKeywords.length;
}

// "One Shelf Over" Recommendation Engine
function generateRecommendations() {
    // Get books rated 4 or 5 stars
    const highlyRatedBooks = booksData.filter(b => b.rating >= 4);

    // If no highly rated books, don't show recommendations
    if (highlyRatedBooks.length === 0) {
        document.getElementById('recommendationsSection').style.display = 'none';
        return;
    }

    // Get unread books
    const unreadBooks = booksData.filter(b => !b.read);

    // Calculate "one shelf over" score for each unread book
    const scoredBooks = unreadBooks.map(book => {
        let totalScore = 0;
        let totalStyleMatch = 0;
        let shelfReasons = [];
        const matchedThemes = new Set();

        // Compare with each highly rated book
        highlyRatedBooks.forEach(ratedBook => {
            // Theme overlap - looking for 1-3 shared themes (not all)
            const sharedThemes = book.themes.filter(t => ratedBook.themes.includes(t));
            const themeOverlapRatio = sharedThemes.length / Math.max(book.themes.length, ratedBook.themes.length);

            // "One shelf over" sweet spot: 1-3 shared themes (not too similar, not too different)
            if (sharedThemes.length >= 1 && sharedThemes.length <= 3) {
                const shelfScore = (ratedBook.rating / 5) * (30 + (sharedThemes.length * 10));
                totalScore += shelfScore;
                sharedThemes.forEach(t => matchedThemes.add(t));

                if (sharedThemes.length === 1) {
                    shelfReasons.push(`Adjacent shelf: shares "${sharedThemes[0]}" with "${ratedBook.title}"`);
                } else if (sharedThemes.length === 2) {
                    shelfReasons.push(`Nearby: echoes themes from "${ratedBook.title}"`);
                } else {
                    shelfReasons.push(`Similar territory to "${ratedBook.title}"`);
                }
            }

            // Writing style similarity (major factor)
            const styleSimilarity = calculateStyleSimilarity(book.writingStyle, ratedBook.writingStyle);
            if (styleSimilarity > 0) {
                totalStyleMatch += styleSimilarity * (ratedBook.rating / 5) * 15;
                shelfReasons.push(`Writing style resonates with "${ratedBook.title}"`);
            }

            // Era proximity (minor factor)
            const yearDiff = Math.abs(book.year - ratedBook.year);
            if (yearDiff <= 20) {
                totalScore += (ratedBook.rating / 5) * 8;
            }
        });

        // Prefer books with moderate theme overlap (avoid exact matches)
        const diversityBonus = matchedThemes.size >= 1 && matchedThemes.size <= 3 ? 20 : 0;

        return {
            ...book,
            shelfScore: totalScore + totalStyleMatch + diversityBonus,
            matchedThemes: Array.from(matchedThemes),
            shelfLocation: determineShelfLocation(matchedThemes.size, totalStyleMatch),
            recommendationReason: shelfReasons[0] || "Recommended based on your tastes"
        };
    });

    // Sort by shelf score and get top 12
    const recommendations = scoredBooks
        .filter(b => b.shelfScore > 0)
        .sort((a, b) => b.shelfScore - a.shelfScore)
        .slice(0, 12);

    if (recommendations.length === 0) {
        document.getElementById('recommendationsSection').style.display = 'none';
        return;
    }

    renderRecommendations(recommendations, highlyRatedBooks);
}

// Determine shelf location metaphor
function determineShelfLocation(themeCount, styleScore) {
    if (themeCount === 1 && styleScore > 20) {
        return "One shelf over, similar voice";
    } else if (themeCount === 1) {
        return "Adjacent shelf";
    } else if (themeCount === 2 && styleScore > 15) {
        return "Nearby shelf, kindred spirit";
    } else if (themeCount === 2) {
        return "Nearby shelf";
    } else if (themeCount === 3) {
        return "Same aisle, different perspective";
    } else if (styleScore > 25) {
        return "Different section, similar voice";
    } else {
        return "Worth exploring";
    }
}

// Render recommendations
function renderRecommendations(recommendations, highlyRatedBooks) {
    const section = document.getElementById('recommendationsSection');
    const grid = document.getElementById('recommendationsGrid');

    grid.innerHTML = recommendations.map(book => {
        return `
            <div class="recommendation-card" data-book-id="${book.id}">
                <span class="shelf-location">${book.shelfLocation}</span>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <span class="book-year">${book.year}</span>
                <div class="writing-style">
                    <span class="style-icon">✍️</span>
                    <span class="style-text">${book.writingStyle}</span>
                </div>
                <div class="book-themes">
                    ${book.matchedThemes.slice(0, 4).map(theme => {
                        const visual = getThemeVisual(theme);
                        return `<span class="theme-tag-visual" style="border-color: ${visual.color}">
                            <span class="theme-icon">${visual.icon}</span>
                            <span class="theme-name">${theme}</span>
                        </span>`;
                    }).join('')}
                </div>
                <div class="recommendation-reasons">
                    <p>${book.recommendationReason}</p>
                </div>
            </div>
        `;
    }).join('');

    section.style.display = 'block';

    // Add click handlers to recommendation cards
    document.querySelectorAll('.recommendation-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.bookId);
            openBookModal(bookId);
        });
    });
}

// Initialize app
async function initApp() {
    try {
        const response = await fetch('books.json');
        if (!response.ok) throw new Error('Failed to load books');

        booksData = await response.json();

        // Merge with local storage data
        booksData = booksData.map(book => ({
            ...book,
            ...StorageManager.getBookData(book.id)
        }));

        renderBooks(booksData);
        updateStats();
        generateRecommendations();
        initEventListeners();
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById('booksGrid').innerHTML = `
            <div class="no-results">
                <h3>ERROR: DATABASE CONNECTION FAILED</h3>
                <p>Unable to load book database. Please check your connection and try again.</p>
            </div>
        `;
    }
}

// Render books to grid
function renderBooks(books) {
    const grid = document.getElementById('booksGrid');

    if (books.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>NO RECORDS FOUND</h3>
                <p>No books match your current filters. Try adjusting your search criteria.</p>
            </div>
        `;
        document.getElementById('resultsCount').textContent = 'No Books Found';
        return;
    }

    grid.innerHTML = books.map(book => {
        const readStatus = book.read ? 'read' : 'unread';
        const rating = book.rating || 0;

        return `
            <div class="book-card ${readStatus}" data-book-id="${book.id}">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <span class="book-year">${book.year}</span>
                <div class="writing-style-compact">
                    <span class="style-icon">✍️</span> ${book.writingStyle}
                </div>
                <div class="book-themes">
                    ${book.themes.slice(0, 3).map(theme => {
                        const visual = getThemeVisual(theme);
                        return `<span class="theme-tag-visual" style="border-color: ${visual.color}">
                            <span class="theme-icon">${visual.icon}</span>
                            <span class="theme-name">${theme}</span>
                        </span>`;
                    }).join('')}
                </div>
                <div class="book-status">
                    <span class="read-indicator ${readStatus}">
                        ${book.read ? '● READ' : '○ UNREAD'}
                    </span>
                    ${rating > 0 ? `
                        <div class="rating-display">
                            ${Array.from({length: 5}, (_, i) =>
                                `<span class="rating-star ${i < rating ? '' : 'empty'}">★</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('resultsCount').textContent =
        `${books.length} Book${books.length !== 1 ? 's' : ''} Found`;

    // Add click handlers to book cards
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.bookId);
            openBookModal(bookId);
        });
    });
}

// Open book modal
function openBookModal(bookId) {
    currentBook = booksData.find(b => b.id === bookId);
    if (!currentBook) return;

    const modal = document.getElementById('bookModal');

    // Populate modal
    document.getElementById('modalTitle').textContent = currentBook.title;
    document.getElementById('modalAuthor').textContent = `by ${currentBook.author}`;
    document.getElementById('modalYear').textContent = currentBook.year;
    document.getElementById('modalLanguage').textContent = currentBook.language;
    document.getElementById('modalWritingStyle').innerHTML = `<span class="style-icon">✍️</span> ${currentBook.writingStyle}`;
    document.getElementById('modalDescription').textContent = currentBook.description;

    // Themes with icons
    const themesContainer = document.getElementById('modalThemes');
    themesContainer.innerHTML = currentBook.themes.map(theme => {
        const visual = getThemeVisual(theme);
        return `<span class="theme-tag-visual" style="border-color: ${visual.color}">
            <span class="theme-icon">${visual.icon}</span>
            <span class="theme-name">${theme}</span>
        </span>`;
    }).join('');

    // Rating stars
    updateModalStars(currentBook.rating || 0);

    // Read status buttons
    const markAsReadBtn = document.getElementById('markAsRead');
    const markAsUnreadBtn = document.getElementById('markAsUnread');

    if (currentBook.read) {
        markAsReadBtn.style.display = 'none';
        markAsUnreadBtn.style.display = 'block';
    } else {
        markAsReadBtn.style.display = 'block';
        markAsUnreadBtn.style.display = 'none';
    }

    modal.classList.add('active');
}

// Close book modal
function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
    currentBook = null;
}

// Update modal star display
function updateModalStars(rating) {
    const stars = document.querySelectorAll('#modalStars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

// Mark book as read/unread
function toggleReadStatus(read) {
    if (!currentBook) return;

    currentBook.read = read;
    StorageManager.setBookData(currentBook.id, {
        read: currentBook.read,
        rating: currentBook.rating || 0
    });

    // Update the book in the main array
    const bookIndex = booksData.findIndex(b => b.id === currentBook.id);
    if (bookIndex !== -1) {
        booksData[bookIndex] = { ...currentBook };
    }

    // Refresh display
    applyFiltersAndSort();
    updateStats();
    generateRecommendations();

    // Update modal buttons
    const markAsReadBtn = document.getElementById('markAsRead');
    const markAsUnreadBtn = document.getElementById('markAsUnread');

    if (read) {
        markAsReadBtn.style.display = 'none';
        markAsUnreadBtn.style.display = 'block';
    } else {
        markAsReadBtn.style.display = 'block';
        markAsUnreadBtn.style.display = 'none';
    }
}

// Rate book
function rateBook(rating) {
    if (!currentBook) return;

    currentBook.rating = rating;
    currentBook.read = true; // Automatically mark as read when rating

    StorageManager.setBookData(currentBook.id, {
        read: currentBook.read,
        rating: currentBook.rating
    });

    // Update the book in the main array
    const bookIndex = booksData.findIndex(b => b.id === currentBook.id);
    if (bookIndex !== -1) {
        booksData[bookIndex] = { ...currentBook };
    }

    updateModalStars(rating);
    applyFiltersAndSort();
    updateStats();
    generateRecommendations();

    // Update read status buttons
    document.getElementById('markAsRead').style.display = 'none';
    document.getElementById('markAsUnread').style.display = 'block';
}

// Update statistics
function updateStats() {
    const readBooks = booksData.filter(b => b.read);
    const ratedBooks = readBooks.filter(b => b.rating > 0);

    document.getElementById('booksRead').textContent = readBooks.length;
    document.getElementById('totalBooks').textContent = booksData.length;

    if (ratedBooks.length > 0) {
        const avgRating = ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    } else {
        document.getElementById('avgRating').textContent = '0.0';
    }
}

// Filtering and sorting
function applyFiltersAndSort() {
    let filtered = [...booksData];

    // Search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.description.toLowerCase().includes(searchTerm) ||
            book.themes.some(theme => theme.toLowerCase().includes(searchTerm))
        );
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter === 'read') {
        filtered = filtered.filter(b => b.read);
    } else if (statusFilter === 'unread') {
        filtered = filtered.filter(b => !b.read);
    }

    // Rating filter
    const ratingFilter = document.getElementById('ratingFilter').value;
    if (ratingFilter !== 'all') {
        const minRating = parseInt(ratingFilter);
        filtered = filtered.filter(b => b.rating >= minRating);
    }

    // Era filter
    const eraFilter = document.getElementById('eraFilter').value;
    if (eraFilter === 'classic') {
        filtered = filtered.filter(b => b.year < 1980);
    } else if (eraFilter === 'modern') {
        filtered = filtered.filter(b => b.year >= 1980 && b.year < 2000);
    } else if (eraFilter === 'contemporary') {
        filtered = filtered.filter(b => b.year >= 2000);
    }

    // Theme filter
    const themeFilter = document.getElementById('themeFilter').value;
    if (themeFilter !== 'all') {
        filtered = filtered.filter(b =>
            b.themes.some(theme =>
                theme.toLowerCase().includes(themeFilter.toLowerCase())
            )
        );
    }

    // Sorting
    const sortBy = document.getElementById('sortBy').value;
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'author':
                return a.author.localeCompare(b.author);
            case 'year-asc':
                return a.year - b.year;
            case 'year-desc':
                return b.year - a.year;
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            case 'rating-asc':
                return (a.rating || 0) - (b.rating || 0);
            default:
                return 0;
        }
    });

    renderBooks(filtered);
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('eraFilter').value = 'all';
    document.getElementById('themeFilter').value = 'all';
    document.getElementById('sortBy').value = 'title';
    applyFiltersAndSort();
}

// Initialize event listeners
function initEventListeners() {
    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeBookModal);
    document.getElementById('bookModal').addEventListener('click', (e) => {
        if (e.target.id === 'bookModal') {
            closeBookModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBookModal();
        }
    });

    // Star rating
    document.querySelectorAll('#modalStars .star').forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            rateBook(rating);
        });
    });

    // Read status buttons
    document.getElementById('markAsRead').addEventListener('click', () => {
        toggleReadStatus(true);
    });

    document.getElementById('markAsUnread').addEventListener('click', () => {
        toggleReadStatus(false);
    });

    // Filters
    document.getElementById('searchInput').addEventListener('input', applyFiltersAndSort);
    document.getElementById('statusFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('ratingFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('eraFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('themeFilter').addEventListener('change', applyFiltersAndSort);
    document.getElementById('sortBy').addEventListener('change', applyFiltersAndSort);

    // Reset button
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Clear data button
    document.getElementById('clearData').addEventListener('click', () => {
        StorageManager.clearAllData();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initApp);
