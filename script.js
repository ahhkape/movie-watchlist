// ─────────── Paramètres ───────────
const API_KEY = "8fe84dc6aac7423767ec7e65ea8670a9";   // ← ta clé TMDB

// ─────────── Sélecteurs DOM ───────────
const searchInput   = document.getElementById("searchInput");
const searchBtn     = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const movieList     = document.getElementById("movieList");

// ─────────── Recherche TMDB ───────────
searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (!q) return;

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`)
    .then(r => r.json())
    .then(({ results }) => showSearch(results))
    .catch(err => console.error("TMDB error:", err));
});

function showSearch(movies) {
  searchResults.innerHTML = "";

  movies.forEach(m => {
    const poster = m.poster_path
      ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
      : "https://via.placeholder.com/100x150?text=No+Image";

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${poster}" width="60" alt="${m.title}">
      <div>
        <strong>${m.title}</strong> (${m.release_date?.slice(0,4) || "?"})<br>
        <button class="add"
                data-id="${m.id}"
                data-title="${m.title}"
                data-poster="${poster}">
          ➕ Add to list
        </button>
      </div>
    `;
    searchResults.appendChild(div);
  });

  // branche chaque bouton “Add to list”
  document.querySelectorAll(".add").forEach(btn =>
    btn.addEventListener("click", () => {
      const movie = {
        id:     btn.dataset.id,
        title:  btn.dataset.title,
        poster: btn.dataset.poster,
        seen:   false               // champ qu’on utilisera plus tard
      };
      addToList(movie);
    })
  );
}

// ─────────── Gestion de la liste ───────────
function loadList() {
  return JSON.parse(localStorage.getItem("movieList") || "[]");
}

function saveList(list) {
  localStorage.setItem("movieList", JSON.stringify(list));
}

function addToList(movie) {
  const list = loadList();

  // éviter les doublons
  if (list.some(m => m.id === movie.id)) return;

  list.push(movie);
  saveList(list);
  renderList();
}

function renderList() {
  const list = loadList();
  movieList.innerHTML = "";

  list.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${m.poster}" width="40" alt="${m.title}">
      ${m.title}
    `;
    movieList.appendChild(li);
  });
}

// ─────────── Affiche la liste au chargement ───────────
renderList();
