import { supabase } from "./supabaseClient.js";

const BUCKET_NAME = "items_images";
const PRODUCTS_PER_ROW = 5;

let allItems = [];
const sectionStates = new Map();

const sectionCategoryMap = {
    "Desktop PCs": ["Desktop PCs"],
    "Monitors": ["Monitors"],
    "GPUs": ["GPUs"],
    "CPUs": ["CPUs"],
    "Mother-Boards": ["Motherboards"]
};

async function loadHomeItems() {
    const { data, error } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, storedunits, category, price, image")
        .order("id", { ascending: true });

    if (error) {
        console.error("Home page Supabase error:", error);
        showErrorInRows("Failed to load products.");
        return;
    }

    allItems = data || [];

    setupProductSections();
}

function setupProductSections() {
    const productSections = document.querySelectorAll(".product-section");

    productSections.forEach((section) => {
        const titleElement = section.querySelector("h2");
        const productRow = section.querySelector(".product-row");
        const leftArrow = section.querySelector(".left-arrow");
        const rightArrow = section.querySelector(".right-arrow");

        if (!titleElement || !productRow || !leftArrow || !rightArrow) {
            return;
        }

        const sectionTitle = titleElement.textContent.trim();
        const sectionProducts = getProductsForSection(sectionTitle);

        const sectionState = {
            section: section,
            productRow: productRow,
            leftArrow: leftArrow,
            rightArrow: rightArrow,
            sectionTitle: sectionTitle,
            products: sectionProducts,
            startIndex: 0
        };

        sectionStates.set(section, sectionState);

        leftArrow.addEventListener("click", () => {
            moveProductsLeft(section);
        });

        rightArrow.addEventListener("click", () => {
            moveProductsRight(section);
        });

        renderProductRow(section);
    });
}

function getProductsForSection(sectionTitle) {
    const categoryRule = sectionCategoryMap[sectionTitle];

    let products = allItems.filter((item) => {
        const stockAmount = Number(item.storedunits) || 0;
        return stockAmount > 0;
    });

    if (Array.isArray(categoryRule)) {
        products = products.filter((item) => {
            return categoryRule.includes(item.category);
        });
    } else {
        products = [];
    }

    return products;
}

function moveProductsRight(section) {
    const state = sectionStates.get(section);

    if (!state || state.products.length <= PRODUCTS_PER_ROW) {
        return;
    }

    state.startIndex =
        (state.startIndex - 1 + state.products.length) % state.products.length;

    renderProductRow(section);
}

function moveProductsLeft(section) {
    const state = sectionStates.get(section);

    if (!state || state.products.length <= PRODUCTS_PER_ROW) {
        return;
    }

    state.startIndex = (state.startIndex + 1) % state.products.length;

    renderProductRow(section);
}

function renderProductRow(section) {
    const state = sectionStates.get(section);

    if (!state) {
        return;
    }

    state.productRow.innerHTML = "";

    if (state.products.length === 0) {
        for (let i = 0; i < PRODUCTS_PER_ROW; i++) {
            state.productRow.appendChild(createEmptyProductCard("No products found"));
        }

        return;
    }

    for (let i = 0; i < PRODUCTS_PER_ROW; i++) {
        const productIndex = (state.startIndex + i) % state.products.length;
        const product = state.products[productIndex];

        state.productRow.appendChild(createProductCard(product));
    }
}

function createProductCard(product) {
    const productLink = document.createElement("a");
    productLink.href = `product-detail.html?id=${encodeURIComponent(product.id)}`;
    productLink.classList.add("product-link");

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    const productImage = document.createElement("img");
    productImage.src = getPublicImageUrl(product.image);
    productImage.alt = `${product.name || "Product"} image`;

    productImage.addEventListener("error", () => {
        productImage.src = "images/logo.png";
    });

    const productInfo = document.createElement("div");
    productInfo.classList.add("product-info");

    const productDescription = document.createElement("p");
    productDescription.classList.add("product-description");
    productDescription.textContent = product.name || "Unnamed Product";

    const productPrice = document.createElement("p");
    productPrice.classList.add("product-price");
    productPrice.textContent = formatPrice(product.price);

    productInfo.appendChild(productDescription);
    productInfo.appendChild(productPrice);

    productCard.appendChild(productImage);
    productCard.appendChild(productInfo);

    productLink.appendChild(productCard);

    return productLink;
}

function createEmptyProductCard(message) {
    const productBox = document.createElement("div");
    productBox.classList.add("product-link");

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    const productInfo = document.createElement("div");
    productInfo.classList.add("product-info");

    const productDescription = document.createElement("p");
    productDescription.classList.add("product-description");
    productDescription.textContent = message;

    const productPrice = document.createElement("p");
    productPrice.classList.add("product-price");
    productPrice.textContent = "";

    productInfo.appendChild(productDescription);
    productInfo.appendChild(productPrice);

    productCard.appendChild(productInfo);
    productBox.appendChild(productCard);

    return productBox;
}

function showErrorInRows(message) {
    const productRows = document.querySelectorAll(".product-row");

    productRows.forEach((row) => {
        row.innerHTML = "";

        for (let i = 0; i < PRODUCTS_PER_ROW; i++) {
            row.appendChild(createEmptyProductCard(message));
        }
    });
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
        return "0.00 SAR";
    }

    return `${numericPrice.toFixed(2)} SAR`;
}

loadHomeItems();