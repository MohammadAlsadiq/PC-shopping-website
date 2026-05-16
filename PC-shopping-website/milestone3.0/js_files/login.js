import { supabase } from "./supabaseClient.js";

const form = document.querySelector(".login_form");
const email = document.getElementById("loginEmail");
const password = document.getElementById("loginPassword");
const loginButton = document.querySelector(".login_btn");

function setError(input, message) {
    const parent = input.parentElement;
    const error = parent.querySelector("small");

    error.innerText = message;
    input.classList.add("error_input");
    input.classList.remove("valid_input");
}

function setSuccess(input) {
    const parent = input.parentElement;
    const error = parent.querySelector("small");

    error.innerText = "";
    input.classList.remove("error_input");
    input.classList.add("valid_input");
}

function clearField(input) {
    const parent = input.parentElement;
    const error = parent.querySelector("small");

    error.innerText = "";
    input.classList.remove("error_input");
    input.classList.remove("valid_input");
}

function validateEmail() {
    const emailValue = email.value.trim();

    if (emailValue === "") {
        setError(email, "Email is required");
        return false;
    }

    if (!email.checkValidity()) {
        setError(email, "Enter a valid email address");
        return false;
    }

    setSuccess(email);
    return true;
}

function validatePassword() {
    if (password.value.trim() === "") {
        setError(password, "Password is required");
        return false;
    }

    setSuccess(password);
    return true;
}

function validateForm() {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();

    return emailValid && passwordValid;
}

function getRedirectTarget() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (!redirect) {
        return "home.html";
    }

    if (redirect.startsWith("http://") || redirect.startsWith("https://")) {
        return "home.html";
    }

    return redirect;
}

async function checkEmailExists(emailValue) {
    const { data, error } = await supabase
        .schema("store")
        .rpc("email_exists", {
            email_value: emailValue
        });

    if (error) {
        console.error("Email check error:", error.message);
        return null;
    }

    return data === true;
}

email.addEventListener("input", function () {
    clearField(email);
});

password.addEventListener("input", function () {
    clearField(password);
});

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    loginButton.disabled = true;
    loginButton.innerText = "Checking account...";

    const emailValue = email.value.trim();
    const passwordValue = password.value;

    const emailExists = await checkEmailExists(emailValue);

    if (emailExists === false) {
        setError(email, "No account found with this email");
        clearField(password);

        loginButton.disabled = false;
        loginButton.innerText = "Login";
        return;
    }

    loginButton.innerText = "Logging in...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: passwordValue
    });

    if (error) {
        const message = error.message.toLowerCase();

        if (message.includes("invalid login credentials")) {
            setSuccess(email);
            setError(password, "Incorrect password");
        } else if (message.includes("email not confirmed")) {
            setError(email, "Email is not confirmed");
        } else if (message.includes("rate limit")) {
            setError(email, "Too many login attempts. Try again later.");
        } else {
            alert(error.message);
        }

        loginButton.disabled = false;
        loginButton.innerText = "Login";
        return;
    }

    window.location.href = getRedirectTarget();
});

async function redirectIfAlreadyLoggedIn() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Session check error:", error.message);
        return;
    }

    if (data.session) {
        window.location.href = getRedirectTarget();
    }
}

redirectIfAlreadyLoggedIn();