let searchIcon = null;
let navbarSearchForm = null;
let navbarSearchInput = null;

function createNavbarSearchForm() {
    navbarSearchForm = document.createElement("form");
    navbarSearchForm.className = "navbar_search_form";
    navbarSearchForm.setAttribute("role", "search");

    navbarSearchInput = document.createElement("input");
    navbarSearchInput.className = "navbar_search_input";
    navbarSearchInput.type = "search";
    navbarSearchInput.placeholder = "Search products";
    navbarSearchInput.autocomplete = "off";

    navbarSearchForm.appendChild(navbarSearchInput);

    searchIcon.parentNode.insertBefore(navbarSearchForm, searchIcon);

    navbarSearchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        redirectToSearchPage();
    });
}

function openNavbarSearch() {
    navbarSearchForm.classList.add("show");
    navbarSearchInput.focus();
}

function closeNavbarSearch() {
    if (navbarSearchInput.value.trim() !== "") {
        return;
    }

    navbarSearchForm.classList.remove("show");
}

function redirectToSearchPage() {
    const query = navbarSearchInput.value.trim();

    if (query === "") {
        openNavbarSearch();
        return;
    }

    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

function handleSearchIconClick(event) {
    event.stopPropagation();

    const isOpen = navbarSearchForm.classList.contains("show");
    const hasValue = navbarSearchInput.value.trim() !== "";

    if (!isOpen) {
        openNavbarSearch();
        return;
    }

    if (hasValue) {
        redirectToSearchPage();
        return;
    }

    navbarSearchInput.focus();
}

function setupNavbarSearch() {
    searchIcon = document.getElementById("search");

    if (!searchIcon) {
        return false;
    }

    if (searchIcon.dataset.searchReady === "true") {
        return true;
    }

    searchIcon.dataset.searchReady = "true";

    createNavbarSearchForm();

    searchIcon.addEventListener("click", handleSearchIconClick);

    navbarSearchInput.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    navbarSearchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            redirectToSearchPage();
        }
    });

    document.addEventListener("click", function (event) {
        if (
            navbarSearchForm &&
            !navbarSearchForm.contains(event.target) &&
            event.target !== searchIcon
        ) {
            closeNavbarSearch();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            navbarSearchInput.value = "";
            navbarSearchForm.classList.remove("show");
        }
    });

    return true;
}

function waitForNavbarSearch() {
    if (setupNavbarSearch()) {
        return;
    }

    const observer = new MutationObserver(function () {
        if (setupNavbarSearch()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForNavbarSearch);
} else {
    waitForNavbarSearch();
}