import { Auth, AuthState } from "../auth.js";

let profileIcon = null;
let profileDropdown = null;
let cartIcon = null;

const profileMenus = {
    guest: [
        { text: "Sign Up", href: "register.html" },
        { text: "Log In", href: "login.html" }
    ],

    user: [
        { text: "Profile", href: "profile.html" },
        { text: "Log Out", action: "logout" }
    ],

    admin: [
        { text: "Profile", href: "profile.html" },
        // { text: "Orders", href: "orders.html" },
        { text: "Dashboard", href: "admin-dashboard.html" },
        { text: "Log Out", action: "logout" }
    ]
};

function getProfileMenuType() {
    if (!AuthState.isLoggedIn) {
        return "guest";
    }

    if (AuthState.isAdmin === true) {
        return "admin";
    }

    return "user";
}

function renderProfileDropdown() {
    if (!profileDropdown) {
        return;
    }

    const menuType = getProfileMenuType();
    const menuItems = profileMenus[menuType];

    profileDropdown.innerHTML = "";

    menuItems.forEach(function (item) {
        if (item.action === "logout") {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = item.text;

            button.addEventListener("click", async function () {
                closeProfileDropdown();
                await Auth.logout("home.html");
            });

            profileDropdown.appendChild(button);
        } else {
            const link = document.createElement("a");
            link.textContent = item.text;
            link.href = item.href;

            profileDropdown.appendChild(link);
        }
    });
}

function openProfileDropdown() {
    if (!profileDropdown || !profileIcon) {
        return;
    }

    renderProfileDropdown();

    profileDropdown.classList.add("show");
    profileIcon.setAttribute("aria-expanded", "true");
}

function closeProfileDropdown() {
    if (!profileDropdown || !profileIcon) {
        return;
    }

    profileDropdown.classList.remove("show");
    profileIcon.setAttribute("aria-expanded", "false");
}

function toggleProfileDropdown() {
    if (!profileDropdown) {
        return;
    }

    if (profileDropdown.classList.contains("show")) {
        closeProfileDropdown();
    } else {
        openProfileDropdown();
    }
}

function setupCartIcon() {
    cartIcon = document.getElementById("cart");

    if (!cartIcon) {
        return;
    }

    if (cartIcon.dataset.cartReady === "true") {
        return;
    }

    cartIcon.dataset.cartReady = "true";
    cartIcon.style.cursor = "pointer";

    cartIcon.addEventListener("click", function () {
        if (AuthState.isLoggedIn) {
            window.location.href = "cart.html";
        } else {
            window.location.href = "login.html?redirect=cart.html";
        }
    });
}

function setupProfileIcon() {
    profileIcon = document.getElementById("profile");
    profileDropdown = document.getElementById("profileDropdown");

    if (!profileIcon || !profileDropdown) {
        return false;
    }

    if (profileIcon.dataset.profileMenuReady === "true") {
        renderProfileDropdown();
        return true;
    }

    profileIcon.dataset.profileMenuReady = "true";
    profileIcon.style.cursor = "pointer";

    profileIcon.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleProfileDropdown();
    });

    profileIcon.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleProfileDropdown();
        }
    });

    document.addEventListener("click", function (event) {
        if (!profileDropdown.contains(event.target) && event.target !== profileIcon) {
            closeProfileDropdown();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeProfileDropdown();
        }
    });

    renderProfileDropdown();

    return true;
}

function initNavbarActions() {
    setupCartIcon();

    const profileReady = setupProfileIcon();

    if (!profileReady) {
        return false;
    }

    Auth.onReady(function () {
        renderProfileDropdown();
    });

    Auth.onChange(function () {
        renderProfileDropdown();
    });

    return true;
}

function waitForNavbar() {
    if (initNavbarActions()) {
        return;
    }

    const observer = new MutationObserver(function () {
        if (initNavbarActions()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

window.initProfileIcon = initNavbarActions;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForNavbar);
} else {
    waitForNavbar();
}