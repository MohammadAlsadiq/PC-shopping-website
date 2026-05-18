import { supabase } from "./supabaseClient.js";
import { AuthState } from "./auth.js";

const BUCKET_NAME = "items_images";

const productName = document.getElementById("productName");
const productDetails = document.getElementById("productDetails");
const productPrice = document.getElementById("productPrice");
const productImage = document.getElementById("productImage");
const productError = document.getElementById("productError");
const addToCartBtn = document.getElementById("addToCartBtn");

const decreaseQuantityBtn = document.getElementById("decreaseQuantityBtn");
const increaseQuantityBtn = document.getElementById("increaseQuantityBtn");
const productQuantityInput = document.getElementById("productQuantityInput");

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
    productDetails.textContent = formatProductDetails(item.product_details);
    productPrice.textContent = formatPrice(item.price);

    productImage.src = getPublicImageUrl(item.image);
    productImage.alt = `${item.name || "Product"} image`;

    productImage.addEventListener("error", function () {
        productImage.src = "images/logo.png";
    });

    document.title = `${item.name || "Product Details"} | ChipShip`;

    updateAddToCartButton(item);
    updateQuantityControls(item);
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

function updateQuantityControls(item) {
    const stock = Number(item.storedunits || 0);

    if (stock <= 0) {
        productQuantityInput.min = "0";
        productQuantityInput.max = "0";
        productQuantityInput.value = "0";

        decreaseQuantityBtn.disabled = true;
        increaseQuantityBtn.disabled = true;
        productQuantityInput.disabled = true;

        return;
    }

    productQuantityInput.min = "1";
    productQuantityInput.max = String(stock);
    productQuantityInput.disabled = false;

    const quantity = getSelectedQuantity();

    decreaseQuantityBtn.disabled = quantity <= 1;
    increaseQuantityBtn.disabled = quantity >= stock;
}

function getSelectedQuantity() {
    const stock = Number(currentItem?.storedunits || 0);
    let quantity = Math.floor(Number(productQuantityInput.value));

    if (stock <= 0) {
        productQuantityInput.value = "0";
        return 0;
    }

    if (Number.isNaN(quantity) || quantity < 1) {
        quantity = 1;
    }

    if (quantity > stock) {
        quantity = stock;
    }

    productQuantityInput.value = String(quantity);

    return quantity;
}

function setQuantityControlsDisabled(isDisabled) {
    decreaseQuantityBtn.disabled = isDisabled;
    increaseQuantityBtn.disabled = isDisabled;
    productQuantityInput.disabled = isDisabled;
}

decreaseQuantityBtn.addEventListener("click", function () {
    if (!currentItem) {
        return;
    }

    const currentQuantity = getSelectedQuantity();

    if (currentQuantity > 1) {
        productQuantityInput.value = String(currentQuantity - 1);
    }

    updateQuantityControls(currentItem);
});

increaseQuantityBtn.addEventListener("click", function () {
    if (!currentItem) {
        return;
    }

    const stock = Number(currentItem.storedunits || 0);
    const currentQuantity = getSelectedQuantity();

    if (currentQuantity < stock) {
        productQuantityInput.value = String(currentQuantity + 1);
    }

    updateQuantityControls(currentItem);
});

productQuantityInput.addEventListener("change", function () {
    if (!currentItem) {
        return;
    }

    updateQuantityControls(currentItem);
});

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
    const quantityToAdd = getSelectedQuantity();

    if (quantityToAdd < 1) {
        alert("This product is out of stock.");
        updateAddToCartButton(currentItem);
        updateQuantityControls(currentItem);
        return;
    }

    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "Adding...";
    setQuantityControlsDisabled(true);

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

        let wasAdded = false;

        if (existingCartItem) {
            wasAdded = await increaseExistingCartItem(existingCartItem, quantityToAdd);
        } else {
            wasAdded = await insertNewCartItem(activeCart.id, quantityToAdd);
        }

        if (!wasAdded) {
            updateAddToCartButton(currentItem);
            updateQuantityControls(currentItem);
            return;
        }

        addToCartBtn.textContent = "Added";

        setTimeout(function () {
            updateAddToCartButton(currentItem);
            updateQuantityControls(currentItem);
        }, 900);

    } catch (error) {
        console.error("Add to cart error:", error.message);
        alert("Could not add item to cart.");

        updateAddToCartButton(currentItem);
        updateQuantityControls(currentItem);
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

async function increaseExistingCartItem(existingCartItem, quantityToAdd) {
    const currentQuantity = Number(existingCartItem.quantity);
    const newQuantity = currentQuantity + quantityToAdd;
    const availableStock = Number(currentItem.storedunits || 0);

    if (newQuantity > availableStock) {
        alert("You cannot add more than the available stock.");
        return false;
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

    return true;
}

async function insertNewCartItem(cartId, quantityToAdd) {
    const availableStock = Number(currentItem.storedunits || 0);

    if (availableStock <= 0) {
        alert("This product is out of stock.");
        return false;
    }

    if (quantityToAdd > availableStock) {
        alert("You cannot add more than the available stock.");
        return false;
    }

    const { error } = await supabase
        .schema("store")
        .from("cart_items")
        .insert({
            cartid: cartId,
            itemid: currentItem.id,
            quantity: quantityToAdd,
            price_at_time: currentItem.price
        });

    if (error) {
        throw error;
    }

    return true;
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

    productQuantityInput.value = "0";
    setQuantityControlsDisabled(true);
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

function formatProductDetails(details) {
    if (!details) {
        return "No product details available.";
    }

    return details.replaceAll("\\n", "\n");
}

function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "$0.00";
    }

    return `$${numericPrice.toFixed(2)}`;
}