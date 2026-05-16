import { supabase } from "./supabaseClient.js";
import { Auth, AuthState } from "./auth.js";

const BUCKET_NAME = "items_images";

const checkoutContent = document.getElementById("checkoutContent");
const confirmationContent = document.getElementById("confirmationContent");

const addressNotice = document.getElementById("addressNotice");
const addressInput = document.getElementById("addressInput");

const checkoutForm = document.getElementById("checkoutForm");
const cardName = document.getElementById("cardName");
const cardNumber = document.getElementById("cardNumber");
const cardExpiry = document.getElementById("cardExpiry");
const cardCvv = document.getElementById("cardCvv");
const placeOrderBtn = document.getElementById("placeOrderBtn");

const cartMessage = document.getElementById("cartMessage");
const checkoutItems = document.getElementById("checkoutItems");
const balanceDue = document.getElementById("balanceDue");

const orderNumberText = document.getElementById("orderNumberText");
const confirmedItems = document.getElementById("confirmedItems");
const confirmedTotal = document.getElementById("confirmedTotal");

let activeCart = null;
let currentCartItems = [];
let currentTotal = 0;

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

function validateAddress() {
    if (addressInput.value.trim() === "") {
        setError(addressInput, "Address is required");
        return false;
    }

    setSuccess(addressInput);
    return true;
}

function validateCardName() {
    if (cardName.value.trim().length < 3) {
        setError(cardName, "Enter the name on the card");
        return false;
    }

    setSuccess(cardName);
    return true;
}

function validateCardNumber() {
    const numbersOnly = cardNumber.value.replace(/\s/g, "");

    if (!/^\d{16}$/.test(numbersOnly)) {
        setError(cardNumber, "Enter a 16-digit card number");
        return false;
    }

    setSuccess(cardNumber);
    return true;
}

function validateCardExpiry() {
    const value = cardExpiry.value.trim();

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
        setError(cardExpiry, "Use MM/YY format");
        return false;
    }

    const parts = value.split("/");
    const month = Number(parts[0]);
    const year = Number("20" + parts[1]);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        setError(cardExpiry, "Card is expired");
        return false;
    }

    setSuccess(cardExpiry);
    return true;
}

function validateCvv() {
    if (!/^\d{3,4}$/.test(cardCvv.value.trim())) {
        setError(cardCvv, "Enter a valid CVV");
        return false;
    }

    setSuccess(cardCvv);
    return true;
}

function validateCheckoutForm() {
    const addressValid = validateAddress();
    const nameValid = validateCardName();
    const numberValid = validateCardNumber();
    const expiryValid = validateCardExpiry();
    const cvvValid = validateCvv();

    return addressValid && nameValid && numberValid && expiryValid && cvvValid;
}

function formatMoney(value) {
    return `${Number(value || 0).toFixed(2)} SAR`;
}

