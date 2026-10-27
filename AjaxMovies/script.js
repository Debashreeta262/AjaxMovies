// Add your OMDb API key here. A frontend key is visible to users, so use this
// approach only for an educational/demo project.
const API_KEY = "477682f2";

const searchForm = document.getElementById("search-form");
const movieInput = document.getElementById("movie-input");
const searchButton = document.getElementById("search-button");
const movieDetails = document.getElementById("movie-details");

searchForm.addEventListener("submit", searchMovie);

async function searchMovie(event) {
    event.preventDefault();

    // Get the user input and validate that it is not empty.
    const movieName = movieInput.value.trim();
    if (!movieName) {
        showMessage("Please enter a movie name.", true);
        return;
    }

    if (API_KEY === "YOUR_API_KEY") {
        showMessage("Please add your OMDb API key in script.js before searching.", true);
        return;
    }

    // Create the API URL, safely encoding the movie name for the request.
    const apiUrl = `https://www.omdbapi.com/?apikey=${encodeURIComponent(API_KEY)}&t=${encodeURIComponent(movieName)}`;
    setLoading(true);

    try {
        // AJAX request to the external movie API. Fetch runs asynchronously
        // without refreshing this webpage.
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("HTTP request failed");

        // Receive and convert the API response into JSON data.
        const movie = await response.json();

        if (movie.Response === "False") {
            const message = movie.Error && movie.Error.toLowerCase().includes("api key")
                ? "Invalid API key. Please check your OMDb API key."
                : "Movie not found. Please try another movie.";
            showMessage(message, true);
            return;
        }

        // Update the DOM with the returned movie information.
        displayMovie(movie);
    } catch (error) {
        // Handle network errors separately from API responses.
        if (error instanceof TypeError) {
            showMessage("Network error. Please check your internet connection.", true);
        } else {
            showMessage("Unable to fetch movie details. Please try again.", true);
        }
    } finally {
        setLoading(false);
    }
}

function displayMovie(movie) {
    const poster = movie.Poster && movie.Poster !== "N/A"
        ? `<img class="poster" src="${escapeAttribute(movie.Poster)}" alt="Poster for ${escapeAttribute(movie.Title)}">`
        : '<div class="poster-placeholder">Poster unavailable</div>';

    movieDetails.innerHTML = `
        <article class="movie-card">
            <div>${poster}</div>
            <div>
                <h2 class="movie-heading">${escapeHtml(movie.Title)}</h2>
                <p class="movie-year">${escapeHtml(movie.Year)}</p>
                <p class="plot">${escapeHtml(movie.Plot)}</p>
                <dl class="movie-info">
                    ${movieField("Genre", movie.Genre)}
                    ${movieField("IMDb rating", movie.imdbRating)}
                    ${movieField("Director", movie.Director)}
                    ${movieField("Actors", movie.Actors)}
                    ${movieField("Runtime", movie.Runtime)}
                    ${movieField("Language", movie.Language)}
                    ${movieField("Country", movie.Country)}
                    ${movieField("Release date", movie.Released)}
                    ${movieField("IMDb ID", movie.imdbID)}
                    ${movieField("Awards", movie.Awards)}
                </dl>
            </div>
        </article>`;

    const posterImage = movieDetails.querySelector(".poster");
    if (posterImage) {
        posterImage.addEventListener("error", () => {
            const placeholder = document.createElement("div");
            placeholder.className = "poster-placeholder";
            placeholder.textContent = "Poster unavailable";
            posterImage.replaceWith(placeholder);
        });
    }
}

function movieField(label, value) {
    return `<div><dt>${label}</dt><dd>${escapeHtml(value || "N/A")}</dd></div>`;
}

function showMessage(message, isError = false) {
    movieDetails.innerHTML = `<div class="status-message${isError ? " error" : ""}"><p>${escapeHtml(message)}</p></div>`;
}

function setLoading(isLoading) {
    searchButton.disabled = isLoading;
    searchButton.textContent = isLoading ? "Searching..." : "Search";
    movieDetails.setAttribute("aria-busy", String(isLoading));
    if (isLoading) showMessage("Searching...");
}

function escapeHtml(value) {
    return String(value || "N/A").replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[character]));
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
}