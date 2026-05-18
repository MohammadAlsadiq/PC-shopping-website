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
    const value = firstName.value.trim();

    if (value === "") {
        setError(firstName, "First name is required");
        return false;
    }

    if (!lettersOnly.test(value)) {
        setError(firstName, "Only letters allowed");
        return false;
    }

    setSuccess(firstName);
    return true;
}

function validateLastName() {
    const value = lastName.value.trim();

    if (value === "") {
        setError(lastName, "Last name is required");
        return false;
    }

    if (!lettersOnly.test(value)) {
        setError(lastName, "Only letters allowed");
        return false;
    }

    setSuccess(lastName);
    return true;
}

function isValidEmailFormat(emailValue) {
    const value = emailValue.trim();

    if (value === "") {
        return false;
    }

    if (value.includes(" ")) {
        return false;
    }

    const parts = value.split("@");

    if (parts.length !== 2) {
        return false;
    }

    const beforeAt = parts[0];
    const afterAt = parts[1];

    if (beforeAt === "" || afterAt === "") {
        return false;
    }

    if (!afterAt.includes(".")) {
        return false;
    }

    const domainParts = afterAt.split(".");

    for (let i = 0; i < domainParts.length; i++) {
        if (domainParts[i] === "") {
            return false;
        }
    }

    return true;
}

function validateEmail() {
    const emailValue = email.value.trim();

    if (emailValue === "") {
        setError(email, "Email is required");
        return false;
    }

    if (!isValidEmailFormat(emailValue)) {
        setError(email, "Enter a valid email format");
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

async function checkAccountAlreadyExists(emailValue) {
    const { data, error } = await supabase
        .schema("store")
        .rpc("auth_email_exists", {
            check_email: emailValue
        });

    if (error) {
        console.error("Email exists check error:", error.message);
        throw error;
    }

    return data === true;
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
    registerButton.innerText = "Checking email...";

    const firstNameValue = firstName.value.trim();
    const lastNameValue = lastName.value.trim();
    const emailValue = email.value.trim().toLowerCase();
    const passwordValue = password.value;

    try {
        const accountExists = await checkAccountAlreadyExists(emailValue);

        if (accountExists) {
            setError(email, "account already exists");
            registerButton.disabled = false;
            registerButton.innerText = "Register";
            return;
        }
    } catch (error) {
        alert("Could not check email. Please try again.");
        registerButton.disabled = false;
        registerButton.innerText = "Register";
        return;
    }

    registerButton.innerText = "Creating account...";

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

        if (
            message.includes("already registered") ||
            message.includes("already exists") ||
            message.includes("user already registered")
        ) {
            setError(email, "account already exists");
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