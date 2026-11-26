(function () {
  const root = document.documentElement;
  const themes = ["light", "sepia", "dark"];
  const themeLabels = { light: "☀ 淺色", sepia: "📖 護眼", dark: "☾ 夜間" };

  // 1. 三段主題切換（淺色 / 護眼紙張 / 夜間深色）
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themePickerBtns = document.querySelectorAll("[data-set-theme]");

  function applyTheme(theme) {
    const valid = themes.includes(theme) ? theme : "light";
    root.setAttribute("data-theme", valid);
    localStorage.setItem("novel-theme", valid);
    if (themeToggleBtn) {
      themeToggleBtn.textContent = themeLabels[valid];
    }
    themePickerBtns.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.setTheme === valid);
    });
  }

  const savedTheme = localStorage.getItem("novel-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      const current = root.getAttribute("data-theme") || "light";
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      applyTheme(next);
    });
  }

  themePickerBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(btn.dataset.setTheme);
    });
  });

  // 2. 小說字體大小切換（小 / 中 / 大）
  const fontBtns = document.querySelectorAll("[data-set-font]");

  function applyFont(size) {
    const valid = ["sm", "md", "lg"].includes(size) ? size : "md";
    root.setAttribute("data-font", valid);
    localStorage.setItem("novel-font", valid);
    fontBtns.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.setFont === valid);
    });
  }

  applyFont(localStorage.getItem("novel-font") || "md");

  fontBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFont(btn.dataset.setFont);
    });
  });

  // 3. 頂部閱讀進度條
  const progressBar = document.getElementById("reading-progress");
  if (progressBar) {
    window.addEventListener(
      "scroll",
      function () {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        progressBar.style.width = pct + "%";
      },
      { passive: true }
    );
  }

  // 4. 記錄並顯示「上次讀到」書籤（使用瀏覽器本機 localStorage）
  const chapterMetaEl = document.getElementById("chapter-bookmark-data");
  if (chapterMetaEl) {
    try {
      localStorage.setItem(
        "novel-last-read",
        JSON.stringify({
          title: chapterMetaEl.dataset.title,
          url: chapterMetaEl.dataset.url
        })
      );
    } catch (e) {}
  }

  const resumeBar = document.getElementById("resume-bar");
  const resumeLink = document.getElementById("resume-link");
  if (resumeBar && resumeLink) {
    try {
      const saved = JSON.parse(localStorage.getItem("novel-last-read") || "null");
      if (saved && saved.title && saved.url) {
        resumeLink.textContent = saved.title;
        resumeLink.setAttribute("href", saved.url);
        resumeBar.classList.add("visible");
      }
    } catch (e) {}
  }

  // 5. 首頁章節搜尋 + 正序／倒序切換
  const searchInput = document.getElementById("chapter-search");
  const chapterList = document.getElementById("chapter-list");
  const sortToggleBtn = document.getElementById("sort-toggle");
  const emptyState = document.getElementById("empty-state");
  let reversed = false;

  if (searchInput && chapterList) {
    searchInput.addEventListener("input", function () {
      const keyword = searchInput.value.trim().toLowerCase();
      const items = chapterList.querySelectorAll(".chapter-item");
      let visibleCount = 0;

      items.forEach(function (item) {
        const text = ((item.dataset.title || "") + " " + (item.dataset.summary || "")).toLowerCase();
        const match = !keyword || text.includes(keyword);
        item.classList.toggle("hidden", !match);
        if (match) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle("visible", visibleCount === 0);
      }
    });
  }

  if (sortToggleBtn && chapterList) {
    sortToggleBtn.addEventListener("click", function () {
      const items = Array.from(chapterList.children);
      items.reverse().forEach(function (item) {
        chapterList.appendChild(item);
      });
      reversed = !reversed;
      sortToggleBtn.textContent = reversed ? "↓ 最新章節在前" : "↑ 從第一章排序";
    });
  }
})();
