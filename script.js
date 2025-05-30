const API_KEY = "8fe84dc6aac7423767ec7e65ea8670a9"; // ← Remplace par ta vraie clé TMDB

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const movieList = document.getElementById("movieList");

// ---------- Recherche de films depuis TMDB ----------
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      displayResults(data.results);
    })
    .catch(error => {
      console.error("Erreur lors de la recherche :", error);
    });
});

function displayResults(movies) {
  searchResults.innerHTML = "";
  movies.forEach(movie => {
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : "https://via.placeholder.com/100x150?text=No+Image";

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${poster}" alt="${movie.title}" width="100">
      <strong>${movie.title}</strong> (${movie.release_date?.slice(0, 4) || "?"})<br>
      <button data-id="${movie.id}" data-title="${movie.title}" data-poster="${poster}">
        ➕ Ajouter à la liste
      </button>
    `;
    searchResults.appendChild(div);
  });

  // Ajoute l’événement pour tous les boutons “Ajouter”
  document.querySelectorAll("#searchResults button").forEach(btn => {
    btn.addEventListener("click", () => {
      const movie = {
        id: btn.dataset.id,
        title: btn.dataset.title,
        poster: btn.dataset.poster
      };
      addToList(movie);
    });
  });
}

// ---------- Gestion de la liste locale ----------
function addToList(movie) {
  let list = loadList();

  // Ne pas ajouter deux fois le même film
  if (list.some(m => m.id === movie.id)) return;

  list.push(movie);
  saveList(list);
  displayList();
}

function loadList() {
  return JSON.parse(localStorage.getItem("movieList")) || [];
}

function saveList(list) {
  localStorage.setItem("movieList", JSON.stringify(list));
}

function displayList() {
  const list = loadList();
  movieList.innerHTML = "";

  list.forEach(movie => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}" width="50">
      ${movie.title}
    `;
    movieList.appendChild(li);
  });
}

// Affiche la liste au chargement
displayList();
