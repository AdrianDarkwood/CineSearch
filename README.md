🎬 CineSearch - Movie Discovery App



A high-performance, fully-responsive web application built with Vanilla JavaScript that allows users to explore, search, and curate their favorite films. This project demonstrates advanced DOM manipulation, state management without frameworks, and seamless integration with the OMDB API. 

🚀 Key Features
Real-time Movie Search: Instant results using the OMDB API with support for "Movie," "Series," and "Episode" filters.
Dynamic Theme Engine: Persistent Dark/Light mode with CSS Variables to ensure zero "theme-flash" on page load.
Detailed Modals: In-depth movie info (Director, Plot, Ratings) fetched on demand for better performance.
Intelligent Pagination: Robust navigation for large result sets with auto-scroll and dynamic button states.
Persistence: A "Favorites" system built on localStorage so user data survives browser restarts.
Smart Recommendations: Suggestions based on your favorites using an intelligent search fallback algorithm.
Mobile-First Design: A responsive grid system scaling from 1 to 4 columns based on viewport size.
🛠️ Technical Stack
Category 	Technology
Frontend	HTML5 (Semantic), CSS3 (Flex/Grid, Variables)
Logic	Vanilla JavaScript (ES6+, Async/Await)
API	OMDB (Open Movie Database)
Persistence	Browser localStorage
Hosting	Optimized for AWS S3 / GitHub Pages / Netlify

🏗️ Architecture & Best Practices
1. Centralized State Management
Unlike many vanilla projects, CineSearch uses a single appState object. This ensures a "Single Source of Truth" and makes debugging significantly easier.
javascript
const appState = {
    currentSearch: '',
    currentPage: 1,
    favorites: getLSFavorites(),
    isDarkMode: localStorage.getItem('darkMode') === 'true'
};
Use code with caution.

2. Modular Functional Design (SRP)
The codebase consists of 30+ specialized functions. This adherence to the Single Responsibility Principle makes the code maintainable and testable.
fetchMovies(): Purely handles API communication and error states.
renderCards(): Dedicated to UI generation and DOM injection.
handlePagination(): Controls logic for navigating result sets.
3. Performance & UX Optimization
Zero Flash Theming: Inlined script execution to apply Dark Mode before the DOM renders.
Lazy Loading: Movie posters are optimized for speed and reduced data usage.
Minimal Footprint: Total bundle size is <60KB, ensuring lightning-fast load times even on 3G connections.
📂 Project Structure
text
.
├── index.html      # Semantic structure & SEO meta tags
├── style.css       # Layout, animations, & CSS variables
├── script.js       # Core logic & state management
└── README.md       # Project documentation
Use code with caution.

🚦 Getting Started
Clone the repo: git clone https://github.com
Add API Key: Open script.js and insert your OMDB API Key.
Launch: Open index.html in your browser.
Created by [Your Name]
Available for Frontend / Full-Stack opportunities.
