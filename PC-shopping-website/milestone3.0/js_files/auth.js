import { supabase } from "./supabaseClient.js";

const AuthState = {
    ready: false,
    session: null,
    authUser: null,
    profile: null,
    isLoggedIn: false,
    isAdmin: false
};

window.supabaseClient = supabase;
window.AuthState = AuthState;

async function loadAuthState() {
    AuthState.ready = false;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("Session error:", sessionError.message);
        resetAuthState();
        finishAuthState();
        return;
    }

    AuthState.session = sessionData.session;

    if (!AuthState.session) {
        resetAuthState();
        finishAuthState();
        return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        console.error("User error:", userError?.message);
        resetAuthState();
        finishAuthState();
        return;
    }

    AuthState.authUser = userData.user;
    AuthState.isLoggedIn = true;

    await loadUserProfile();

    finishAuthState();
}

async function loadUserProfile() {
    const { data, error } = await supabase
        .schema("store")
        .from("user")
        .select("id, email, first_name, last_name, name, isadmin, address")
        .eq("id", AuthState.authUser.id)
        .single();

    if (error) {
        console.error("Profile load error:", error.message);
        AuthState.profile = null;
        AuthState.isAdmin = false;
        return;
    }

    AuthState.profile = data;
    AuthState.isAdmin = data.isadmin === true;
}

function resetAuthState() {
    AuthState.session = null;
    AuthState.authUser = null;
    AuthState.profile = null;
    AuthState.isLoggedIn = false;
    AuthState.isAdmin = false;
}

function finishAuthState() {
    AuthState.ready = true;

    updateNavbarForAuth();
    protectCurrentPage();

    document.dispatchEvent(new CustomEvent("auth-ready", {
        detail: AuthState
    }));
}

function protectCurrentPage() {
    const requiresAuth = document.body.dataset.auth === "required";
    const requiresAdmin = document.body.dataset.admin === "required";

    if (requiresAuth && !AuthState.isLoggedIn) {
        redirectToLogin();
        return;
    }

    if (requiresAdmin && !AuthState.isAdmin) {
        window.location.href = "index.html";
    }
}

function redirectToLogin() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
}

function updateNavbarForAuth() {
    setupCartIcon();
    setupProfileDropdown();
}

function setupCartIcon() {
    const cartIcon = document.getElementById("cart");

    if (!cartIcon) return;

    cartIcon.onclick = function () {
        if (AuthState.isLoggedIn) {
            window.location.href = "cart.html";
        } else {
            window.location.href = "login.html?redirect=cart.html";
        }
    };
}

function setupProfileDropdown() {
    const profileIcon = document.getElementById("profile");
    const dropdown = document.getElementById("profileDropdown");

    if (!profileIcon || !dropdown) return;

    dropdown.innerHTML = "";

    if (AuthState.isLoggedIn) {
        const displayName =
            AuthState.profile?.first_name ||
            AuthState.profile?.name ||
            AuthState.authUser?.email ||
            "User";

        dropdown.innerHTML = `
            <p class="dropdown_username">${displayName}</p>
            <a href="profile.html">Profile</a>
            <a href="orders.html">My Orders</a>
            ${AuthState.isAdmin ? '<a href="dashboard.html">Admin Dashboard</a>' : ""}
            <button type="button" id="logoutBtn">Logout</button>
        `;

        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", logoutUser);
        }
    } else {
        dropdown.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }

    profileIcon.onclick = function () {
        dropdown.classList.toggle("show");
    };

    document.addEventListener("click", function (event) {
        if (!profileIcon.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove("show");
        }
    });
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        return;
    }

    window.location.href = "login.html";
}

window.Auth = {
    getState: function () {
        return AuthState;
    },

    isLoggedIn: function () {
        return AuthState.isLoggedIn;
    },

    isAdmin: function () {
        return AuthState.isAdmin;
    },

    logout: logoutUser,

    requireLogin: function () {
        if (!AuthState.isLoggedIn) {
            redirectToLogin();
            return false;
        }

        return true;
    },

    onReady: function (callback) {
        if (AuthState.ready) {
            callback(AuthState);
        } else {
            document.addEventListener("auth-ready", function (event) {
                callback(event.detail);
            });
        }
    }
};

document.addEventListener("DOMContentLoaded", loadAuthState);

supabase.auth.onAuthStateChange(function () {
    setTimeout(loadAuthState, 0);
});