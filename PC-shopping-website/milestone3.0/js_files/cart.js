import { supabase } from "./supabaseClient.js";
import { Auth, AuthState } from "./auth.js";

const BUCKET_NAME = "items_images";
const cartMessage = document.getElementById("cartMessage");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const summaryItems = document.getElementById("summaryItems");
const summaryTotal = document.getElementById("summaryTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

let activeCart = null;
let currentCartItems = [];

function showMessage(message) {
    cartMessage.style.display = "flex";
    cartMessage.textContent = message;
    cartItemsContainer.innerHTML = "";
}

function hideMessage() {
    cartMessage.style.display = "none";
}

function formatMoney(value) {
    return `${Number(value || 0).toFixed(2)} SAR`;
}

function getFallbackImage() {
    return encodeURI("images/ChipShip logo design with microchip focus.png");
}

function getProductImage(imagePath) {
    if (!imagePath || imagePath.trim() === "") {
        return getFallbackImage();
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    if (imagePath.startsWith("images/")) {
        return encodeURI(imagePath);
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(imagePath);

    return data.publicUrl;
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
        showMessage("Could not load your cart.");
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
        showMessage("Could not load cart items.");
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
        showMessage("Could not load product details.");
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

function renderCart() {
    cartItemsContainer.innerHTML = "";

    if (!currentCartItems || currentCartItems.length === 0) {
        showMessage("Your cart is empty.");
        updateSummary();
        return;
    }

    hideMessage();

    currentCartItems.forEach(function (cartItem) {
        const product = cartItem.product;

        if (!product) {
            return;
        }

        const itemPrice = Number(cartItem.price_at_time);
        const subtotal = itemPrice * cartItem.quantity;

        const itemElement = document.createElement("article");
        itemElement.className = "cart_item";

        itemElement.innerHTML = `
            <img
                class="cart_item_image"
                src="${getProductImage(product.image)}"
                alt="${product.name}"
                onerror="this.onerror=null; this.src='${getFallbackImage()}'"
            >

            <div class="cart_item_info">
                <h3>${product.name}</h3>
                <p>Category: ${product.category || "N/A"}</p>
                <p class="item_price">Price: ${formatMoney(itemPrice)}</p>
                <p class="item_quantity_text">Quantity: ${cartItem.quantity}</p>
                <p>Available stock: ${product.storedunits}</p>
                <p class="item_subtotal">Subtotal: ${formatMoney(subtotal)}</p>
            </div>

            <div class="cart_item_controls">
                <div class="quantity_control">
                    <button type="button" class="decrease_btn" data-cart-item-id="${cartItem.id}">-</button>
                    <input
                        type="number"
                        min="1"
                        max="${product.storedunits}"
                        value="${cartItem.quantity}"
                        data-cart-item-id="${cartItem.id}"
                    >
                    <button type="button" class="increase_btn" data-cart-item-id="${cartItem.id}">+</button>
                </div>

                <button type="button" class="remove_btn" data-cart-item-id="${cartItem.id}">
                    Remove
                </button>
            </div>
        `;

        cartItemsContainer.appendChild(itemElement);
    });

    setupItemButtons();
    updateSummary();
}

function updateSummary() {
    let totalQuantity = 0;
    let totalPrice = 0;

    currentCartItems.forEach(function (cartItem) {
        totalQuantity += cartItem.quantity;
        totalPrice += Number(cartItem.price_at_time) * cartItem.quantity;
    });

    summaryItems.textContent = totalQuantity;
    summaryTotal.textContent = formatMoney(totalPrice);
    checkoutBtn.disabled = totalQuantity === 0;
}

function findCartItem(cartItemId) {
    return currentCartItems.find(function (cartItem) {
        return String(cartItem.id) === String(cartItemId);
    });
}

function setupItemButtons() {
    const decreaseButtons = document.querySelectorAll(".decrease_btn");
    const increaseButtons = document.querySelectorAll(".increase_btn");
    const removeButtons = document.querySelectorAll(".remove_btn");
    const quantityInputs = document.querySelectorAll(".quantity_control input");

    decreaseButtons.forEach(function (button) {
        button.addEventListener("click", async function () {
            const cartItem = findCartItem(button.dataset.cartItemId);

            if (!cartItem) {
                return;
            }

            const newQuantity = cartItem.quantity - 1;

            if (newQuantity < 1) {
                await removeCartItem(cartItem.id);
            } else {
                await updateCartItemQuantity(cartItem.id, newQuantity);
            }
        });
    });

    increaseButtons.forEach(function (button) {
        button.addEventListener("click", async function () {
            const cartItem = findCartItem(button.dataset.cartItemId);

            if (!cartItem) {
                return;
            }

            const maxStock = cartItem.product?.storedunits || 1;
            const newQuantity = cartItem.quantity + 1;

            if (newQuantity > maxStock) {
                alert("You cannot add more than the available stock.");
                return;
            }

            await updateCartItemQuantity(cartItem.id, newQuantity);
        });
    });

    removeButtons.forEach(function (button) {
        button.addEventListener("click", async function () {
            await removeCartItem(button.dataset.cartItemId);
        });
    });

    quantityInputs.forEach(function (input) {
        input.addEventListener("change", async function () {
            const cartItem = findCartItem(input.dataset.cartItemId);

            if (!cartItem) {
                return;
            }

            const maxStock = cartItem.product?.storedunits || 1;
            let newQuantity = Number(input.value);

            if (Number.isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
            }

            if (newQuantity > maxStock) {
                alert("You cannot add more than the available stock.");
                newQuantity = maxStock;
            }

            await updateCartItemQuantity(cartItem.id, newQuantity);
        });
    });
}

async function updateCartItemQuantity(cartItemId, quantity) {
    const { error } = await supabase
        .schema("store")
        .from("cart_items")
        .update({
            quantity: quantity,
            updated_at: new Date().toISOString()
        })
        .eq("id", cartItemId);

    if (error) {
        alert("Could not update quantity.");
        console.error("Quantity update error:", error.message);
        return;
    }

    await loadCartPage();
}

async function removeCartItem(cartItemId) {
    const confirmRemove = confirm("Remove this item from your cart?");

    if (!confirmRemove) {
        return;
    }

    const { error } = await supabase
        .schema("store")
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

    if (error) {
        alert("Could not remove item.");
        console.error("Remove item error:", error.message);
        return;
    }

    await loadCartPage();
}

async function loadCartPage() {
    showMessage("Loading cart...");

    activeCart = await loadActiveCart();

    if (!activeCart) {
        currentCartItems = [];
        renderCart();
        return;
    }

    currentCartItems = await loadCartItems(activeCart.id);
    renderCart();
}

checkoutBtn.addEventListener("click", function () {
    if (!currentCartItems || currentCartItems.length === 0) {
        return;
    }

    window.location.href = "checkout.html";
});

Auth.onReady(async function () {
    if (!AuthState.isLoggedIn) {
        return;
    }

    await loadCartPage();
});