import { supabase } from "./supabaseClient.js";

const BUCKET_NAME = "items_images";

const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventoryStatus = document.getElementById("inventoryStatus");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

const refreshButton = document.getElementById("refreshButton");
const addItemButton = document.getElementById("addItemButton");
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

function getFormCategoryOptions(selectedCategory = "") {
    return categories
        .filter((category) => category !== "All")
        .map((category) => {
            const selected = category === selectedCategory ? "selected" : "";
            return `<option value="${category}" ${selected}>${category}</option>`;
        })
        .join("");
}

async function loadInventoryItems() {
    setStatus("Loading inventory...");

    inventoryTableBody.innerHTML = `
        <tr>
            <td colspan="7">Loading inventory...</td>
        </tr>
    `;

    const { data, error } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, storedunits, category, price, image")
        .order("id", { ascending: true });

    if (error) {
        console.error("Supabase error:", error);

        inventoryItems = [];
        displayedItems = [];

        setStatus("Failed to load inventory.");

        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="7">Error: ${error.message}</td>
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

        cell.colSpan = 7;
        cell.textContent = "No matching inventory items found.";

        row.appendChild(cell);
        inventoryTableBody.appendChild(row);

        setStatus("Showing 0 items.");
        return;
    }

    items.forEach((item) => {
        const row = document.createElement("tr");

        const imageCell = document.createElement("td");
        imageCell.appendChild(createImageElement(item.image, item.name));

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

        row.appendChild(imageCell);
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

function createImageElement(imagePath, itemName) {
    if (!imagePath) {
        const span = document.createElement("span");
        span.textContent = "No image";
        span.classList.add("no-image-text");
        return span;
    }

    const img = document.createElement("img");
    img.src = getPublicImageUrl(imagePath);
    img.alt = `${itemName || "Item"} image`;
    img.classList.add("item-thumbnail");

    return img;
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

function getPublicImageUrl(imagePath) {
    if (!imagePath) {
        return "";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(imagePath);

    return data.publicUrl;
}

function resetTableModifiers() {
    searchInput.value = "";
    categoryFilter.value = "All";
    sortFilter.value = "default";
}

function setStatus(message) {
    inventoryStatus.textContent = message;
}

function openModal(title) {
    modalTitle.textContent = title;
    modalContent.innerHTML = "";
    itemModal.classList.add("show");
}

function closeModal() {
    itemModal.classList.remove("show");
    modalContent.innerHTML = "";
}

function setModalMessage(message, type = "error") {
    const messageBox = document.getElementById("modalMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.className = `modal-message ${type}`;
}

function validateItemValues(name, category, storedUnits, price) {
    if (!name.trim()) {
        return "Item name is required.";
    }

    if (!category.trim()) {
        return "Category is required.";
    }

    if (Number.isNaN(Number(storedUnits)) || Number(storedUnits) < 0) {
        return "Stored units must be 0 or more.";
    }

    if (!Number.isInteger(Number(storedUnits))) {
        return "Stored units must be a whole number.";
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
        return "Price must be 0 or more.";
    }

    return "";
}

function cleanFileName(fileName) {
    return fileName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.\-_]/g, "");
}

async function uploadItemImage(file, itemName) {
    const cleanedName = cleanFileName(file.name);
    const cleanedItemName = cleanFileName(itemName).replace(/\.[^/.]+$/, "");
    const filePath = `items/${Date.now()}-${cleanedItemName}-${cleanedName}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        throw error;
    }

    return data.path;
}

async function removeStoredImage(imagePath) {
    if (!imagePath || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return;
    }

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([imagePath]);

    if (error) {
        console.warn("Image file was not removed from storage:", error.message);
    }
}

/* Add item */

function openAddItemModal() {
    openModal("Add Item");

    modalContent.innerHTML = `
        <form class="modal-form" id="addItemForm">

            <div class="form-row">
                <label for="addItemName">Name</label>
                <input type="text" id="addItemName" required>
            </div>

            <div class="form-row">
                <label for="addItemCategory">Category</label>
                <select id="addItemCategory" required>
                    ${getFormCategoryOptions()}
                </select>
            </div>

            <div class="form-row">
                <label for="addItemStoredUnits">Stored Units</label>
                <input type="number" id="addItemStoredUnits" min="0" step="1" required>
            </div>

            <div class="form-row">
                <label for="addItemPrice">Price</label>
                <input type="number" id="addItemPrice" min="0" step="0.01" required>
            </div>

            <div class="form-row">
                <label for="addItemImage">Picture</label>
                <input type="file" id="addItemImage" accept="image/*" required>
            </div>

            <div class="form-actions">
                <button type="submit" class="form-button save-form-button" id="saveAddItemButton">Add Item</button>
                <button type="button" class="form-button cancel-form-button" id="cancelAddItemButton">Cancel</button>
            </div>

            <div class="modal-message" id="modalMessage"></div>

        </form>
    `;

    document.getElementById("addItemForm").addEventListener("submit", handleAddItemSubmit);
    document.getElementById("cancelAddItemButton").addEventListener("click", closeModal);
}

async function handleAddItemSubmit(event) {
    event.preventDefault();

    const saveButton = document.getElementById("saveAddItemButton");

    const name = document.getElementById("addItemName").value.trim();
    const category = document.getElementById("addItemCategory").value;
    const storedUnits = document.getElementById("addItemStoredUnits").value;
    const price = document.getElementById("addItemPrice").value;
    const imageFile = document.getElementById("addItemImage").files[0];

    const validationError = validateItemValues(name, category, storedUnits, price);

    if (validationError) {
        setModalMessage(validationError, "error");
        return;
    }

    if (!imageFile) {
        setModalMessage("Picture is required.", "error");
        return;
    }

    try {
        saveButton.disabled = true;
        setModalMessage("Uploading image and adding item...", "success");

        const imagePath = await uploadItemImage(imageFile, name);

        const { error } = await supabase
            .schema("store")
            .from("items")
            .insert({
                name: name,
                category: category,
                storedunits: Number(storedUnits),
                price: Number(price),
                image: imagePath
            });

        if (error) {
            await removeStoredImage(imagePath);
            throw error;
        }

        setModalMessage("Item added successfully.", "success");

        await loadInventoryItems();

        setTimeout(() => {
            closeModal();
        }, 600);

    } catch (error) {
        console.error("Add item error:", error);
        setModalMessage(`Error: ${error.message}`, "error");
        saveButton.disabled = false;
    }
}

/* Modify item */

function openModifyItemModal() {
    openModal("Modify Item");

    modalContent.innerHTML = `
        <form class="modal-form" id="loadItemForm">

            <div class="form-row">
                <label for="modifyItemId">Item ID</label>
                <input type="number" id="modifyItemId" min="1" step="1" required>
            </div>

            <div class="form-actions">
                <button type="submit" class="form-button load-form-button">Load Item</button>
                <button type="button" class="form-button cancel-form-button" id="cancelModifyItemButton">Cancel</button>
            </div>

            <div class="modal-message" id="modalMessage"></div>

        </form>

        <div id="modifyItemFormContainer"></div>
    `;

    document.getElementById("loadItemForm").addEventListener("submit", handleLoadItemForModify);
    document.getElementById("cancelModifyItemButton").addEventListener("click", closeModal);
}

function handleLoadItemForModify(event) {
    event.preventDefault();

    const itemId = Number(document.getElementById("modifyItemId").value);

    if (!Number.isInteger(itemId) || itemId <= 0) {
        setModalMessage("Enter a valid item ID.", "error");
        return;
    }

    const item = inventoryItems.find((currentItem) => Number(currentItem.id) === itemId);

    if (!item) {
        setModalMessage("No item found with this ID.", "error");
        return;
    }

    renderModifyForm(item);
}

function renderModifyForm(item) {
    const modifyItemFormContainer = document.getElementById("modifyItemFormContainer");

    const currentImageHTML = item.image
        ? `
            <div class="current-image-box">
                <img src="${getPublicImageUrl(item.image)}" alt="${item.name} image">
                <span>Current image</span>
            </div>
        `
        : `
            <div class="current-image-box">
                <span>No current image</span>
            </div>
        `;

    modifyItemFormContainer.innerHTML = `
        <form class="modal-form" id="modifyItemForm">

            <hr>

            ${currentImageHTML}

            <div class="form-row">
                <label for="editItemName">Name</label>
                <input type="text" id="editItemName" value="${escapeHTML(item.name)}" required>
            </div>

            <div class="form-row">
                <label for="editItemCategory">Category</label>
                <select id="editItemCategory" required>
                    ${getFormCategoryOptions(item.category)}
                </select>
            </div>

            <div class="form-row">
                <label for="editItemStoredUnits">Stored Units</label>
                <input type="number" id="editItemStoredUnits" min="0" step="1" value="${item.storedunits}" required>
            </div>

            <div class="form-row">
                <label for="editItemPrice">Price</label>
                <input type="number" id="editItemPrice" min="0" step="0.01" value="${item.price}" required>
            </div>

            <div class="form-row">
                <label for="editItemImage">New Picture Optional</label>
                <input type="file" id="editItemImage" accept="image/*">
            </div>

            <div class="form-actions">
                <button type="submit" class="form-button save-form-button" id="saveModifyItemButton">Save Changes</button>
                <button type="button" class="form-button delete-form-button" id="deleteModifyItemButton">Delete Item</button>
                <button type="button" class="form-button cancel-form-button" id="cancelEditItemButton">Cancel</button>
            </div>

            <div class="modal-message" id="editModalMessage"></div>

        </form>
    `;

    document.getElementById("modifyItemForm").addEventListener("submit", (event) => {
        handleModifyItemSubmit(event, item);
    });

    document.getElementById("deleteModifyItemButton").addEventListener("click", () => {
        handleDeleteItem(item);
    });

    document.getElementById("cancelEditItemButton").addEventListener("click", closeModal);
}

async function handleModifyItemSubmit(event, oldItem) {
    event.preventDefault();

    const saveButton = document.getElementById("saveModifyItemButton");

    const name = document.getElementById("editItemName").value.trim();
    const category = document.getElementById("editItemCategory").value;
    const storedUnits = document.getElementById("editItemStoredUnits").value;
    const price = document.getElementById("editItemPrice").value;
    const imageFile = document.getElementById("editItemImage").files[0];

    const validationError = validateItemValues(name, category, storedUnits, price);

    if (validationError) {
        setEditModalMessage(validationError, "error");
        return;
    }

    let newImagePath = oldItem.image;

    try {
        saveButton.disabled = true;
        setEditModalMessage("Saving item changes...", "success");

        if (imageFile) {
            newImagePath = await uploadItemImage(imageFile, name);
        }

        const { error } = await supabase
            .schema("store")
            .from("items")
            .update({
                name: name,
                category: category,
                storedunits: Number(storedUnits),
                price: Number(price),
                image: newImagePath
            })
            .eq("id", oldItem.id);

        if (error) {
            if (imageFile) {
                await removeStoredImage(newImagePath);
            }

            throw error;
        }

        if (imageFile && oldItem.image) {
            await removeStoredImage(oldItem.image);
        }

        setEditModalMessage("Item updated successfully.", "success");

        await loadInventoryItems();

        setTimeout(() => {
            closeModal();
        }, 600);

    } catch (error) {
        console.error("Modify item error:", error);
        setEditModalMessage(`Error: ${error.message}`, "error");
        saveButton.disabled = false;
    }
}

async function handleDeleteItem(item) {
    const confirmed = confirm(`Delete item ID ${item.id}: ${item.name}?`);

    if (!confirmed) {
        return;
    }

    const deleteButton = document.getElementById("deleteModifyItemButton");

    try {
        deleteButton.disabled = true;
        setEditModalMessage("Deleting item...", "success");

        const { error } = await supabase
            .schema("store")
            .from("items")
            .delete()
            .eq("id", item.id);

        if (error) {
            throw error;
        }

        if (item.image) {
            await removeStoredImage(item.image);
        }

        setEditModalMessage("Item deleted successfully.", "success");

        await loadInventoryItems();

        setTimeout(() => {
            closeModal();
        }, 600);

    } catch (error) {
        console.error("Delete item error:", error);
        setEditModalMessage(`Error: ${error.message}`, "error");
        deleteButton.disabled = false;
    }
}

function setEditModalMessage(message, type = "error") {
    const messageBox = document.getElementById("editModalMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.className = `modal-message ${type}`;
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* Event listeners */

searchInput.addEventListener("input", applyTableModifiers);
categoryFilter.addEventListener("change", applyTableModifiers);
sortFilter.addEventListener("change", applyTableModifiers);

refreshButton.addEventListener("click", () => {
    resetTableModifiers();
    loadInventoryItems();
});

addItemButton.addEventListener("click", openAddItemModal);
modifyItemButton.addEventListener("click", openModifyItemModal);

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