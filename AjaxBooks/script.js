const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const bookGrid = document.getElementById("bookGrid");
const statusText = document.getElementById("status");
const resultsTitle = document.getElementById("resultsTitle");
const sortSelect = document.getElementById("sortSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageLabel = document.getElementById("pageLabel");

let books = [];
let currentQuery = "";
let currentPage = 1;
const booksPerPage = 20;

// Search when the user submits the form
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (query === "") {
        showMessage("Please enter a book title or author.");
        return;
    }

    currentQuery = query;
    currentPage = 1;
    searchBooks();
});

// Sort the displayed books
sortSelect.addEventListener("change", function () {
    displayBooks();
});

// Previous page
prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        searchBooks();
    }
});

// Next page
nextBtn.addEventListener("click", function () {
    currentPage++;
    searchBooks();
});

// Fetch book information using AJAX
function searchBooks() {
    const query = currentQuery;

    statusText.textContent = "Searching the library...";
    resultsTitle.textContent = "Discovering books";
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    bookGrid.innerHTML = "";

    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const xhr = new XMLHttpRequest();

    const url =
        "https://openlibrary.org/search.json?q=" +
        encodeURIComponent(query) +
        "&fields=key,title,author_name,first_publish_year,cover_i,subject" +
        "&limit=" + booksPerPage +
        "&page=" + currentPage;

    // Configure the asynchronous GET request
    xhr.open("GET", url, true);

    // Handle the server response
    xhr.onload = function () {
        searchBtn.disabled = false;
        searchBtn.textContent = "Discover";

        if (xhr.status === 200) {
            try {
                // Convert the JSON response into a JavaScript object
                const data = JSON.parse(xhr.responseText);

                books = data.docs || [];

                if (books.length === 0) {
                    statusText.textContent = "No books found.";
                    resultsTitle.textContent = "No results";
                    showMessage(
                        "Try another title, author, or keyword."
                    );
                    updatePagination(data.num_found || 0);
                    return;
                }

                resultsTitle.textContent = "Search results";
                statusText.textContent =
                    "Showing " + books.length +
                    " books for \"" + query + "\".";

                displayBooks();
                updatePagination(data.num_found || 0);

            } catch (error) {
                showMessage("Could not read the book data.");
                statusText.textContent = "Invalid JSON response.";
            }
        } else {
            showMessage("The book service returned an error.");
            statusText.textContent =
                "Request failed. HTTP status: " + xhr.status;
        }
    };

    // Handle network or connection errors
    xhr.onerror = function () {
        searchBtn.disabled = false;
        searchBtn.textContent = "Discover";

        statusText.textContent = "Network error.";
        showMessage(
            "Unable to connect. Check your internet connection and try again."
        );
    };

    // Send the AJAX request
    xhr.send();
}

// Display books dynamically on the webpage
function displayBooks() {
    let sortedBooks = [...books];

    const sortBy = sortSelect.value;

    if (sortBy === "newest") {
        sortedBooks.sort(
            (a, b) =>
                (b.first_publish_year || 0) -
                (a.first_publish_year || 0)
        );
    } else if (sortBy === "oldest") {
        sortedBooks.sort(
            (a, b) =>
                (a.first_publish_year || Infinity) -
                (b.first_publish_year || Infinity)
        );
    } else if (sortBy === "title") {
        sortedBooks.sort(
            (a, b) =>
                (a.title || "").localeCompare(b.title || "")
        );
    }

    bookGrid.innerHTML = "";

    sortedBooks.forEach(function (book) {
        const card = document.createElement("article");
        card.className = "book-card";

        const coverWrap = document.createElement("div");
        coverWrap.className = "cover-wrap";

        if (book.cover_i) {
            const image = document.createElement("img");

            image.src =
                "https://covers.openlibrary.org/b/id/" +
                book.cover_i + "-M.jpg";

            image.alt = "Cover of " + (book.title || "book");
            image.loading = "lazy";

            image.onerror = function () {
                coverWrap.innerHTML = "";
                const placeholder = document.createElement("div");
                placeholder.className = "no-cover";
                placeholder.textContent = book.title || "Book";
                coverWrap.appendChild(placeholder);
            };

            coverWrap.appendChild(image);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "no-cover";
            placeholder.textContent = book.title || "Book";
            coverWrap.appendChild(placeholder);
        }

        const info = document.createElement("div");
        info.className = "book-info";

        const title = document.createElement("h3");
        title.textContent = book.title || "Untitled";

        const author = document.createElement("p");
        author.className = "author";
        author.textContent = "By " +
            (book.author_name
                ? book.author_name.slice(0, 2).join(", ")
                : "Unknown author");

        const year = document.createElement("span");
        year.className = "year";
        year.textContent = book.first_publish_year
            ? "First published " + book.first_publish_year
            : "Publication year unavailable";

        const link = document.createElement("a");
        link.className = "book-link";
        link.textContent = "Explore book →";
        link.href = book.key
            ? "https://openlibrary.org" + book.key
            : "https://openlibrary.org/";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        info.appendChild(title);
        info.appendChild(author);
        info.appendChild(year);
        info.appendChild(document.createElement("br"));
        info.appendChild(link);

        card.appendChild(coverWrap);
        card.appendChild(info);
        bookGrid.appendChild(card);
    });
}

// Display messages inside the results area
function showMessage(message) {
    bookGrid.innerHTML = "";

    const box = document.createElement("div");
    box.className = "message-card";

    const heading = document.createElement("h3");
    heading.textContent = "Book Explorer";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    box.appendChild(heading);
    box.appendChild(paragraph);
    bookGrid.appendChild(box);
}

// Update page navigation
function updatePagination(totalResults) {
    const totalPages = Math.ceil(totalResults / booksPerPage);

    pageLabel.textContent =
        "Page " + currentPage +
        (totalPages ? " of " + totalPages : "");

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled =
        currentPage >= totalPages || totalPages === 0;
}
