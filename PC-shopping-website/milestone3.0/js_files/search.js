import { supabase } from "./supabaseClient.js";
import { Auth, AuthState } from "./auth.js";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceSort = document.getElementById("priceSort");
const resultCount = document.getElementById("resultCount");
const productsGrid = document.getElementById("productsGrid");

const fallbackImage = encodeURI("images/ChipShip logo design with microchip focus.png");

let loadedItems = [];
let searchResults = [];
let loadedKeyword = "";

function getUrlSearchValue() {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
}

function getUrlCategoryValue() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category") || "All";
}

function getUrlSortValue() {
    const params = new URLSearchParams(window.location.search);
    return params.get("sort") || "default";
}

function updateUrl() {
    const query = searchInput.value.trim();
    const category = categoryFilter.value;
    const sort = priceSort.value;

    const params = new URLSearchParams();

    if (query !== "") {
        params.set("q", query);
    }

    if (category !== "All") {
        params.set("category", category);
    }

    if (sort !== "default") {
        params.set("sort", sort);
    }

    const newUrl = params.toString() ? `search.html?${params.toString()}` : "search.html";
    window.history.replaceState({}, "", newUrl);
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function cleanSearchTerm(value) {
    return String(value || "")
        .replace(/[,%()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getSearchWords(keyword) {
    return cleanSearchTerm(keyword)
        .toLowerCase()
        .split(" ")
        .filter(function (word) {
            return word.length > 0;
        });
}

function getSearchScore(item, keyword) {
    const query = normalizeText(keyword);

    if (query === "") {
        return 1;
    }

    const itemName = normalizeText(item.name);
    const itemCategory = normalizeText(item.category);
    const words = getSearchWords(keyword);

    let score = 0;

    if (itemName === query) {
        score += 100;
    }

    if (itemName.startsWith(query)) {
        score += 75;
    }

    if (itemName.includes(query)) {
        score += 55;
    }

    if (itemCategory === query) {
        score += 45;
    }

    if (itemCategory.includes(query)) {
        score += 35;
    }

    words.forEach(function (word) {
        if (itemName.includes(word)) {
            score += 12;
        }

        if (itemCategory.includes(word)) {
            score += 8;
        }
    });

    return score;
}

function applyLocalFilters() {
    const keyword = searchInput.value.trim();
    const selectedCategory = categoryFilter.value;
    const selectedSort = priceSort.value;

    let filteredItems = loadedItems
        .map(function (item) {
            return {
                ...item,
                search_score: getSearchScore(item, keyword)
            };
        })
        .filter(function (item) {
            if (selectedCategory !== "All" && item.category !== selectedCategory) {
                return false;
            }

            if (keyword !== "" && item.search_score <= 0) {
                return false;
            }

            return true;
        });

    if (selectedSort === "price-low-high") {
        filteredItems.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    } else if (selectedSort === "price-high-low") {
        filteredItems.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    } else {
        filteredItems.sort(function (a, b) {
            return b.search_score - a.search_score;
        });
    }

    searchResults = filteredItems;

    updateUrl();
    renderProducts();
}

function buildSearchOrConditions(keyword) {
    const words = getSearchWords(keyword);

    if (words.length === 0) {
        return "";
    }

    const conditions = [];

    words.forEach(function (word) {
        conditions.push(`name.ilike.%${word}%`);
        conditions.push(`category.ilike.%${word}%`);
    });

    return conditions.join(",");
}

async function fetchItemsFromDatabase(keyword) {
    const cleanKeyword = cleanSearchTerm(keyword);
    const selectedCategory = categoryFilter.value;

    resultCount.textContent = "Searching products...";
    productsGrid.innerHTML = "";

    let query = supabase
        .schema("store")
        .from("items")
        .select("id, name, storedunits, category, price, image, product_details")
        .limit(120);

    if (cleanKeyword !== "") {
        const orConditions = buildSearchOrConditions(cleanKeyword);
        query = query.or(orConditions);
    } else if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
    } else {
        loadedItems = [];
        searchResults = [];
        resultCount.textContent = "Enter a search term or choose a category.";
        renderProducts();
        return;
    }

    const { data, error } = await query;

    if (error) {
        console.error("Search load error:", error.message);
        resultCount.textContent = "Could not load products.";
        productsGrid.innerHTML = "";
        return;
    }

    loadedKeyword = cleanKeyword;
    loadedItems = data || [];

    applyLocalFilters();
}

function shouldFetchNewKeyword() {
    const currentKeyword = cleanSearchTerm(searchInput.value.trim());

    if (currentKeyword !== loadedKeyword) {
        return true;
    }

    if (currentKeyword === "" && loadedItems.length === 0 && categoryFilter.value !== "All") {
        return true;
    }

    return false;
}

async function runSearch() {
    if (shouldFetchNewKeyword()) {
        await fetchItemsFromDatabase(searchInput.value.trim());
    } else {
        applyLocalFilters();
    }
}

function formatMoney(value) {
    return `${Number(value || 0).toFixed(2)} SAR`;
}

function getProductImage(imagePath) {
    if (!imagePath || imagePath.trim() === "") {
        return fallbackImage;
    }

    return imagePath;
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderProducts() {
    productsGrid.innerHTML = "";

    if (searchResults.length === 0) {
        if (loadedItems.length === 0) {
            resultCount.textContent = "No products loaded yet.";
        } else {
            resultCount.textContent = "0 products found.";
        }

        const emptyMessage = document.createElement("div");
        emptyMessage.className = "no_results";

        if (loadedItems.length === 0) {
            emptyMessage.textContent = "Search by product name, category, or choose a category.";
        } else {
            emptyMessage.textContent = "No products matched your filters.";
        }

        productsGrid.appendChild(emptyMessage);
        return;
    }

    resultCount.textContent = `${searchResults.length} product(s) found.`;

    searchResults.forEach(function (item) {
        const card = document.createElement("article");
        card.className = "product_card";

        const inStock = Number(item.storedunits) > 0;

        card.innerHTML = `
            <img
                class="product_image"
                src="${escapeHTML(getProductImage(item.image))}"
                alt="${escapeHTML(item.name)}"
                onerror="this.onerror=null; this.src='${fallbackImage}'"
            >

            <div class="product_info">
                <h2 class="product_name">${escapeHTML(item.name)}</h2>
                <p class="product_category">${escapeHTML(item.category)}</p>
                <p class="product_price">${formatMoney(item.price)}</p>
                <p class="product_stock">${inStock ? `${item.storedunits} in stock` : "Out of stock"}</p>
            </div>

            <div class="product_actions">
                <a class="view_btn" href="product-details.html?id=${item.id}">
                    View
                </a>

                <button
                    type="button"
                    class="add_cart_btn"
                    data-item-id="${item.id}"
                    ${inStock ? "" : "disabled"}
                >
                    ${inStock ? "Add to Cart" : "Out of Stock"}
                </button>
            </div>
        `;

        productsGrid.appendChild(card);
    });

    setupAddToCartButtons();
}

function setupAddToCartButtons() {
    const buttons = document.querySelectorAll(".add_cart_btn");

    buttons.forEach(function (button) {
        button.addEventListener("click", async function () {
            const itemId = Number(button.dataset.itemId);

            const item = searchResults.find(function (product) {
                return Number(product.id) === itemId;
            });

            if (!item) {
                return;
            }

            await addToCart(item, button);
        });
    });
}

async function getOrCreateActiveCart() {
    const { data: existingCart, error: existingError } = await supabase
        .schema("store")
        .from("carts")
        .select("*")
        .eq("userid", AuthState.authUser.id)
        .eq("status", "active")
        .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    if (existingCart) {
        return existingCart;
    }

    const { data: newCart, error: createError } = await supabase
        .schema("store")
        .from("carts")
        .insert({
            userid: AuthState.authUser.id,
            status: "active"
        })
        .select("*")
        .single();

    if (createError) {
        throw createError;
    }

    return newCart;
}

async function addToCart(item, button) {
    if (!AuthState.isLoggedIn) {
        const currentUrl = `search.html${window.location.search}`;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
        return;
    }

    button.disabled = true;
    button.textContent = "Adding...";

    try {
        const cart = await getOrCreateActiveCart();

        const { data: existingItem, error: existingItemError } = await supabase
            .schema("store")
            .from("cart_items")
            .select("*")
            .eq("cartid", cart.id)
            .eq("itemid", item.id)
            .maybeSingle();

        if (existingItemError) {
            throw existingItemError;
        }

        if (existingItem) {
            const newQuantity = Number(existingItem.quantity) + 1;

            if (newQuantity > Number(item.storedunits)) {
                alert("You cannot add more than the available stock.");
                button.disabled = false;
                button.textContent = "Add to Cart";
                return;
            }

            const { error: updateError } = await supabase
                .schema("store")
                .from("cart_items")
                .update({
                    quantity: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingItem.id);

            if (updateError) {
                throw updateError;
            }
        } else {
            const { error: insertError } = await supabase
                .schema("store")
                .from("cart_items")
                .insert({
                    cartid: cart.id,
                    itemid: item.id,
                    quantity: 1,
                    price_at_time: item.price
                });

            if (insertError) {
                throw insertError;
            }
        }

        button.textContent = "Added";

        setTimeout(function () {
            button.disabled = false;
            button.textContent = "Add to Cart";
        }, 900);

    } catch (error) {
        console.error("Add to cart error:", error.message);
        alert("Could not add item to cart.");

        button.disabled = false;
        button.textContent = "Add to Cart";
    }
}

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    await fetchItemsFromDatabase(searchInput.value.trim());
});

categoryFilter.addEventListener("change", async function () {
    const keyword = cleanSearchTerm(searchInput.value.trim());

    if (keyword === "") {
        await fetchItemsFromDatabase("");
    } else {
        applyLocalFilters();
    }
});

priceSort.addEventListener("change", applyLocalFilters);

function setInitialValuesFromUrl() {
    searchInput.value = getUrlSearchValue();
    categoryFilter.value = getUrlCategoryValue();
    priceSort.value = getUrlSortValue();
}

Auth.onReady(async function () {
    setInitialValuesFromUrl();

    const initialKeyword = searchInput.value.trim();
    const initialCategory = categoryFilter.value;

    if (initialKeyword !== "" || initialCategory !== "All") {
        await fetchItemsFromDatabase(initialKeyword);
    } else {
        loadedItems = [];
        searchResults = [];
        resultCount.textContent = "Enter a search term or choose a category.";
        renderProducts();
    }
});

window.SearchPage = {
    getLoadedItems: function () {
        return loadedItems;
    },

    getSearchResults: function () {
        return searchResults;
    },

    refreshSearch: runSearch
};