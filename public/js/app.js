console.log("TASK 0: Name = Your Name, Group = Your Group");

if (typeof window.jQuery === "function") {
  window.jQuery(function($) {
    console.log("TASK 0 (jQuery): jQuery is ready!");
  });
}


if (!sessionStorage.getItem("helloAlertShown")) {
  alert("Welcome to Online Library! (Task 0)");
  sessionStorage.setItem("helloAlertShown", "1");
}

(() => {
  console.log("TASK 1: Variables & Operators");
  const studentName = "Your Name";            // string
  const totalBooks = 1200;                    // number
  const isMember = true;                      // boolean
  const featuredTitle = "Practical Machine Learning";

  const sum = 5 + 7;
  const product = 6 * 4;
  const division = 120 / 6;
  const greeting = `Hello, ${studentName}! Enjoy your reading.`;

  console.log({ studentName, totalBooks, isMember, featuredTitle, sum, product, division, greeting });
})();

/* Helper */
const $ = (id) => document.getElementById(id);

(() => {
  const btn = document.getElementById("missionUpdateBtn");
  if (!btn) return;

  const copyA = {
    mission: "Empower learners with accessible, high‑quality technical literature in a distraction‑free interface.",
    editorial: "We review every title for clarity, structure, and up‑to‑date practices.",
    community: "Public reading lists and study tracks help you stay consistent."
  };

  const copyB = {
    mission: "Provide focused access to essential programming resources for lifelong learners.",
    editorial: "Our editors highlight the most practical insights and remove unnecessary complexity.",
    community: "Join readers who share notes, build habits, and grow together through shared goals."
  };

  let toggle = false;
  function applyCopy(copy) {
    Object.keys(copy).forEach((key) => {
      const p = document.querySelector(`[data-task2-body="${key}"]`);
      if (p) p.textContent = copy[key];
    });
  }

  btn.addEventListener("click", () => {
    toggle = !toggle;
    applyCopy(toggle ? copyB : copyA);
  });
})();

(() => {
  const scope = document.querySelector("main#main"); // apply within entire membership content
  const box = document.getElementById("comfortBox");
  const contrastBtn = document.getElementById("contrastBtn");
  const typeBtn = document.getElementById("typeSizeBtn");
  if (scope && box && contrastBtn && typeBtn) {
    contrastBtn.addEventListener("click", () => {
      // Toggle strong contrast for cards/tables within membership
      scope.classList.toggle("comfort-contrast");
      // Visual hint in the small box
      const strong = scope.classList.contains("comfort-contrast");
      box.dataset.strong = strong ? "1" : "0";
      box.style.border = strong ? "1px solid rgba(255,255,255,.35)" : "1px solid var(--border)";
      box.style.background = strong ? "rgba(255,255,255,.08)" : "var(--soft)";
    });
    typeBtn.addEventListener("click", () => {
      // Toggle large type for all membership content
      scope.classList.toggle("comfort-large");
    });
  }
})();

(() => {
  const addBtn = $("addTagBtn");
  const removeBtn = $("removeTagBtn");
  const list = $("shelfTags");
  const STORAGE_KEY = "shelfTags";

  if (!addBtn || !removeBtn || !list) return;

  let tags = [];

  function load() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          tags = parsed.map(t => String(t)).filter(t => t.trim() !== "");
          return;
        }
      } catch (e) {
        console.warn("Failed to parse shelfTags", e);
      }
    }
    // fallback: read from existing DOM if no stored tags
    tags = Array.from(list.querySelectorAll("li"))
      .map(li => li.textContent.trim())
      .filter(Boolean);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    } catch (e) {
      console.warn("Failed to save shelfTags", e);
    }
  }

  function render() {
    list.innerHTML = "";
    tags.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
  }

  addBtn.addEventListener("click", () => {
    const name = prompt("Enter a new tag name:");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    tags.push(trimmed);
    save();
    render();
  });

  removeBtn.addEventListener("click", () => {
    if (!tags.length) return;
    tags.pop();
    save();
    render();
  });

  load();
  render();
})();

