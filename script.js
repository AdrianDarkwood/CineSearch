/* ======================================
   CINESEARCH - MOVIE DISCOVERY APP
   Professional Movie Search with OMDB API
   ====================================== */

// Configuration
const API_KEY = 'c39d18a7';
const BASE_URL = 'https://www.omdbapi.com/';

// Recommended search terms for initial load
const INITIAL_SEARCHES = ['Avengers', 'Batman', 'Inception', 'Matrix', 'Avatar', 'Interstellar'];

// Application State
const appState = {
    currentSearch: '',
    currentPage: 1,
    totalResults: 0,
    typeFilter: '',
    movies: [],
    favorites: getLSFavorites(),
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    hasSearched: false
};

/* ======================================
   DOM ELEMENTS
   ====================================== */
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const typeFilter = document.getElementById('typeFilter');
const moviesGrid = document.getElementById('moviesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const paginationContainer = document.getElementById('paginationContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const movieModal = document.getElementById('movieModal');
const modalClose = document.querySelector('.modal-close');
const themeToggle = document.getElementById('themeToggle');
const navTabs = document.querySelectorAll('.nav-tab');
const searchTab = document.getElementById('searchTab');
const favoritesTab = document.getElementById('favoritesTab');
const favoritesGrid = document.getElementById('favoritesGrid');
const emptyFavorites = document.getElementById('emptyFavorites');
const favCount = document.getElementById('favCount');
const initialContent = document.getElementById('initialContent');
const initialTitle = document.getElementById('initialTitle');
const initialGrid = document.getElementById('initialGrid');

/* ======================================
   INITIALIZATION
   ====================================== */

/**
 * Application initialization
 * Sets up event listeners and theme
 */
window.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    updateFavCount();
    loadInitialContent();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', () => handleSearch());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Type filter
    typeFilter.addEventListener('change', () => {
        appState.currentPage = 1;
        if (appState.currentSearch) {
            handleSearch();
        }
    });

    // Pagination
    prevBtn.addEventListener('click', previousPage);
    nextBtn.addEventListener('click', nextPage);

    // Modal
    modalClose.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

/* ======================================
   SEARCH FUNCTIONALITY
   ====================================== */

/**
 * Handle search submission
 * Validates input and initiates API call
 */
async function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        showError('Please enter a search term');
        return;
    }

    appState.currentSearch = query;
    appState.currentPage = 1;
    appState.typeFilter = typeFilter.value;
    appState.hasSearched = true;
    hideInitialContent();

    await fetchMovies();
}

/**
 * Fetch movies from OMDB API
 * Handles pagination and filtering
 */
async function fetchMovies() {
    clearErrors();
    showLoading(true);
    moviesGrid.innerHTML = '';
    paginationContainer.classList.add('hidden');

    try {
        // Build API URL with parameters
        let url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(appState.currentSearch)}&page=${appState.currentPage}`;

        if (appState.typeFilter) {
            url += `&type=${appState.typeFilter}`;
        }

        const response = await fetch(url);

        // Network error check
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }

        const data = await response.json();

        // API error check
        if (data.Response === 'False') {
            showError(data.Error || 'No movies found');
            showLoading(false);
            return;
        }

        // Store results and display
        appState.movies = data.Search || [];
        appState.totalResults = parseInt(data.totalResults) || 0;

        displayMovies(appState.movies);
        updatePagination();
        showLoading(false);
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError('Network error. Please check your connection and try again.');
        showLoading(false);
    }
}

/**
 * Display movies in grid
 * Creates and renders movie cards
 */
function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        showError('No results found');
        return;
    }

    moviesGrid.innerHTML = '';

    movies.forEach((movie) => {
        const card = createMovieCard(movie);
        moviesGrid.appendChild(card);
    });
}

/**
 * Create a movie card element
 * @param {Object} movie - Movie data from API
 * @returns {HTMLElement} Movie card element
 */
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const isFavorite = isMovieFavorite(movie.imdbID);
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${posterUrl}" alt="${movie.Title}" loading="lazy">
            <button class="favorite-btn ${isFavorite ? 'liked' : ''}">♡</button>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${movie.Year}</span>
                <span class="movie-type">${movie.Type}</span>
            </div>
        </div>
    `;

    // Event listeners
    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(movie);
        card.querySelector('.favorite-btn').classList.toggle('liked');
    });

    card.addEventListener('click', () => {
        openMovieDetails(movie.imdbID);
    });

    return card;
}

/* ======================================
   PAGINATION
   ====================================== */

/**
 * Update pagination controls
 * Calculates and displays page information
 */
