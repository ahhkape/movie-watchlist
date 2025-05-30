
// ===== Sélecteurs =====
const searchInput   = document.getElementById("searchInput");
const searchBtn     = document.getElementById("searchBtn");
const loader        = document.getElementById("loader");
const searchResults = document.getElementById("searchResults");

const movieListEl   = document.getElementById("movieList");
const emptyMsg      = document.getElementById("emptyMsg");
const filterBtns    = document.querySelectorAll(".filter");

let currentFilter = "all"; // all | todo | seen

// ===== Recherche =====
searchBtn.addEventListener("click", () => searchMovies());

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchMovies();
});

function searchMovies() {
  const q = searchInput.value.trim();
  if (!q) return;

  loader.style.display = "inline";
  searchResults.innerHTML = "";

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`)
    .then(r => r.json())
    .then(({ results }) => showSearch(results))
    .catch(() => alert("Erreur réseau ou clé API incorrecte."))
    .finally(() => loader.style.display = "none");
}

function showSearch(movies) {
  if (!movies.length) {
    searchResults.textContent = "No results.";
    return;
  }

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
                data-id="${m.id}" data-title="${m.title}" data-poster="${poster}">
          ➕ Add to list
        </button>
      </div>
    `;
    searchResults.appendChild(div);
  });

  document.querySelectorAll(".add").forEach(btn =>
    btn.addEventListener("click", () => {
      addToList({
        id: btn.dataset.id, title: btn.dataset.title,
        poster: btn.dataset.poster, seen: false
      });
    })
  );
}

// ===== Persistence =====
const load  = () => JSON.parse(localStorage.getItem("movieList") || "[]");
const save  = list => localStorage.setItem("movieList", JSON.stringify(list));

// ===== Operations =====
function addToList(movie) {
  const list = load();
  if (list.some(m => m.id === movie.id)) return;
  list.push(movie); save(list); renderList();
}
function toggleSeen(id) {
  const list = load().map(m => m.id === id ? { ...m, seen: !m.seen } : m);
  save(list); renderList();
}
function removeMovie(id) {
  save(load().filter(m => m.id !== id)); renderList();
}

// ===== Filtres =====
filterBtns.forEach(btn => btn.addEventListener("click", () => {
  filterBtns.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter; // all | todo | seen
  renderList();
}));

// ===== Rendu =====
function renderList() {
  const list = load();
  emptyMsg.style.display = list.length ? "none" : "block";
  movieListEl.innerHTML = "";

  list
    .filter(m => currentFilter === "all"  ? true
              : currentFilter === "todo" ? !m.seen
              :                            m.seen)
    .forEach(m => {
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${m.poster}" width="40" alt="${m.title}">
        <span class="title ${m.seen ? "seen" : ""}">${m.title}</span>
        <button class="toggle" data-id="${m.id}">
          ${m.seen ? "↩️ To-watch" : "✓ Seen"}
        </button>
        <button class="del" data-id="${m.id}">❌</button>
      `;
      movieListEl.appendChild(li);
    });

  movieListEl.querySelectorAll(".toggle")
    .forEach(b => b.onclick = () => toggleSeen(b.dataset.id));
  movieListEl.querySelectorAll(".del")
    .forEach(b => b.onclick = () => removeMovie(b.dataset.id));
}

// ===== Init =====
renderList();
