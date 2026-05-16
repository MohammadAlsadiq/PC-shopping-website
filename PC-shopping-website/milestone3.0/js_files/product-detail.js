import { supabase } from "./supabaseClient.js";

const BUCKET_NAME = "items_images";

const productName = document.getElementById("productName");
const productDetails = document.getElementById("productDetails");
const productPrice = document.getElementById("productPrice");
const productImage = document.getElementById("productImage");
const productError = document.getElementById("productError");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

loadProductDetails();

async function loadProductDetails() {
    if (!productId) {
        showError("No product was selected.");
        return;
    }

    const { data: item, error } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, price, image, product_details")
        .eq("id", productId)
        .single();

    if (error || !item) {
        console.error("Product details Supabase error:", error);
        showError("Product not found.");
        return;
    }

    productName.textContent = item.name || "Unnamed Product";
    productDetails.textContent = item.product_details || "No product details available.";
    productPrice.textContent = formatPrice(item.price);

    productImage.src = getPublicImageUrl(item.image);
    productImage.alt = `${item.name || "Product"} image`;

    productImage.addEventListener("error", () => {
        productImage.src = "images/pc.png";
    });

    document.title = `${item.name || "Product Details"} | ChipShip`;
}

function showError(message) {
    productError.textContent = message;
    productName.textContent = "Product not found";
    productDetails.textContent = "";
    productPrice.textContent = "$0.00";
    productImage.src = "images/pc.png";
    productImage.alt = "Product image";
}

function getPublicImageUrl(imagePath) {
    if (!imagePath) {
        return "images/pc.png";
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