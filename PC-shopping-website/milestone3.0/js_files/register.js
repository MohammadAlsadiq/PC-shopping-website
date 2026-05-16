import { supabase } from "./supabaseClient.js";

const firstName = document.getElementById("first_name");
const lastName = document.getElementById("last_name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm_password");
const form = document.querySelector(".register_form");
const registerButton = document.querySelector(".register_btn");

const lettersOnly = /^[A-Za-z]+$/;

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

function validateFirstName() {
    if (!lettersOnly.test(firstName.value.trim())) {
        setError(firstName, "Only letters allowed");
        return false;
    }

    setSuccess(firstName);
    return true;
}

function validateLastName() {
    if (!lettersOnly.test(lastName.value.trim())) {
        setError(lastName, "Only letters allowed");
        return false;
    }

    setSuccess(lastName);
    return true;
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
    if (password.value.length < 8) {
        setError(password, "Minimum 8 characters required");
        return false;
    }

    setSuccess(password);
    return true;
}

function validateConfirmPassword() {
    if (confirmPassword.value !== password.value) {
        setError(confirmPassword, "Passwords do not match");
        return false;
    }

    setSuccess(confirmPassword);
    return true;
}

function validateForm() {
    const firstNameValid = validateFirstName();
    const lastNameValid = validateLastName();
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    const confirmPasswordValid = validateConfirmPassword();

    return firstNameValid &&
           lastNameValid &&
           emailValid &&
           passwordValid &&
           confirmPasswordValid;
}

firstName.addEventListener("input", validateFirstName);
lastName.addEventListener("input", validateLastName);
email.addEventListener("input", validateEmail);
password.addEventListener("input", validatePassword);
confirmPassword.addEventListener("input", validateConfirmPassword);

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const valid = validateForm();

    if (!valid) {
        return;
    }

    registerButton.disabled = true;
    registerButton.innerText = "Creating account...";

    const firstNameValue = firstName.value.trim();
    const lastNameValue = lastName.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value;

    const { data, error } = await supabase.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
            data: {
                first_name: firstNameValue,
                last_name: lastNameValue
            }
        }
    });

    if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("already registered") || message.includes("already exists")) {
        setError(email, "This email already has an account");
    } else if (message.includes("rate limit")) {
        setError(email, "Too many signup attempts. Please wait and try again later.");
    } else {
        alert(error.message);
    }

    registerButton.disabled = false;
    registerButton.innerText = "Register";
    return;
}

    alert("Account created successfully.");
    window.location.href = "home.html";
});