function updatePagination() {
    const totalPages = Math.ceil(appState.totalResults / 10);
    const startResult = (appState.currentPage - 1) * 10 + 1;
    const endResult = Math.min(appState.currentPage * 10, appState.totalResults);

    // Update page info
    pageInfo.textContent = `Page ${appState.currentPage} of ${totalPages}`;

    // Show/hide pagination
    if (totalPages > 1) {
        paginationContainer.classList.remove('hidden');
    } else {
        paginationContainer.classList.add('hidden');
    }

    // Disable buttons based on current page
    prevBtn.disabled = appState.currentPage === 1;
    nextBtn.disabled = appState.currentPage === totalPages;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Go to previous page
 */
function previousPage() {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        fetchMovies();
    }
}

/**
 * Go to next page
 */
function nextPage() {
    const totalPages = Math.ceil(appState.totalResults / 10);
    if (appState.currentPage < totalPages) {
        appState.currentPage++;
        fetchMovies();
    }
}

/* ======================================
   MOVIE DETAILS MODAL
   ====================================== */

/**
 * Open movie details modal
 * Fetches full details from API
 * @param {String} imdbID - IMDB ID of the movie
 */
async function openMovieDetails(imdbID) {
    showLoading(true);

    try {
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }

        const data = await response.json();

        if (data.Response === 'False') {
            showError('Could not load movie details');
            showLoading(false);
            return;
        }

        displayMovieDetails(data);
        showLoading(false);
        movieModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching details:', error);
        showError('Error loading movie details');
        showLoading(false);
    }
}

/**
 * Display movie details in modal
 * @param {Object} movie - Full movie data from API
 */
function displayMovieDetails(movie) {
    const isFavorite = isMovieFavorite(movie.imdbID);

    // Update modal content
    document.getElementById('modalPoster').src =
        movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('modalTitle').textContent = movie.Title;
    document.getElementById('modalYear').textContent = movie.Year || 'N/A';
    document.getElementById('modalType').textContent = movie.Type || 'N/A';
    document.getElementById('modalRuntime').textContent = movie.Runtime || 'N/A';
    document.getElementById('modalGenre').textContent = movie.Genre || 'N/A';
    document.getElementById('modalDirector').textContent = movie.Director || 'N/A';
    document.getElementById('modalPlot').textContent = movie.Plot !== 'N/A' ? movie.Plot : 'Plot not available';

    // Rating with styling
    const ratingEl = document.getElementById('modalRating');
    ratingEl.textContent =
        movie.imdbRating !== 'N/A' ? `${movie.imdbRating}/10` : 'N/A';

    // Favorite button
    const favBtn = document.getElementById('modalFavBtn');
    favBtn.textContent = isFavorite ? '❤️ Remove from Favorites' : '♡ Add to Favorites';
    favBtn.classList.toggle('added', isFavorite);
    favBtn.onclick = () => {
        toggleFavorite(movie);
        displayMovieDetails(movie); // Refresh button state
    };
}

/**
 * Close movie details modal
 */
function closeModal() {
    movieModal.classList.add('hidden');
}

/* ======================================
   FAVORITES MANAGEMENT
   ====================================== */

/**
 * Get favorites from localStorage
 * @returns {Array} Array of favorite movies
 */
function getLSFavorites() {
    const stored = localStorage.getItem('cinesearchFavorites');
    return stored ? JSON.parse(stored) : [];
}

/**
 * Save favorites to localStorage
 */
function saveLSFavorites() {
    localStorage.setItem('cinesearchFavorites', JSON.stringify(appState.favorites));
}

/**
 * Check if movie is in favorites
 * @param {String} imdbID - IMDB ID to check
 * @returns {Boolean} Is movie favorited
 */
function isMovieFavorite(imdbID) {
    return appState.favorites.some(fav => fav.imdbID === imdbID);
}

/**
 * Toggle favorite status of a movie
 * @param {Object} movie - Movie data
 */
function toggleFavorite(movie) {
    const index = appState.favorites.findIndex(fav => fav.imdbID === movie.imdbID);

    if (index > -1) {
        // Remove from favorites
        appState.favorites.splice(index, 1);
    } else {
        // Add to favorites
        appState.favorites.push({
            imdbID: movie.imdbID,
            Title: movie.Title,
            Year: movie.Year,
            Type: movie.Type,
            Poster: movie.Poster,
            Plot: movie.Plot || 'N/A'
        });
    }

    saveLSFavorites();
    updateFavCount();
}

/**
 * Update favorites counter
 */
function updateFavCount() {
    favCount.textContent = appState.favorites.length;
}

/**
 * Display favorites section
 */
function displayFavorites() {
    favoritesGrid.innerHTML = '';

    if (appState.favorites.length === 0) {
        emptyFavorites.classList.remove('hidden');
        return;
    }

    emptyFavorites.classList.add('hidden');

    appState.favorites.forEach(movie => {
        const card = createMovieCard(movie);
        favoritesGrid.appendChild(card);
    });
}

