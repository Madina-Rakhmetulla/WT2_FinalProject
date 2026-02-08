function byId(id) {
  return document.getElementById(id);
}

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  try {
    localStorage.setItem("user", JSON.stringify(user || null));
  } catch (e) {
    // ignore
  }
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function isLoggedIn() {
  return Boolean(getToken());
}

function isAdmin() {
  const u = getUser();
  return Boolean(u && u.role === "admin");
}

function ensureToastContainer() {
  let c = document.getElementById("toastContainer");
  if (c) return c;
  c = document.createElement("div");
  c.id = "toastContainer";
  c.className = "toast-container position-fixed top-0 end-0 p-3";
  document.body.appendChild(c);
  return c;
}

function showToast(message, variant = "info") {
  const text = typeof message === "string" ? message : JSON.stringify(message, null, 2);

  // If Bootstrap isn't available for some reason, fallback to alert.
  if (!window.bootstrap || !window.bootstrap.Toast) {
    alert(text);
    return;
  }

  const container = ensureToastContainer();
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${variant} border-0`;
  el.setAttribute("role", "alert");
  el.setAttribute("aria-live", "assertive");
  el.setAttribute("aria-atomic", "true");

  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHtml(text).replace(/\n/g, "<br>")}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2800 });
  t.show();

  el.addEventListener("hidden.bs.toast", () => {
    el.remove();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setOutput(obj, variant = "secondary") {
  // Legacy support: we no longer show a big "Output" box.
  // Keep a toast + console log so debugging is still possible.
  try {
    console.log("[Output]", obj);
  } catch (e) {}

  if (variant === "secondary") {
    showToast(obj, "secondary");
  } else {
    showToast(obj, variant);
  }
}

function setAuthStatus() {
  const el = byId("authStatus");
  if (!el) return;
  el.textContent = isLoggedIn() ? "Logged in" : "Not logged in";
}

function updateNavUserBadge() {
  const badge = byId("navUser");
  if (!badge) return;
  const user = getUser();
  if (!user) {
    badge.textContent = "";
    return;
  }
  badge.textContent = user.role ? `${user.email} (${user.role})` : user.email;
}

// Make navigation logical: users should not type page URLs manually.
// This function enhances existing navbars by injecting Login/Profile/Admin links
// and tagging them with data-auth-only / data-auth-hidden / data-admin-only so
// applyAuthUI() can show/hide them.
function enhanceNavigation() {
  const navs = document.querySelectorAll("nav.nav-links");
  if (!navs || !navs.length) return;

  navs.forEach((nav) => {
    // 1) Tag existing Account link (if present)
    const accountLink = Array.from(nav.querySelectorAll("a")).find((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      return href.endsWith("account.html") || href.endsWith("/account.html");
    });

    if (accountLink) {
      accountLink.setAttribute("data-auth-only", "");
      // Keep wording consistent
      if (!accountLink.textContent || accountLink.textContent.trim().toLowerCase() === "account") {
        accountLink.textContent = "Profile";
      }
    }

    // 2) Add Login link (shown only when NOT logged in)
    let loginLink = Array.from(nav.querySelectorAll("a")).find((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      return href.endsWith("register.html") || href.endsWith("/register.html") || href.endsWith("auth.html");
    });
    if (!loginLink) {
      loginLink = document.createElement("a");
      loginLink.href = "register.html";
      loginLink.textContent = "Login";
      loginLink.setAttribute("data-auth-hidden", "");

      // Insert before the theme button if it exists, else append.
      const themeBtn = nav.querySelector("#themeToggle");
      if (themeBtn && themeBtn.parentElement === nav) {
        nav.insertBefore(loginLink, themeBtn);
      } else {
        nav.appendChild(loginLink);
      }
    } else {
      // Ensure correct visibility behavior if the link exists.
      loginLink.setAttribute("data-auth-hidden", "");
      if (!loginLink.textContent || loginLink.textContent.trim().toLowerCase() === "register") {
        loginLink.textContent = "Login";
      }
    }

    // 3) Add Admin Panel link (shown only for admins)
    let adminLink = Array.from(nav.querySelectorAll("a")).find((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      return href.endsWith("library-admin.html") || href.endsWith("/library-admin.html");
    });

    if (!adminLink) {
      adminLink = document.createElement("a");
      adminLink.href = "library-admin.html";
      adminLink.textContent = "Admin Panel";
      adminLink.setAttribute("data-admin-only", "");

      // Place it near the Profile link if possible.
      const insertBefore = accountLink || nav.querySelector("#themeToggle");
      if (insertBefore && insertBefore.parentElement === nav) {
        nav.insertBefore(adminLink, insertBefore);
      } else {
        nav.appendChild(adminLink);
      }
    } else {
      adminLink.setAttribute("data-admin-only", "");
      if (!adminLink.textContent || adminLink.textContent.trim().toLowerCase() === "library-admin") {
        adminLink.textContent = "Admin Panel";
      }
    }
  });
}

function applyAuthUI() {
  enhanceNavigation();
  const loggedIn = isLoggedIn();
  const admin = isAdmin();

  document.querySelectorAll("[data-auth-only]").forEach((el) => {
    el.style.display = loggedIn ? "" : "none";
  });
  document.querySelectorAll("[data-auth-hidden]").forEach((el) => {
    el.style.display = loggedIn ? "none" : "";
  });
  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.style.display = admin ? "" : "none";
  });

  // Admin page gate
  const gate = byId("adminGate");
  const content = byId("adminContent");
  if (gate) gate.style.display = admin ? "none" : "";
  if (content) content.style.display = admin ? "" : "none";

  setAuthStatus();
  updateNavUserBadge();
}

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

function prettyError(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.data && err.data.message) return err.data.message;
  if (err.status) return `Request failed (${err.status})`;
  return JSON.stringify(err);
}

// Apply UI visibility on every page load
applyAuthUI();

// -------------------- AUTH (register.html / auth.html) --------------------
if (byId("registerForm") && byId("loginForm")) {
  setAuthStatus();
  updateNavUserBadge();

  // Sync hidden role with advanced role selector (teacher demo)
  const roleHidden = byId("regRole");
  const roleVisible = byId("regRoleVisible");
  if (roleHidden && roleVisible) {
    roleVisible.addEventListener("change", () => {
      roleHidden.value = roleVisible.value;
    });
  }

  byId("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: byId("regEmail").value.trim(),
        password: byId("regPassword").value,
        role: (roleHidden ? roleHidden.value : "user")
      };
      await api("/api/auth/register", { method: "POST", body: payload });
      showToast("Account created. Now login.", "success");

      // Switch to login tab if it exists
      const loginTabBtn = byId("tab-login");
      if (loginTabBtn) loginTabBtn.click();

      byId("registerForm").reset();
      if (roleHidden) roleHidden.value = "user";
      if (roleVisible) roleVisible.value = "user";
    } catch (err) {
      showToast(prettyError(err), "danger");
      console.error(err);
    }
  });

  byId("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: byId("loginEmail").value.trim(),
        password: byId("loginPassword").value
      };
      const data = await api("/api/auth/login", { method: "POST", body: payload });
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) setUser(data.user);
      applyAuthUI();
      showToast(`Logged in as ${data.user?.email || "user"}`, "success");
    } catch (err) {
      showToast(prettyError(err), "danger");
      console.error(err);
    }
  });

  const copyBtn = byId("copyTokenBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        const token = getToken() || "";
        await navigator.clipboard.writeText(token);
        showToast("Token copied", "secondary");
      } catch (err) {
        showToast("Could not copy token", "warning");
      }
    });
  }

  const logoutBtn = byId("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      applyAuthUI();
      showToast("Logged out", "secondary");
    });
  }
}

// -------------------- Authors + Books rendering --------------------
async function loadAuthorsIntoSelect(selectEl) {
  if (!selectEl) return [];

  const authors = await api("/api/authors");
  selectEl.innerHTML = "";

  authors.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a._id;
    opt.textContent = a.birthYear ? `${a.fullName} (${a.birthYear})` : a.fullName;
    selectEl.appendChild(opt);
  });

  return authors;
}

function authorCard(author) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";

  col.innerHTML = `
    <div class="db-card h-100 p-3">
      <div class="d-flex align-items-start justify-content-between gap-2">
        <div>
          <h3 class="h6 mb-1">${escapeHtml(author.fullName)}</h3>
          <div class="text-secondary small">${author.birthYear ? `Born: ${escapeHtml(author.birthYear)}` : ""}</div>
        </div>
        <span class="db-pill">Author</span>
      </div>
    </div>
  `;

  return col;
}

async function renderAuthors() {
  const list = byId("authorsList");
  const grid = byId("authorsGrid");
  const empty = byId("authorsEmpty");

  if (!list && !grid) return [];

  const authors = await api("/api/authors");

  if (list) {
    list.innerHTML = "";
    authors.forEach((a) => {
      const li = document.createElement("li");
      li.textContent = a.birthYear ? `${a.fullName} (${a.birthYear})` : a.fullName;
      list.appendChild(li);
    });
  }

  if (grid) {
    grid.innerHTML = "";
    authors.forEach((a) => grid.appendChild(authorCard(a)));
  }

  if (empty) empty.style.display = authors.length ? "none" : "";
  return authors;
}

function openBookModal(book) {
  const modalEl = byId("bookDetailsModal");
  const titleEl = byId("bookModalTitle");
  const bodyEl = byId("bookModalBody");
  if (!modalEl || !titleEl || !bodyEl || !window.bootstrap) return;

  const author = book.author?.fullName || "Unknown author";
  const year = book.year ? String(book.year) : "—";

  titleEl.textContent = book.title;
  bodyEl.innerHTML = `
    <div class="d-flex gap-3">
      <img class="rounded" src="https://picsum.photos/seed/${encodeURIComponent(book._id || book.title)}/800/500" alt="Cover" style="width: 160px; height: 110px; object-fit: cover;" />
      <div>
        <div class="mb-2"><strong>Author:</strong> ${escapeHtml(author)}</div>
        <div class="mb-2"><strong>Year:</strong> ${escapeHtml(year)}</div>
        <div class="text-secondary small"><strong>ID:</strong> ${escapeHtml(book._id || "")}</div>
      </div>
    </div>
  `;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function bookCard(book) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";

  const author = book.author?.fullName || "Unknown author";
  const year = book.year ? String(book.year) : "";
  const seed = encodeURIComponent(book._id || book.title);

  col.innerHTML = `
    <div class="db-card h-100" role="button" aria-label="Open book">
      <img class="db-cover" src="https://picsum.photos/seed/${seed}/800/500" alt="${escapeHtml(book.title)}" />
      <div class="p-3">
        <h3 class="h6 mb-1">${escapeHtml(book.title)}</h3>
        <div class="text-secondary small mb-2">${escapeHtml(author)}${year ? ` • ${escapeHtml(year)}` : ""}</div>
        <div class="db-meta">
          <span class="db-pill">Database</span>
          ${year ? `<span class="db-pill">${escapeHtml(year)}</span>` : ""}
        </div>
      </div>
    </div>
  `;

  col.querySelector(".db-card")?.addEventListener("click", () => openBookModal(book));
  return col;
}

async function renderBooks() {
  const list = byId("booksList");
  const grid = byId("booksGrid");
  const empty = byId("booksEmpty");

  if (!list && !grid) return [];

  const books = await api("/api/books");

  if (list) {
    list.innerHTML = "";
    books.forEach((b) => {
      const li = document.createElement("li");
      const author = b.author?.fullName ? b.author.fullName : "Unknown author";
      li.textContent = `${b.title} — ${author}${b.year ? ` (${b.year})` : ""}`;
      list.appendChild(li);
    });
  }

  if (grid) {
    grid.innerHTML = "";
    books.forEach((b) => grid.appendChild(bookCard(b)));
  }

  if (empty) empty.style.display = books.length ? "none" : "";
  return books;
}

// Refresh buttons (public)
const refreshAuthorsBtn = byId("refreshAuthorsBtn");
if (refreshAuthorsBtn) {
  refreshAuthorsBtn.addEventListener("click", async () => {
    try {
      const authors = await renderAuthors();
      showToast(`Authors refreshed (${authors.length})`, "secondary");
    } catch (err) {
      showToast(prettyError(err), "danger");
    }
  });
}

const refreshBooksBtn = byId("refreshBooksBtn");
if (refreshBooksBtn) {
  refreshBooksBtn.addEventListener("click", async () => {
    try {
      const books = await renderBooks();
      showToast(`Books refreshed (${books.length})`, "secondary");
    } catch (err) {
      showToast(prettyError(err), "danger");
    }
  });
}

// Initial public load
(async function initPublicLists() {
  try {
    if (byId("authorsList") || byId("authorsGrid")) {
      await renderAuthors();
    }
    if (byId("booksList") || byId("booksGrid")) {
      await renderBooks();
    }
  } catch (err) {
    // Keep pages usable even if DB is not connected
    console.error(err);
  }
})();

// -------------------- Admin forms (library-admin.html) --------------------
if (byId("authorForm") && byId("bookForm")) {
  (async function initAdminPage() {
    try {
      applyAuthUI();
      if (!isAdmin()) return;

      await loadAuthorsIntoSelect(byId("authorSelect"));
      await renderAuthors();
      await renderBooks();
    } catch (err) {
      showToast(prettyError(err), "danger");
    }
  })();

  byId("authorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: byId("authorName").value.trim(),
        birthYear: byId("authorYear").value
      };
      const created = await api("/api/authors", { method: "POST", body: payload, auth: true });
      byId("authorForm").reset();
      await loadAuthorsIntoSelect(byId("authorSelect"));
      await renderAuthors();
      showToast(`Author added: ${created.fullName}`, "success");
    } catch (err) {
      showToast(prettyError(err), "danger");
      console.error(err);
    }
  });

  byId("bookForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: byId("bookTitle").value.trim(),
        year: byId("bookYear").value,
        author: byId("authorSelect").value
      };
      const created = await api("/api/books", { method: "POST", body: payload, auth: true });
      byId("bookForm").reset();
      await renderBooks();
      showToast(`Book added: ${created.title}`, "success");
    } catch (err) {
      showToast(prettyError(err), "danger");
      console.error(err);
    }
  });
}

// -------------------- Admin offcanvas forms (catalog.html) --------------------
if (byId("authorCreateForm") || byId("bookCreateForm")) {
  (async function initAdminOffcanvas() {
    try {
      applyAuthUI();
      if (!isAdmin()) return;
      await loadAuthorsIntoSelect(byId("authorSelectInline"));
    } catch (err) {
      console.error(err);
    }
  })();

  const authorCreateForm = byId("authorCreateForm");
  if (authorCreateForm) {
    authorCreateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const payload = {
          fullName: byId("authorNameInline").value.trim(),
          birthYear: byId("authorYearInline").value
        };
        const created = await api("/api/authors", { method: "POST", body: payload, auth: true });
        authorCreateForm.reset();
        await loadAuthorsIntoSelect(byId("authorSelectInline"));
        if (byId("authorsGrid") || byId("authorsList")) await renderAuthors();
        showToast(`Author added: ${created.fullName}`, "success");
      } catch (err) {
        showToast(prettyError(err), "danger");
        console.error(err);
      }
    });
  }

  const bookCreateForm = byId("bookCreateForm");
  if (bookCreateForm) {
    bookCreateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const payload = {
          title: byId("bookTitleInline").value.trim(),
          year: byId("bookYearInline").value,
          author: byId("authorSelectInline").value
        };
        const created = await api("/api/books", { method: "POST", body: payload, auth: true });
        bookCreateForm.reset();
        await renderBooks();
        showToast(`Book added: ${created.title}`, "success");
      } catch (err) {
        showToast(prettyError(err), "danger");
        console.error(err);
      }
    });
  }
}
