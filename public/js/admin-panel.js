/* Admin Panel (Final Project) */

(function () {
  function $(id) { return document.getElementById(id); }

  const state = {
    authors: [],
    books: [],
    members: [],
    loans: []
  };

  function authHeaders() {
    const token = (typeof getToken === "function") ? getToken() : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      }
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const msg = (data && data.message) ? data.message : `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  function fmtDate(d) {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return "";
    }
  }

  function setAdminGate() {
    const gate = $("adminGate");
    const content = $("adminContent");

    const loggedIn = typeof isLoggedIn === "function" ? isLoggedIn() : false;
    const admin = typeof isAdmin === "function" ? isAdmin() : false;

    if (loggedIn && admin) {
      if (gate) gate.style.display = "none";
      if (content) content.style.display = "block";
      return true;
    }

    if (gate) gate.style.display = "block";
    if (content) content.style.display = "none";
    return false;
  }

  function toast(msg, variant) {
    if (typeof showToast === "function") return showToast(msg, variant);
    alert(msg);
  }

  /* ---------- Render Tables ---------- */

  function renderAuthors() {
    const tbody = $("authorsTbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    state.authors.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeCell(a.fullName)}</td>
        <td>${a.birthYear ?? ""}</td>
        <td class="text-end">
          <button class="btn btn-outline-light btn-sm me-1" data-act="edit-author" data-id="${a._id}">Edit</button>
          <button class="btn btn-outline-danger btn-sm" data-act="del-author" data-id="${a._id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderBooks() {
    const tbody = $("booksTbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    state.books.forEach((b) => {
      const authorName = b.author && b.author.fullName ? b.author.fullName : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeCell(b.title)}</td>
        <td>${b.year ?? ""}</td>
        <td>${escapeCell(authorName)}</td>
        <td class="text-end">
          <button class="btn btn-outline-light btn-sm me-1" data-act="edit-book" data-id="${b._id}">Edit</button>
          <button class="btn btn-outline-danger btn-sm" data-act="del-book" data-id="${b._id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderMembers() {
    const tbody = $("membersTbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    state.members.forEach((m) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeCell(m.firstName)}</td>
        <td>${escapeCell(m.lastName || "")}</td>
        <td>${escapeCell(m.email)}</td>
        <td>${escapeCell(m.country)}</td>
        <td>${escapeCell(m.gender || "")}</td>
        <td class="text-end">
          <button class="btn btn-outline-light btn-sm me-1" data-act="edit-member" data-id="${m._id}">Edit</button>
          <button class="btn btn-outline-danger btn-sm" data-act="del-member" data-id="${m._id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderLoans() {
    const tbody = $("loansTbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    state.loans.forEach((l) => {
      const bookTitle = l.book ? l.book.title : "";
      const authorName = l.book && l.book.author ? l.book.author.fullName : "";
      const memberName = l.member ? `${l.member.firstName} ${l.member.lastName || ""}`.trim() : "";
      const status = l.returnedAt ? "Returned" : "Active";

      const actions = l.returnedAt
        ? `<button class="btn btn-outline-danger btn-sm" data-act="del-loan" data-id="${l._id}">Delete</button>`
        : `
          <button class="btn btn-outline-success btn-sm me-1" data-act="return-loan" data-id="${l._id}">Mark returned</button>
          <button class="btn btn-outline-danger btn-sm" data-act="del-loan" data-id="${l._id}">Delete</button>
        `;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeCell(bookTitle)}</td>
        <td>${escapeCell(authorName)}</td>
        <td>${escapeCell(memberName)}</td>
        <td>${fmtDate(l.borrowedAt)}</td>
        <td>${status}</td>
        <td class="text-end">${actions}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeCell(v) {
    const s = String(v ?? "");
    if (typeof escapeHtml === "function") return escapeHtml(s);
    return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  }

  /* ---------- Load Data ---------- */

  async function loadAll() {
    // Public reads
    state.authors = await api("/api/authors");
    state.books = await api("/api/books");
    state.members = await api("/api/members");

    // Admin read
    state.loans = await api("/api/loans", { headers: { ...authHeaders() } });

    renderAuthors();
    renderBooks();
    renderMembers();
    renderLoans();
    refreshSelectOptions();
  }

  function refreshSelectOptions() {
    // Books: authors
    const selAuthor = $("bookAuthor");
    if (selAuthor) {
      selAuthor.innerHTML = state.authors.map(a => `<option value="${a._id}">${escapeCell(a.fullName)}</option>`).join("");
    }

    // Loans: members & available books
    const selMember = $("loanMember");
    if (selMember) {
      selMember.innerHTML = state.members.map(m => `<option value="${m._id}">${escapeCell(`${m.firstName} ${m.lastName || ""}`.trim())}</option>`).join("");
    }

    const activeBookIds = new Set(state.loans.filter(l => !l.returnedAt).map(l => (l.book && l.book._id) ? l.book._id : l.book).filter(Boolean));
    const availableBooks = state.books.filter(b => !activeBookIds.has(b._id));

    const selBook = $("loanBook");
    if (selBook) {
      selBook.innerHTML = availableBooks.map(b => {
        const a = b.author && b.author.fullName ? ` — ${b.author.fullName}` : "";
        return `<option value="${b._id}">${escapeCell(b.title + a)}</option>`;
      }).join("");
    }
  }

  /* ---------- Modals ---------- */

  function showModal(id) {
    const el = $(id);
    if (!el) return null;
    const modal = new bootstrap.Modal(el);
    modal.show();
    return modal;
  }

  /* ---------- CRUD: Authors ---------- */

  async function openAddAuthor() {
    $("authorModalTitle").textContent = "Add Author";
    $("authorId").value = "";
    $("authorName").value = "";
    $("authorBirthYear").value = "";
    showModal("authorModal");
  }

  async function openEditAuthor(id) {
    const a = state.authors.find(x => x._id === id);
    if (!a) return;
    $("authorModalTitle").textContent = "Edit Author";
    $("authorId").value = a._id;
    $("authorName").value = a.fullName || "";
    $("authorBirthYear").value = a.birthYear ?? "";
    showModal("authorModal");
  }

  async function saveAuthor(e) {
    e.preventDefault();
    const id = $("authorId").value.trim();
    const payload = {
      fullName: $("authorName").value.trim(),
      birthYear: $("authorBirthYear").value === "" ? undefined : Number($("authorBirthYear").value)
    };

    if (!payload.fullName) return toast("Full Name is required", "warning");

    if (id) {
      await api(`/api/authors/${id}`, { method: "PUT", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      toast("Author updated", "success");
    } else {
      await api("/api/authors", { method: "POST", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      toast("Author created", "success");
    }

    bootstrap.Modal.getInstance($("authorModal")).hide();
    await loadAll();
  }

  async function deleteAuthor(id) {
    if (!confirm("Delete this author?")) return;
    await api(`/api/authors/${id}`, { method: "DELETE", headers: { ...authHeaders() } });
    toast("Author deleted", "success");
    await loadAll();
  }

  /* ---------- CRUD: Books ---------- */

  async function openAddBook() {
    $("bookModalTitle").textContent = "Add Book";
    $("bookId").value = "";
    $("bookTitle").value = "";
    $("bookYear").value = "";
    refreshSelectOptions();
    showModal("bookModal");
  }

  async function openEditBook(id) {
    const b = state.books.find(x => x._id === id);
    if (!b) return;
    $("bookModalTitle").textContent = "Edit Book";
    $("bookId").value = b._id;
    $("bookTitle").value = b.title || "";
    $("bookYear").value = b.year ?? "";
    refreshSelectOptions();
    $("bookAuthor").value = (b.author && b.author._id) ? b.author._id : b.author;
    showModal("bookModal");
  }

  async function saveBook(e) {
    e.preventDefault();
    const id = $("bookId").value.trim();
    const payload = {
      title: $("bookTitle").value.trim(),
      year: $("bookYear").value === "" ? undefined : Number($("bookYear").value),
      author: $("bookAuthor").value
    };

    if (!payload.title) return toast("Title is required", "warning");
    if (!payload.author) return toast("Author is required", "warning");

    if (id) {
      await api(`/api/books/${id}`, { method: "PUT", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      toast("Book updated", "success");
    } else {
      await api("/api/books", { method: "POST", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      toast("Book created", "success");
    }

    bootstrap.Modal.getInstance($("bookModal")).hide();
    await loadAll();
  }

  async function deleteBook(id) {
    if (!confirm("Delete this book?")) return;
    await api(`/api/books/${id}`, { method: "DELETE", headers: { ...authHeaders() } });
    toast("Book deleted", "success");
    await loadAll();
  }

  /* ---------- CRUD: Members ---------- */

  async function openAddMember() {
    $("memberModalTitle").textContent = "Add Member";
    $("memberId").value = "";
    $("memberFirstName").value = "";
    $("memberLastName").value = "";
    $("memberEmail").value = "";
    $("memberCountry").value = "";
    $("memberGender").value = "";
    $("memberHobbies").value = "";
    showModal("memberModal");
  }

  async function openEditMember(id) {
    const m = state.members.find(x => x._id === id);
    if (!m) return;
    $("memberModalTitle").textContent = "Edit Member";
    $("memberId").value = m._id;
    $("memberFirstName").value = m.firstName || "";
    $("memberLastName").value = m.lastName || "";
    $("memberEmail").value = m.email || "";
    $("memberCountry").value = m.country || "";
    $("memberGender").value = m.gender || "";
    $("memberHobbies").value = Array.isArray(m.hobbies) ? m.hobbies.join(", ") : "";
    showModal("memberModal");
  }

  async function saveMember(e) {
    e.preventDefault();
    const id = $("memberId").value.trim();

    const hobbies = $("memberHobbies").value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      firstName: $("memberFirstName").value.trim(),
      lastName: $("memberLastName").value.trim(),
      email: $("memberEmail").value.trim(),
      country: $("memberCountry").value.trim(),
      gender: $("memberGender").value,
      hobbies
    };

    if (!payload.firstName) return toast("First Name is required", "warning");
    if (!payload.email) return toast("Email is required", "warning");
    if (!payload.country) return toast("Country is required", "warning");

    if (id) {
      await api(`/api/members/${id}`, { method: "PUT", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      toast("Member updated", "success");
    } else {
      await api("/api/members", { method: "POST", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
      toast("Member created", "success");
    }

    bootstrap.Modal.getInstance($("memberModal")).hide();
    await loadAll();
  }

  async function deleteMember(id) {
    if (!confirm("Delete this member?")) return;
    await api(`/api/members/${id}`, { method: "DELETE", headers: { ...authHeaders() } });
    toast("Member deleted", "success");
    await loadAll();
  }

  /* ---------- CRUD: Loans ---------- */

  async function openAddLoan() {
    refreshSelectOptions();
    showModal("loanModal");
  }

  async function createLoan(e) {
    e.preventDefault();
    const payload = { memberId: $("loanMember").value, bookId: $("loanBook").value };
    if (!payload.memberId || !payload.bookId) return toast("Member and Book are required", "warning");

    await api("/api/loans", { method: "POST", headers: { ...authHeaders() }, body: JSON.stringify(payload) });
    toast("Loan created", "success");
    bootstrap.Modal.getInstance($("loanModal")).hide();
    await loadAll();
  }

  async function returnLoan(id) {
    await api(`/api/loans/${id}/return`, { method: "PUT", headers: { ...authHeaders() } });
    toast("Marked as returned", "success");
    await loadAll();
  }

  async function deleteLoan(id) {
    if (!confirm("Delete this loan record?")) return;
    await api(`/api/loans/${id}`, { method: "DELETE", headers: { ...authHeaders() } });
    toast("Loan deleted", "success");
    await loadAll();
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    const logoutBtn = $("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (typeof clearAuth === "function") clearAuth();
        toast("Logged out", "info");
        setAdminGate();
      });
    }

    $("addAuthorBtn")?.addEventListener("click", openAddAuthor);
    $("addBookBtn")?.addEventListener("click", openAddBook);
    $("addMemberBtn")?.addEventListener("click", openAddMember);
    $("addLoanBtn")?.addEventListener("click", openAddLoan);

    $("authorForm")?.addEventListener("submit", (e) => saveAuthor(e).catch(err => toast(err.message, "danger")));
    $("bookForm")?.addEventListener("submit", (e) => saveBook(e).catch(err => toast(err.message, "danger")));
    $("memberForm")?.addEventListener("submit", (e) => saveMember(e).catch(err => toast(err.message, "danger")));
    $("loanForm")?.addEventListener("submit", (e) => createLoan(e).catch(err => toast(err.message, "danger")));

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.getAttribute("data-act");
      const id = btn.getAttribute("data-id");
      if (!id) return;

      const map = {
        "edit-author": () => openEditAuthor(id),
        "del-author": () => deleteAuthor(id).catch(err => toast(err.message, "danger")),
        "edit-book": () => openEditBook(id),
        "del-book": () => deleteBook(id).catch(err => toast(err.message, "danger")),
        "edit-member": () => openEditMember(id),
        "del-member": () => deleteMember(id).catch(err => toast(err.message, "danger")),
        "return-loan": () => returnLoan(id).catch(err => toast(err.message, "danger")),
        "del-loan": () => deleteLoan(id).catch(err => toast(err.message, "danger")),
      };

      if (map[act]) map[act]();
    });
  }

  async function init() {
    bindEvents();

    if (!setAdminGate()) return;

    try {
      await loadAll();
      toast("Admin data loaded", "success");
    } catch (err) {
      toast(err.message, "danger");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