/* ======================================
   TAB NAVIGATION
   ====================================== */

/**
 * Switch between search and favorites tabs
 * @param {String} tab - Tab name ('search' or 'favorites')
 */
function switchTab(tab) {
    // Update active tab
    navTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update sections
    if (tab === 'search') {
        searchTab.classList.remove('hidden');
        favoritesTab.classList.add('hidden');
    } else {
        searchTab.classList.add('hidden');
        favoritesTab.classList.remove('hidden');
        displayFavorites();
    }
}

/* ======================================
   THEME MANAGEMENT
   ====================================== */

/**
 * Initialize theme based on localStorage or system preference
 */
function initializeTheme() {
    // Read from localStorage, or default to system preference
    let isDark = localStorage.getItem('darkMode');
    
    if (isDark === null) {
        // No saved preference, use system preference
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        // Convert string to boolean
        isDark = isDark === 'true';
    }

    appState.isDarkMode = isDark;

    if (isDark) {
        document.body.classList.add('dark-mode');
        document.documentElement.style.colorScheme = 'dark';
        themeToggle.querySelector('.theme-icon').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.style.colorScheme = 'light';
        themeToggle.querySelector('.theme-icon').textContent = '🌙';
    }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    appState.isDarkMode = !appState.isDarkMode;
    localStorage.setItem('darkMode', String(appState.isDarkMode));
    initializeTheme();
}

/* ======================================
   UI UTILITIES
   ====================================== */

/**
 * Show/hide loading spinner
 * @param {Boolean} show - Show or hide spinner
 */
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

/**
 * Display error message
 * @param {String} message - Error message to display
 */
function showError(message) {
    clearErrors();
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

/**
 * Clear all error messages
 */
function clearErrors() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

/* ======================================
   INITIAL CONTENT LOADING
   ====================================== */

/**
 * Load initial content on page load
 * Shows either recommended movies based on favorites
 * or popular movies if no favorites exist
 */
async function loadInitialContent() {
    // Only load initial content if user hasn't searched yet
    if (appState.hasSearched) {
        hideInitialContent();
        return;
    }

    showLoading(true);

    try {
        if (appState.favorites.length > 0) {
            // Fetch similar movies based on first favorite
            await fetchSimilarMovies();
        } else {
            // Fetch popular movies
            await fetchPopularMovies();
        }
        showLoading(false);
    } catch (error) {
        console.error('Error loading initial content:', error);
        showLoading(false);
    }
}

/**
 * Fetch movies similar to favorites
 * Uses the first favorite's title to search for related content
 */
async function fetchSimilarMovies() {
    const firstFavorite = appState.favorites[0];
    if (!firstFavorite) return;

    try {
        // Extract primary keyword from favorite title for better recommendations
        const searchTerm = firstFavorite.Title.split(':')[0].trim();
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie&page=1`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch similar movies');
        }

        const data = await response.json();

        if (data.Response === 'True' && data.Search) {
            // Filter out the favorite itself and show first 6-8
            const filteredMovies = data.Search.filter(
                m => m.imdbID !== firstFavorite.imdbID
            ).slice(0, 8);

            displayInitialMovies(
                filteredMovies,
                `Recommended Based on "${firstFavorite.Title}"`
            );
        } else {
            // If similar search fails, fall back to popular
            await fetchPopularMovies();
        }
    } catch (error) {
        console.error('Error fetching similar movies:', error);
        await fetchPopularMovies();
    }
}

/**
 * Fetch popular/trending movies
 * Uses predefined search terms to show popular content
 */
async function fetchPopularMovies() {
    try {
        // Random selection from popular search terms
        const searchTerm = INITIAL_SEARCHES[Math.floor(Math.random() * INITIAL_SEARCHES.length)];
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&type=movie&page=1`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch popular movies');
        }

        const data = await response.json();

        if (data.Response === 'True' && data.Search) {
            displayInitialMovies(data.Search.slice(0, 8), 'Popular Movies');
        }
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

/**
 * Display initial movies in the initial content section
 * @param {Array} movies - Array of movies to display
 * @param {String} title - Section title
 */
function displayInitialMovies(movies, title) {
    initialTitle.textContent = title;
    initialGrid.innerHTML = '';
    initialContent.classList.remove('hidden');

    if (!movies || movies.length === 0) {
        initialContent.classList.add('hidden');
        return;
    }

    movies.forEach((movie) => {
        const card = createMovieCard(movie);
        initialGrid.appendChild(card);
    });
}

/**
 * Hide initial content section
 */
function hideInitialContent() {
    initialContent.classList.add('hidden');
}