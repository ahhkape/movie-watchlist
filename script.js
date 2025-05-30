// ─────────── Paramètres ───────────
const API_KEY = "8fe84dc6aac7423767ec7e65ea8670a9";

// ─────────── Sélecteurs DOM ───────────
const searchInput   = document.getElementById("searchInput");
const searchBtn     = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");

const movieListEl   = document.getElementById("movieList");
const filterBtns    = document.querySelectorAll(".filter");

let currentFilter = "all";           // all | todo | seen

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

  document.querySelectorAll(".add").forEach(btn =>
    btn.addEventListener("click", () => {
      addToList({
        id:     btn.dataset.id,
        title:  btn.dataset.title,
        poster: btn.dataset.poster,
        seen:   false
      });
    })
  );
}

// ─────────── Persistence ───────────
function loadList()  { return JSON.parse(localStorage.getItem("movieList") || "[]"); }
function saveList(l) { localStorage.setItem("movieList", JSON.stringify(l)); }

// ─────────── Opérations sur la liste ───────────
function addToList(movie) {
  const list = loadList();
  if (list.some(m => m.id === movie.id)) return;
  list.push(movie);
  saveList(list);
  renderList();
}

function toggleSeen(id) {
  const list = loadList().map(m => m.id === id ? { ...m, seen: !m.seen } : m);
  saveList(list);
  renderList();
}

function removeMovie(id) {
  const list = loadList().filter(m => m.id !== id);
  saveList(list);
  renderList();
}

// ─────────── Rendu filtré ───────────
filterBtns.forEach(btn =>
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;   // all | todo | seen
    renderList();
  })
);

function renderList() {
  const list = loadList();
  movieListEl.innerHTML = "";

  const filtered = list.filter(m => {
    if (currentFilter === "todo") return !m.seen;
    if (currentFilter === "seen") return  m.seen;
    return true; // all
  });

  filtered.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${m.poster}" width="40" alt="${m.title}">
      <span class="title">${m.title}</span>
      <button class="toggle" data-id="${m.id}">${m.seen ? "↩️ À voir" : "✓ Vu"}</button>
      <button class="del"    data-id="${m.id}">❌</button>
    `;
    if (m.seen) li.querySelector(".title").classList.add("seen");
    movieListEl.appendChild(li);
  });

  // actions
  movieListEl.querySelectorAll(".toggle").forEach(b =>
    b.addEventListener("click", () => toggleSeen(b.dataset.id))
  );
  movieListEl.querySelectorAll(".del").forEach(b =>
    b.addEventListener("click", () => removeMovie(b.dataset.id))
  );
}

// ─────────── Init ───────────
renderList();
