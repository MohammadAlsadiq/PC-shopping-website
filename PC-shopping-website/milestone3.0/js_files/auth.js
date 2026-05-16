import { supabase } from "./supabaseClient.js";

export const AuthState = {
    ready: false,
    session: null,
    authUser: null,
    profile: null,
    isLoggedIn: false,
    isAdmin: false
};

window.supabaseClient = supabase;
window.AuthState = AuthState;

let authStarted = false;
let loadCounter = 0;

function resetAuthState() {
    AuthState.session = null;
    AuthState.authUser = null;
    AuthState.profile = null;
    AuthState.isLoggedIn = false;
    AuthState.isAdmin = false;
}

async function loadAuthState() {
    const currentLoad = ++loadCounter;

    AuthState.ready = false;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (currentLoad !== loadCounter) {
        return;
    }

    if (sessionError || !sessionData.session) {
        resetAuthState();
        finishAuthState();
        return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (currentLoad !== loadCounter) {
        return;
    }

    if (userError || !userData.user) {
        resetAuthState();
        finishAuthState();
        return;
    }

    AuthState.session = sessionData.session;
    AuthState.authUser = userData.user;
    AuthState.isLoggedIn = true;

    await loadUserProfile(userData.user.id);

    if (currentLoad !== loadCounter) {
        return;
    }

    finishAuthState();
}

async function loadUserProfile(userId) {
    const { data, error } = await supabase
        .schema("store")
        .from("user")
        .select("id, email, first_name, last_name, name, isadmin, address, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error("Profile load error:", error.message);
        AuthState.profile = null;
        AuthState.isAdmin = false;
        return;
    }

    AuthState.profile = data;
    AuthState.isAdmin = data?.isadmin === true;
}

function finishAuthState() {
    AuthState.ready = true;

    protectCurrentPage();

    document.dispatchEvent(new CustomEvent("auth-ready", {
        detail: AuthState
    }));
}

function protectCurrentPage() {
    if (!document.body) {
        return;
    }

    const requiresAuth = document.body.dataset.auth === "required";
    const requiresAdmin = document.body.dataset.admin === "required";

    if (requiresAuth && !AuthState.isLoggedIn) {
        redirectToLogin();
        return;
    }

    if (requiresAdmin && !AuthState.isAdmin) {
        window.location.href = "home.html";
    }
}

function getCurrentPageForRedirect() {
    const fileName = window.location.pathname.split("/").pop() || "home.html";
    return fileName + window.location.search;
}

function redirectToLogin() {
    const currentFile = window.location.pathname.split("/").pop();

    if (currentFile === "login.html") {
        return;
    }

    const redirectTarget = getCurrentPageForRedirect();
    window.location.href = `login.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

function getRedirectTarget(defaultPage = "home.html") {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (!redirect) {
        return defaultPage;
    }

    if (redirect.startsWith("http://") || redirect.startsWith("https://")) {
        return defaultPage;
    }

    return redirect;
}

function getDisplayName() {
    if (!AuthState.isLoggedIn) {
        return "Guest";
    }

    if (AuthState.profile?.name) {
        return AuthState.profile.name;
    }

    const firstName = AuthState.profile?.first_name || "";
    const lastName = AuthState.profile?.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    return AuthState.authUser?.email || "User";
}

async function logoutUser(redirectPage = "home.html") {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        alert("Logout failed. Please try again.");
        return false;
    }

    resetAuthState();
    window.location.href = redirectPage;
    return true;
}

export const Auth = {
    getState: function () {
        return AuthState;
    },

    getUser: function () {
        return AuthState.authUser;
    },

    getProfile: function () {
        return AuthState.profile;
    },

    isLoggedIn: function () {
        return AuthState.isLoggedIn;
    },

    isAdmin: function () {
        return AuthState.isAdmin;
    },

    getDisplayName: getDisplayName,

    getRedirectTarget: getRedirectTarget,

    redirectToLogin: redirectToLogin,

    logout: logoutUser,

    reload: loadAuthState,

    onReady: function (callback) {
        if (AuthState.ready) {
            callback(AuthState);
            return;
        }

        const handler = function (event) {
            document.removeEventListener("auth-ready", handler);
            callback(event.detail);
        };

        document.addEventListener("auth-ready", handler);
    },

    onChange: function (callback) {
        const handler = function (event) {
            callback(event.detail);
        };

        document.addEventListener("auth-ready", handler);

        return function () {
            document.removeEventListener("auth-ready", handler);
        };
    }
};

window.Auth = Auth;

function startAuth() {
    if (authStarted) {
        return;
    }

    authStarted = true;
    loadAuthState();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAuth);
} else {
    startAuth();
}

supabase.auth.onAuthStateChange(function () {
    setTimeout(loadAuthState, 0);
});