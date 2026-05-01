import { supabase } from "./supabaseClient.js";

const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventoryStatus = document.getElementById("inventoryStatus");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

const refreshButton = document.getElementById("refreshButton");
const addItemButton = document.getElementById("addItemButton");
const deleteItemButton = document.getElementById("deleteItemButton");
const modifyItemButton = document.getElementById("modifyItemButton");

const itemModal = document.getElementById("itemModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModalButton = document.getElementById("closeModalButton");

let inventoryItems = [];
let displayedItems = [];

const categories = [
    "All",
    "Desktop PCs",
    "Laptops",
    "CPUs",
    "GPUs",
    "Motherboards",
    "RAM",
    "Storage",
    "Power Supplies",
    "Cooling",
    "Cases",
    "Monitors",
    "Keyboards",
    "Mice",
    "Headsets",
    "Speakers",
    "Networking",
    "Cables",
    "Accessories"
];

function loadCategoryOptions() {
    categoryFilter.innerHTML = "";

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

async function loadInventoryItems() {
    setStatus("Loading inventory...");

    inventoryTableBody.innerHTML = `
        <tr>
            <td colspan="6">Loading inventory...</td>
        </tr>
    `;

    const { data, error } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, storedunits, category, price")
        .order("id", { ascending: true });

    if (error) {
        console.error("Supabase error:", error);

        inventoryItems = [];
        displayedItems = [];

        setStatus("Failed to load inventory.");

        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="6">Error: ${error.message}</td>
            </tr>
        `;

        return;
    }

    inventoryItems = data || [];
    displayedItems = [...inventoryItems];

    applyTableModifiers();
}

function applyTableModifiers() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortFilter.value;

    displayedItems = inventoryItems.filter((item) => {
        const itemName = String(item.name || "").toLowerCase();
        const itemCategory = String(item.category || "");
        const stockAmount = Number(item.storedunits) || 0;

        const matchesSearch = itemName.includes(searchValue);
        const matchesCategory =
            selectedCategory === "All" || itemCategory === selectedCategory;

        const matchesOutOfStock =
            selectedSort !== "out-of-stock" || stockAmount === 0;

        return matchesSearch && matchesCategory && matchesOutOfStock;
    });

    sortDisplayedItems(selectedSort);
    renderInventoryTable(displayedItems);
}

function sortDisplayedItems(sortType) {
    if (sortType === "price-low-high") {
        displayedItems.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortType === "price-high-low") {
        displayedItems.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortType === "stock-high-low") {
        displayedItems.sort((a, b) => Number(b.storedunits) - Number(a.storedunits));
    }

    if (sortType === "stock-low-high") {
        displayedItems.sort((a, b) => Number(a.storedunits) - Number(b.storedunits));
    }

    if (sortType === "default" || sortType === "out-of-stock") {
        displayedItems.sort((a, b) => Number(a.id) - Number(b.id));
    }
}

function renderInventoryTable(items) {
    inventoryTableBody.innerHTML = "";

    if (!items || items.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No matching inventory items found.";

        row.appendChild(cell);
        inventoryTableBody.appendChild(row);

        setStatus("Showing 0 items.");
        return;
    }

    items.forEach((item) => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = item.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;

        const storedUnitsCell = document.createElement("td");
        storedUnitsCell.textContent = item.storedunits;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;

        const priceCell = document.createElement("td");
        priceCell.textContent = formatPrice(item.price);

        const availabilityCell = document.createElement("td");
        availabilityCell.appendChild(createAvailabilityBadge(item.storedunits));

        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(storedUnitsCell);
        row.appendChild(categoryCell);
        row.appendChild(priceCell);
        row.appendChild(availabilityCell);

        inventoryTableBody.appendChild(row);
    });

    setStatus(`Showing ${items.length} of ${inventoryItems.length} items.`);
}

function createAvailabilityBadge(storedUnits) {
    const stockAmount = Number(storedUnits) || 0;

    const badge = document.createElement("span");
    badge.classList.add("stock-status");

    if (stockAmount === 0) {
        badge.textContent = "Out of Stock";
        badge.classList.add("out-of-stock");
    } else if (stockAmount <= 5) {
        badge.textContent = "Low Stock";
        badge.classList.add("low-stock");
    } else {
        badge.textContent = "In Stock";
        badge.classList.add("in-stock");
    }

    return badge;
}

function formatPrice(price) {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return "0.00";
    }

    return numericPrice.toFixed(2);
}

function resetTableModifiers() {
    searchInput.value = "";
    categoryFilter.value = "All";
    sortFilter.value = "default";
}

function setStatus(message) {
    inventoryStatus.textContent = message;
}

function openModal(title, message) {
    modalTitle.textContent = title;

    modalContent.innerHTML = "";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    modalContent.appendChild(paragraph);
    itemModal.classList.add("show");
}

function closeModal() {
    itemModal.classList.remove("show");
}

searchInput.addEventListener("input", applyTableModifiers);
categoryFilter.addEventListener("change", applyTableModifiers);
sortFilter.addEventListener("change", applyTableModifiers);

refreshButton.addEventListener("click", () => {
    resetTableModifiers();
    loadInventoryItems();
});

addItemButton.addEventListener("click", () => {
    openModal(
        "Add Item",
        "The add item form will be added here later."
    );
});

deleteItemButton.addEventListener("click", () => {
    openModal(
        "Delete Item",
        "The delete item form will be added here later."
    );
});

modifyItemButton.addEventListener("click", () => {
    openModal(
        "Modify Item",
        "The modify item form will be added here later."
    );
});

closeModalButton.addEventListener("click", closeModal);

itemModal.addEventListener("click", (event) => {
    if (event.target === itemModal) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
    }
});

loadCategoryOptions();
loadInventoryItems();