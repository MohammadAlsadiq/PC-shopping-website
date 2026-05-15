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

function validateForm() {
    let valid = true;

    if (!lettersOnly.test(firstName.value.trim())) {
        setError(firstName, "Only letters allowed");
        valid = false;
    } else {
        setSuccess(firstName);
    }

    if (!lettersOnly.test(lastName.value.trim())) {
        setError(lastName, "Only letters allowed");
        valid = false;
    } else {
        setSuccess(lastName);
    }

    if (!email.value.trim()) {
        setError(email, "Email is required");
        valid = false;
    } else {
        setSuccess(email);
    }

    if (password.value.length < 8) {
        setError(password, "Minimum 8 characters required");
        valid = false;
    } else {
        setSuccess(password);
    }

    if (confirmPassword.value !== password.value) {
        setError(confirmPassword, "Passwords do not match");
        valid = false;
    } else {
        setSuccess(confirmPassword);
    }

    return valid;
}

firstName.addEventListener("input", function () {
    if (!lettersOnly.test(firstName.value.trim())) {
        setError(firstName, "Only letters allowed");
    } else {
        setSuccess(firstName);
    }
});

lastName.addEventListener("input", function () {
    if (!lettersOnly.test(lastName.value.trim())) {
        setError(lastName, "Only letters allowed");
    } else {
        setSuccess(lastName);
    }
});

password.addEventListener("input", function () {
    if (password.value.length < 8) {
        setError(password, "Minimum 8 characters required");
    } else {
        setSuccess(password);
    }
});

confirmPassword.addEventListener("input", function () {
    if (confirmPassword.value !== password.value) {
        setError(confirmPassword, "Passwords do not match");
    } else {
        setSuccess(confirmPassword);
    }
});

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
        alert(error.message);
        registerButton.disabled = false;
        registerButton.innerText = "Register";
        return;
    }

    alert("Account created successfully.");

    window.location.href = "login.html";
});