(() => {
  const banner = $("featuredBanner");
  if (banner) {
    const on = () => { banner.style.background = "rgba(0, 173, 181, .15)"; banner.style.boxShadow = "0 0 0 2px rgba(0,0,0,.15) inset"; };
    const off = () => { banner.style.background = "rgba(255,255,255,.03)"; banner.style.boxShadow = "none"; };
    banner.addEventListener("mouseover", on);
    banner.addEventListener("mouseout", off);
  }
})();

(() => {
  const input = $("catalogSearch");
  const mirror = $("searchMirror");
  const container = document.querySelector(".catalog");
  if (input && mirror && container) {
    const items = Array.from(container.querySelectorAll(".book"));
    function normalize(s){ return (s || "").toLowerCase().trim(); }
    function matches(item, q) {
      if (!q) return true;
      const title = item.querySelector("h2")?.innerText || "";
      const tags = item.getAttribute("data-tags") || "";
      return normalize(title).includes(q) || normalize(tags).includes(q);
    }
    const sync = () => {
      const q = normalize(input.value);
      mirror.textContent = input.value;
      items.forEach(el => {
        el.style.display = matches(el, q) ? "" : "none";
      });
    };
    input.addEventListener("keyup", sync);
    input.addEventListener("change", sync);
    // Initial apply (in case of prefilled value or back nav)
    sync();
  }
})();

(() => {
  // Run only on book pages
  const isBookPage = location.pathname.includes("book-");
  if (!isBookPage) return;

  // If a calculator already exists on the page, just wire it up
  let pages = document.getElementById("pagesInput");
  let rate = document.getElementById("rateInput");
  let out  = document.getElementById("readingTimeOut");

  function ensureSection() {
    if (pages && rate && out) return; 

    // Inject a section under the main h1 or at top of main content
    const h1 = document.querySelector("h1") || document.querySelector("main h1");
    const container = document.createElement("section");
    container.id = "task7-readingtime";
    container.className = "container my-5";
    container.innerHTML = `
      <h2>Estimate Your Reading Time</h2>
      <div class="row g-2 align-items-center">
        <div class="col-auto">
          <label for="pagesInput" class="col-form-label">Pages</label>
        </div>
        <div class="col-auto">
          <input id="pagesInput" class="form-control" placeholder="e.g., 320" inputmode="numeric">
        </div>
        <div class="col-auto">
          <label for="rateInput" class="col-form-label">Avg pages/hour</label>
        </div>
        <div class="col-auto">
          <input id="rateInput" class="form-control" placeholder="e.g., 30" inputmode="decimal">
        </div>
      </div>
      <p class="mt-2" id="readingTimeOut">Result: —</p>
      <p class="text-muted">Calculator adapted to reading time.</p>
    `;
    if (h1 && h1.parentNode) {
      h1.parentNode.insertBefore(container, h1.nextSibling);
    } else {
      document.body.appendChild(container);
    }

    pages = document.getElementById("pagesInput");
    rate  = document.getElementById("rateInput");
    out   = document.getElementById("readingTimeOut");
  }

  function wireCalculator() {
    if (!(pages && rate && out)) return;
    function calc() {
      const p = parseFloat(pages.value);
      const r = parseFloat(rate.value);
      if (!isFinite(p) || !isFinite(r) || r <= 0) {
        out.textContent = "Result: please enter positive numbers for pages and pages/hour.";
        return;
      }
      const hours = p / r;
      out.textContent = "Result: ~" + hours.toFixed(1) + " hours";
    }
    ["keyup", "change"].forEach(evt => {
      pages.addEventListener(evt, calc);
      rate.addEventListener(evt, calc);
    });
  }

  ensureSection();
  wireCalculator();
})();