function getProductImage(imagePath) {
    if (!imagePath || imagePath.trim() === "") {
        return "images/ChipShip logo design with microchip focus.png";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(imagePath);

    return data.publicUrl;
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadActiveCart() {
    const { data, error } = await supabase
        .schema("store")
        .from("carts")
        .select("*")
        .eq("userid", AuthState.authUser.id)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
        console.error("Cart load error:", error.message);
        cartMessage.textContent = "Could not load your cart.";
        return null;
    }

    return data;
}

async function loadCartItems(cartId) {
    const { data: cartItems, error: cartItemsError } = await supabase
        .schema("store")
        .from("cart_items")
        .select("id, cartid, itemid, quantity, price_at_time")
        .eq("cartid", cartId)
        .order("id", { ascending: true });

    if (cartItemsError) {
        console.error("Cart items error:", cartItemsError.message);
        cartMessage.textContent = "Could not load cart items.";
        return [];
    }

    if (!cartItems || cartItems.length === 0) {
        return [];
    }

    const itemIds = cartItems.map(function (cartItem) {
        return cartItem.itemid;
    });

    const { data: products, error: productsError } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, storedunits, category, price, image")
        .in("id", itemIds);

    if (productsError) {
        console.error("Products load error:", productsError.message);
        cartMessage.textContent = "Could not load product details.";
        return [];
    }

    const productsById = {};

    products.forEach(function (product) {
        productsById[product.id] = product;
    });

    return cartItems.map(function (cartItem) {
        return {
            ...cartItem,
            product: productsById[cartItem.itemid] || null
        };
    });
}

function renderCheckoutItems() {
    checkoutItems.innerHTML = "";
    currentTotal = 0;

    if (currentCartItems.length === 0) {
        cartMessage.style.display = "block";
        cartMessage.textContent = "Your cart is empty.";
        balanceDue.textContent = formatMoney(0);
        placeOrderBtn.disabled = true;
        return;
    }

    cartMessage.style.display = "none";
    placeOrderBtn.disabled = false;

    currentCartItems.forEach(function (cartItem) {
        const product = cartItem.product;

        if (!product) {
            return;
        }

        const subtotal = Number(cartItem.price_at_time) * Number(cartItem.quantity);
        currentTotal += subtotal;

        const itemElement = document.createElement("article");
        itemElement.className = "checkout_item";

        itemElement.innerHTML = `
            <img
                src="${escapeHTML(getProductImage(product.image))}"
                alt="${escapeHTML(product.name)}"
                onerror="this.onerror=null; this.src='images/ChipShip logo design with microchip focus.png'"
            >

            <div>
                <h3>${escapeHTML(product.name)}</h3>
                <p>Quantity: ${cartItem.quantity}</p>
                <p>Unit Price: ${formatMoney(cartItem.price_at_time)}</p>
            </div>

            <div class="checkout_item_price">
                ${formatMoney(subtotal)}
            </div>
        `;

        checkoutItems.appendChild(itemElement);
    });

    balanceDue.textContent = formatMoney(currentTotal);
}

async function loadCheckoutPage() {
    cartMessage.textContent = "Loading cart...";

    if (AuthState.profile?.address && AuthState.profile.address.trim() !== "") {
        addressInput.value = AuthState.profile.address;
        addressNotice.textContent = "Using your saved address. You can edit it for this order.";
    } else {
        addressNotice.textContent = "No saved address found. Please add a delivery address.";
    }

    activeCart = await loadActiveCart();

    if (!activeCart) {
        currentCartItems = [];
        renderCheckoutItems();
        return;
    }

    currentCartItems = await loadCartItems(activeCart.id);
    renderCheckoutItems();
}

function renderConfirmation(orderData) {
    checkoutContent.classList.add("hidden");
    confirmationContent.classList.remove("hidden");

    orderNumberText.textContent = `Order ID: #${orderData.order_id}`;
    confirmedItems.innerHTML = "";

    currentCartItems.forEach(function (cartItem) {
        const product = cartItem.product;

        if (!product) {
            return;
        }

        const subtotal = Number(cartItem.price_at_time) * Number(cartItem.quantity);

        const itemElement = document.createElement("article");
        itemElement.className = "confirmed_item";

        itemElement.innerHTML = `
            <img
                src="${escapeHTML(getProductImage(product.image))}"
                alt="${escapeHTML(product.name)}"
                onerror="this.onerror=null; this.src='images/ChipShip logo design with microchip focus.png'"
            >

            <div>
                <h3>${escapeHTML(product.name)}</h3>
                <p>Quantity: ${cartItem.quantity}</p>
            </div>

            <div class="confirmed_item_price">
                ${formatMoney(subtotal)}
            </div>
        `;

        confirmedItems.appendChild(itemElement);
    });

    confirmedTotal.textContent = formatMoney(orderData.order_total);
}

checkoutForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (currentCartItems.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    if (!validateCheckoutForm()) {
        return;
    }

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Processing...";

    const { data, error } = await supabase
        .schema("store")
        .rpc("checkout_active_cart", {
            delivery_address: addressInput.value.trim()
        });

    if (error) {
        console.error("Checkout error:", error.message);
        alert(error.message);

        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order";
        return;
    }

    const orderData = Array.isArray(data) ? data[0] : data;

    renderConfirmation(orderData);
});

cardNumber.addEventListener("input", function () {
    const numbersOnly = cardNumber.value.replace(/\D/g, "").slice(0, 16);
    cardNumber.value = numbersOnly.replace(/(.{4})/g, "$1 ").trim();
});

cardExpiry.addEventListener("input", function () {
    let value = cardExpiry.value.replace(/\D/g, "").slice(0, 4);

    if (value.length >= 3) {
        value = value.slice(0, 2) + "/" + value.slice(2);
    }

    cardExpiry.value = value;
});

cardCvv.addEventListener("input", function () {
    cardCvv.value = cardCvv.value.replace(/\D/g, "").slice(0, 4);
});

addressInput.addEventListener("input", validateAddress);
cardName.addEventListener("input", validateCardName);
cardNumber.addEventListener("input", validateCardNumber);
cardExpiry.addEventListener("input", validateCardExpiry);
cardCvv.addEventListener("input", validateCvv);

Auth.onReady(async function () {
    if (!AuthState.isLoggedIn) {
        return;
    }

    await loadCheckoutPage();
});