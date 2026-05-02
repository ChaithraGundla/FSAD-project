const roleRedirects = {
  admin: "admin-dashboard.html",
  survivor: "survivor-dashboard.html",
  counsellor: "counsellor-dashboard.html",
  legal: "legal-dashboard.html"
};

const API_BASE_URL = (window.API_BASE_URL || "http://localhost:10000").replace(/\/$/, "");

const languageLabels = {
  en: "Dark",
  hi: "Dark"
};

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  initializeLanguage();
  initializeNavigation();
  initializeForms();
  initializeRoleRedirect();
  initializeToasts();
  initializeModals();
  initializeSearch();
  initializeAdminRequests();
});

function initializeTheme() {
  const savedTheme = localStorage.getItem("safehaven-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem("safehaven-theme", mode);
      showToast(mode === "dark" ? "Dark mode enabled." : "Light mode enabled.");
    });
  });
}

function initializeLanguage() {
  const savedLanguage = localStorage.getItem("safehaven-language") || "en";
  setLanguage(savedLanguage);

  document.querySelectorAll("[data-language-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = document.documentElement.lang === "en" ? "hi" : "en";
      setLanguage(nextLanguage);
      localStorage.setItem("safehaven-language", nextLanguage);
      showToast(nextLanguage === "hi" ? "Bhasha badli gayi." : "Language switched.");
    });
  });
}

function setLanguage(language) {
  document.documentElement.lang = language;

  document.querySelectorAll("[data-en]").forEach((element) => {
    const content = element.dataset[language];
    if (content) {
      element.textContent = content;
    }
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = languageLabels[language] || "Dark";
  });
}

function initializeNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  }
}

function initializeForms() {
  document.querySelectorAll(".validate-form").forEach((form) => {
    if (form.hasAttribute("data-role-form")) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (form.hasAttribute("data-api-form")) {
        submitApiForm(form);
        return;
      }

      form.reset();
      closeOpenModals();
      showToast("Form submitted successfully.");
    });
  });
}

function initializeRoleRedirect() {
  const roleForm = document.querySelector("[data-role-form]");
  if (!roleForm) return;

  roleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!roleForm.checkValidity()) {
      roleForm.reportValidity();
      return;
    }

    const role = new FormData(roleForm).get("role");
    const target = roleRedirects[role];

    if (!target) {
      showToast("Please choose a role to continue.");
      return;
    }

    showToast("Login successful. Redirecting to your dashboard.");
    setTimeout(() => {
      window.location.href = target;
    }, 700);
  });
}

function initializeToasts() {
  document.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(button.dataset.toast);
    });
  });
}

function showToast(message) {
  const container = document.querySelector(".toast-container");
  if (!container || !message) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

function initializeModals() {
  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById(button.dataset.openModal);
      if (modal) {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
      }
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeOpenModals);
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeOpenModals();
      }
    });
  });
}

function closeOpenModals() {
  document.querySelectorAll(".modal.open").forEach((modal) => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
}

function initializeSearch() {
  const searchInput = document.querySelector("[data-resource-search]");
  const items = document.querySelectorAll("[data-search-item]");

  if (!searchInput || !items.length) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    items.forEach((item) => {
      const matches = item.dataset.searchItem.includes(term);
      item.style.display = matches ? "" : "none";
    });
  });
}

async function submitApiForm(form) {
  const endpoint = buildApiUrl(form.dataset.endpoint);
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to save form data.");
    }

    form.reset();
    showToast(result.message || "Saved successfully.");
  } catch (error) {
    showToast(error.message.includes("fetch")
      ? "Start the backend server before submitting forms."
      : error.message);
  }
}

function initializeAdminRequests() {
  const refreshButton = document.querySelector("[data-load-requests]");
  if (!refreshButton) return;

  refreshButton.addEventListener("click", loadAdminRequests);
  loadAdminRequests();
}

async function loadAdminRequests() {
  try {
    const response = await fetch(buildApiUrl("/api/admin/requests"));
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to load requests.");
    }

    renderRows("[data-contact-rows]", result.contactRequests, (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.message)}</td>
        <td>${formatDate(item.created_at || item.createdAt)}</td>
      </tr>
    `);

    renderRows("[data-support-rows]", result.supportRequests, (item) => `
      <tr>
        <td>${escapeHtml(item.requestType)}</td>
        <td>${escapeHtml(item.contactMethod)}</td>
        <td>${escapeHtml(item.message)}</td>
        <td>${formatDate(item.created_at || item.createdAt)}</td>
      </tr>
    `);

    renderRows("[data-anonymous-rows]", result.anonymousReports, (item) => `
      <tr>
        <td>${escapeHtml(item.incidentType)}</td>
        <td>${escapeHtml(item.incidentDate)}</td>
        <td>${escapeHtml(item.details)}</td>
        <td>${formatDate(item.created_at || item.createdAt)}</td>
      </tr>
    `);
  } catch (error) {
    renderFallback("[data-contact-rows]", "Database data is not available yet.");
    renderFallback("[data-support-rows]", "Database data is not available yet.");
    renderFallback("[data-anonymous-rows]", "Database data is not available yet.");
    showToast(error.message.includes("fetch")
      ? "Start the backend server to view saved requests."
      : error.message);
  }
}

function buildApiUrl(endpoint) {
  if (!endpoint) return API_BASE_URL;
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

function renderRows(selector, rows, rowTemplate) {
  const target = document.querySelector(selector);
  if (!target) return;

  if (!rows.length) {
    target.innerHTML = `<tr><td colspan="4">No records found.</td></tr>`;
    return;
  }

  target.innerHTML = rows.map(rowTemplate).join("");
}

function renderFallback(selector, message) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