(() => {
  const input = $("readingTaskInput");
  const addBtn = $("readingTaskAddBtn");
  const list = $("readingTaskList");
  const hint = $("readingTaskHint");
  const STORAGE_KEY = "readingTasks";
  let tasks = [];

  function load() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      raw = null;
    }
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        tasks = parsed
          .map(t => ({
            text: typeof t.text === "string" ? t.text : "",
            done: !!t.done
          }))
          .filter(t => t.text.trim() !== "");
      }
    } catch (e) {
      console.warn("Failed to parse readingTasks from localStorage", e);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Failed to save readingTasks", e);
    }
  }

  function render() {
    if (!list || !hint) return;
    list.innerHTML = "";
    tasks.forEach((t, idx) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = t.text;
      if (t.done) label.classList.add("read-done");
      label.addEventListener("click", () => {
        tasks[idx].done = !tasks[idx].done;
        save();
        render();
      });

      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-sm";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        tasks.splice(idx, 1);
        save();
        render();
      });

      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
    });
    hint.textContent = tasks.length ? "Click a task to mark it as read." : "No reading tasks yet.";
  }

  if (addBtn && input && list && hint) {
    load();
    render();
    addBtn.addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;
      tasks.push({ text: value, done: false });
      input.value = "";
      save();
      render();
    });
  }
})();


(() => {
  const hideBtn = $("btnHideGenres");
  const showBtn = $("btnShowGenres");
  const toggleBtn = $("btnToggleGenres");

  const toolbar = document.querySelector(".catalog-toolbar");
  if (!toolbar || !hideBtn || !showBtn || !toggleBtn) return;

  const genreElements = toolbar.querySelectorAll('input[type="checkbox"], label.filter');
  if (!genreElements.length) return;

  function hideGenres() {
    genreElements.forEach((el) => {
      el.style.display = "none";
    });
  }

  function showGenres() {
    genreElements.forEach((el) => {
      el.style.display = "";
    });
  }

  function toggleGenres() {
    genreElements.forEach((el) => {
      el.style.display = (el.style.display === "none" ? "" : "none");
    });
  }

  hideBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hideGenres();
  });

  showBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showGenres();
  });

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleGenres();
  });
})();

(() => {
  const fadeOutBtn = $("fadeOutHero");
  const fadeInBtn = $("fadeInHero");
  const fadeToggleBtn = $("fadeToggleHero");
  const hero = document.querySelector(".hero");
  const illus = hero ? hero.querySelector(".illus") : null;

  if (!fadeOutBtn || !fadeInBtn || !fadeToggleBtn || !illus) return;

  // Ensure a smooth transition on opacity
  if (!illus.style.transition) {
    illus.style.transition = "opacity .4s ease";
  }

  function fadeOut() {
    illus.style.opacity = "0";
  }

  function fadeIn() {
    illus.style.opacity = "1";
  }

  function fadeToggle() {
    const current = parseFloat(getComputedStyle(illus).opacity || "1");
    illus.style.opacity = current < 0.5 ? "1" : "0";
  }

  fadeOutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fadeOut();
  });

  fadeInBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fadeIn();
  });

  fadeToggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fadeToggle();
  });
})();

