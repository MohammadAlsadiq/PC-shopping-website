import { supabase } from "./supabaseClient.js";
import { AuthState } from "./auth.js";

const BUCKET_NAME = "items_images";

const productName = document.getElementById("productName");
const productDetails = document.getElementById("productDetails");
const productPrice = document.getElementById("productPrice");
const productImage = document.getElementById("productImage");
const productError = document.getElementById("productError");
const addToCartBtn = document.getElementById("addToCartBtn");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let currentItem = null;

loadProductDetails();

async function loadProductDetails() {
    if (!productId) {
        showError("No product was selected.");
        return;
    }

    const { data: item, error } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, price, image, product_details, storedunits")
        .eq("id", productId)
        .single();

    if (error || !item) {
        console.error("Product details Supabase error:", error);
        showError("Product not found.");
        return;
    }

    currentItem = item;

    productName.textContent = item.name || "Unnamed Product";
    productDetails.textContent = item.product_details || "No product details available.";
    productPrice.textContent = formatPrice(item.price);

    productImage.src = getPublicImageUrl(item.image);
    productImage.alt = `${item.name || "Product"} image`;

    productImage.addEventListener("error", function () {
        productImage.src = "images/logo.png";
    });

    document.title = `${item.name || "Product Details"} | ChipShip`;

    updateAddToCartButton(item);
}

function updateAddToCartButton(item) {
    const stock = Number(item.storedunits || 0);

    if (stock <= 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = "Out of Stock";
        return;
    }

    addToCartBtn.disabled = false;
    addToCartBtn.textContent = "Add to Cart";
}

addToCartBtn.addEventListener("click", async function () {
    if (!currentItem) {
        alert("Product is not loaded yet.");
        return;
    }

    if (!AuthState.isLoggedIn) {
        redirectGuestToLogin();
        return;
    }

    await addCurrentItemToCart();
});

function redirectGuestToLogin() {
    const currentPage = window.location.pathname.split("/").pop() || "product-details.html";
    const redirectTarget = `${currentPage}${window.location.search}`;

    window.location.href = `login.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

async function addCurrentItemToCart() {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "Adding...";

    try {
        const activeCart = await getOrCreateActiveCart();

        const { data: existingCartItem, error: existingCartItemError } = await supabase
            .schema("store")
            .from("cart_items")
            .select("id, quantity")
            .eq("cartid", activeCart.id)
            .eq("itemid", currentItem.id)
            .maybeSingle();

        if (existingCartItemError) {
            throw existingCartItemError;
        }

        if (existingCartItem) {
            await increaseExistingCartItem(existingCartItem);
        } else {
            await insertNewCartItem(activeCart.id);
        }

        addToCartBtn.textContent = "Added";

        setTimeout(function () {
            updateAddToCartButton(currentItem);
        }, 900);

    } catch (error) {
        console.error("Add to cart error:", error.message);
        alert("Could not add item to cart.");

        updateAddToCartButton(currentItem);
    }
}

async function getOrCreateActiveCart() {
    const { data: existingCart, error: existingCartError } = await supabase
        .schema("store")
        .from("carts")
        .select("*")
        .eq("userid", AuthState.authUser.id)
        .eq("status", "active")
        .maybeSingle();

    if (existingCartError) {
        throw existingCartError;
    }

    if (existingCart) {
        return existingCart;
    }

    const { data: newCart, error: newCartError } = await supabase
        .schema("store")
        .from("carts")
        .insert({
            userid: AuthState.authUser.id,
            status: "active"
        })
        .select("*")
        .single();

    if (newCartError) {
        throw newCartError;
    }

    return newCart;
}

async function increaseExistingCartItem(existingCartItem) {
    const currentQuantity = Number(existingCartItem.quantity);
    const newQuantity = currentQuantity + 1;
    const availableStock = Number(currentItem.storedunits || 0);

    if (newQuantity > availableStock) {
        alert("You cannot add more than the available stock.");
        updateAddToCartButton(currentItem);
        return;
    }

    const { error } = await supabase
        .schema("store")
        .from("cart_items")
        .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString()
        })
        .eq("id", existingCartItem.id);

    if (error) {
        throw error;
    }
}

async function insertNewCartItem(cartId) {
    const availableStock = Number(currentItem.storedunits || 0);

    if (availableStock <= 0) {
        alert("This product is out of stock.");
        updateAddToCartButton(currentItem);
        return;
    }

    const { error } = await supabase
        .schema("store")
        .from("cart_items")
        .insert({
            cartid: cartId,
            itemid: currentItem.id,
            quantity: 1,
            price_at_time: currentItem.price
        });

    if (error) {
        throw error;
    }
}

function showError(message) {
    productError.textContent = message;
    productName.textContent = "Product not found";
    productDetails.textContent = "";
    productPrice.textContent = "$0.00";
    productImage.src = "images/logo.png";
    productImage.alt = "Product image";

    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "Unavailable";
}

function getPublicImageUrl(imagePath) {
    if (!imagePath) {
        return "images/logo.png";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(imagePath);

    return data.publicUrl;
}

function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "$0.00";
    }

    return `$${numericPrice.toFixed(2)}`;
}