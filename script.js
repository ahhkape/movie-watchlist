// script.js
const API_KEY = "8fe84dc6aac7423767ec7e65ea8670a9";     // ← mets TA clé ici

const searchInput  = document.getElementById("searchInput");
const searchBtn    = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const movieList     = document.getElementById("movieList"); // utilisé plus tard

// ---------- Recherche ----------
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .then(data => displayResults(data.results))
    .catch(err => console.error("Erreur TMDB :", err));
});

function displayResults(movies) {
  searchResults.innerHTML = "";

  movies.forEach(movie => {
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : "https://via.placeholder.com/100x150?text=No+Image";

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${poster}" width="60" alt="${movie.title}">
      <div>
        <strong>${movie.title}</strong> (${movie.release_date?.slice(0,4) || "?"})<br>
        <button data-id="${movie.id}"
                data-title="${movie.title}"
                data-poster="${poster}">
          ➕ Add to list
        </button>
      </div>
    `;
    searchResults.appendChild(div);
  });

  // branche chaque bouton “Add to list” (action implémentée en Phase 2)
  document.querySelectorAll("#searchResults button").forEach(btn => {
    btn.addEventListener("click", () => {
      console.log("Cliqué, film =", btn.dataset.title); // pour vérifier
    });
  });
}