(() => {
  const panel = document.getElementById("faqSlidePanel");
  const btnUp = $("faqSlideUp");
  const btnDown = $("faqSlideDown");
  const btnToggle = $("faqSlideToggle");
  if (!panel || !btnUp || !btnDown || !btnToggle) return;

  if (!HTMLElement.prototype.slideUp) {
    HTMLElement.prototype.slideUp = function(duration = 300) {
      const el = this;
      const style = window.getComputedStyle(el);
      if (style.display === "none") return;
      el.style.overflow = "hidden";
      const startHeight = el.scrollHeight;
      el.style.height = startHeight + "px";
      // force reflow
      void el.offsetHeight;
      el.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`;
      el.style.height = "0px";
      el.style.opacity = "0";
      window.setTimeout(() => {
        el.style.display = "none";
      }, duration);
    };
    HTMLElement.prototype.slideDown = function(duration = 300) {
      const el = this;
      el.style.removeProperty("display");
      let display = window.getComputedStyle(el).display;
      if (display === "none") display = "block";
      el.style.display = display;
      const targetHeight = el.scrollHeight;
      el.style.overflow = "hidden";
      el.style.height = "0px";
      el.style.opacity = "0";
      // force reflow
      void el.offsetHeight;
      el.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`;
      el.style.height = targetHeight + "px";
      el.style.opacity = "1";
      window.setTimeout(() => {
        el.style.height = "";
        el.style.overflow = "";
      }, duration);
    };
    HTMLElement.prototype.slideToggle = function(duration = 300) {
      const el = this;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || el.clientHeight === 0) {
        el.slideDown(duration);
      } else {
        el.slideUp(duration);
      }
    };
  }

  // start collapsed
  panel.style.display = "none";

  btnUp.addEventListener("click", (e) => {
    e.preventDefault();
    panel.slideUp(300);
  });
  btnDown.addEventListener("click", (e) => {
    e.preventDefault();
    panel.slideDown(300);
  });
  btnToggle.addEventListener("click", (e) => {
    e.preventDefault();
    panel.slideToggle(300);
  });
})();

(() => {
  const cover = document.getElementById("bookCover");
  const swapCoverBtn = $("swapCoverBtn");
  const link = document.getElementById("downloadLink");
  const swapLinkBtn = $("swapLinkBtn");

  // Run only on book pages where these controls exist
  if (!swapCoverBtn && !swapLinkBtn) return;

  if (cover && swapCoverBtn) {
    const originalSrc = cover.getAttribute("src");
    const altSrc = cover.dataset.altSrc || originalSrc;
    swapCoverBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const current = cover.getAttribute("src");
      cover.setAttribute("src", current === originalSrc ? altSrc : originalSrc);
    });
  }

  if (link && swapLinkBtn) {
    const originalHref = link.getAttribute("href") || "#";
    const originalText = link.textContent;
    const altHref = link.dataset.altHref || "https://example.com/sample-chapter";
    const altText = link.dataset.altText || "Download sample chapter";
    swapLinkBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const current = link.getAttribute("href");
      if (current === originalHref) {
        link.setAttribute("href", altHref);
        link.textContent = altText;
      } else {
        link.setAttribute("href", originalHref);
        link.textContent = originalText;
      }
    });
  }
})();

(() => {
  if (!HTMLElement.prototype.val) {
    HTMLElement.prototype.val = function(v) {
      if (v === undefined) {
        return (this.value !== undefined) ? this.value : "";
      } else {
        if (this.value !== undefined) this.value = v;
        return this;
      }
    };
  }
  if (!HTMLElement.prototype.text) {
    HTMLElement.prototype.text = function(v) {
      if (v === undefined) {
        return this.textContent;
      } else {
        this.textContent = v;
        return this;
      }
    };
  }

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const outName = document.getElementById("contactPreviewName");
  const outEmail = document.getElementById("contactPreviewEmail");
  if (!nameInput || !emailInput || !outName || !outEmail) return;

  function sync() {
    const nameVal = nameInput.val().trim();
    const emailVal = emailInput.val().trim();
    outName.text(nameVal || "—");
    outEmail.text(emailVal || "—");
  }

  ["input", "change"].forEach(evt => {
    nameInput.addEventListener(evt, sync);
    emailInput.addEventListener(evt, sync);
  });

  // initial render
  sync();
})();

(() => {
  const box = document.getElementById("animBox");
  const basicBtn = $("animBasicBtn");
  const seqBtn = $("animSeqBtn");
  const comboBtn = $("animComboBtn");
  // Require Web Animations API support
  if (!box || !basicBtn || !seqBtn || !comboBtn || typeof box.animate !== "function") return;

  function resetBox() {
    box.style.transform = "translate(0, 0) scale(1)";
    box.style.opacity = "1";
  }

  basicBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetBox();
    box.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: "translate(100px, 0) scale(1.4)" }
      ],
      { duration: 400, fill: "forwards", easing: "ease-out" }
    );
  });

  function runStep(keyframes, options) {
    const anim = box.animate(keyframes, options);
    return anim.finished;
  }

  async function runSequential() {
    resetBox();
    await runStep(
      [{ transform: "translate(0, 0) scale(1)" }, { transform: "translate(120px, 0) scale(1)" }],
      { duration: 300, fill: "forwards", easing: "ease-out" }
    );
    await runStep(
      [{ transform: "translate(120px, 0) scale(1)" }, { transform: "translate(120px, 70px) scale(1)" }],
      { duration: 300, fill: "forwards", easing: "ease-out" }
    );
    await runStep(
      [{ transform: "translate(120px, 70px) scale(1)" }, { transform: "translate(120px, 70px) scale(0.6)" }],
      { duration: 250, fill: "forwards", easing: "ease-out" }
    );
    await runStep(
      [{ transform: "translate(120px, 70px) scale(0.6)" }, { transform: "translate(0, 0) scale(1)" }],
      { duration: 350, fill: "forwards", easing: "ease-out" }
    );
  }

  seqBtn.addEventListener("click", (e) => {
    e.preventDefault();
    runSequential();
  });

  comboBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetBox();
    box.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: "translate(80px, -30px) scale(1.5)", opacity: 0.4 },
        { transform: "translate(0, 0) scale(1)", opacity: 1 }
      ],
      { duration: 800, fill: "forwards", easing: "ease-in-out" }
    );
  });
})();

(() => {
  if (typeof window.jQuery !== "function") return;
  const $jq = window.jQuery;
  const $main = $jq("#galleryMainImg");
  const $thumbs = $jq("[data-gallery-thumb]");
  if (!$main.length || !$thumbs.length) return;

  $thumbs.first().addClass("active-thumb");

  $thumbs.on("click", function (e) {
    e.preventDefault();
    const $t = $jq(this);
    const newSrc = $t.data("largeSrc");
    if (!newSrc || $main.attr("src") === newSrc) return;

    $thumbs.removeClass("active-thumb");
    $t.addClass("active-thumb");

    $t.stop().animate({ opacity: 0.6 }, 120, function () {
      $t.animate({ opacity: 1 }, 120);
    });

    $main.stop().fadeOut(150, function () {
      $main.attr("src", newSrc).fadeIn(200);
    });
  });
})();

(() => {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  if (!root || !btn) return;

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    root.setAttribute("data-bs-theme", t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch (e) {
      console.warn("Failed to persist theme", e);
    }
    btn.textContent = t === "dark" ? "Light mode" : "Dark mode";
  }

  let initial = null;
  try {
    initial = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    initial = null;
  }

  if (initial !== "light" && initial !== "dark") {
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    initial = prefersLight ? "light" : "dark";
  }

  applyTheme(initial);

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-bs-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
  });
})();

(() => {
  const btn = document.getElementById("quoteBtn");
  const textEl = document.getElementById("quoteText");
  const authorEl = document.getElementById("quoteAuthor");
  const statusEl = document.getElementById("quoteStatus");
  if (!btn || !textEl) return;

  const API_URL = "https://api.adviceslip.com/advice";

  async function loadQuote() {
    if (statusEl) statusEl.textContent = "Loading quote…";
    try {
      const res = await fetch(API_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("Network error: " + res.status);
      const data = await res.json();
      const advice = data && data.slip && data.slip.advice;
      textEl.textContent = advice ? "“" + advice + "”" : "No advice available right now.";
      if (authorEl) authorEl.textContent = "";
      if (statusEl) statusEl.textContent = "";
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = "Could not load quote. Please try again.";
    }
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    loadQuote();
  });
})();
