import { supabase } from "./supabaseClient.js";
import { Auth, AuthState } from "./auth.js";

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileAddress = document.getElementById("profileAddress");

const openEditProfileBtn = document.getElementById("openEditProfileBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

const editProfileModal = document.getElementById("editProfileModal");
const closeEditProfileBtn = document.getElementById("closeEditProfileBtn");
const cancelEditProfileBtn = document.getElementById("cancelEditProfileBtn");

const editProfileForm = document.getElementById("editProfileForm");
const editFirstName = document.getElementById("editFirstName");
const editLastName = document.getElementById("editLastName");
const editAddress = document.getElementById("editAddress");

const ordersMessage = document.getElementById("ordersMessage");
const ordersTable = document.getElementById("ordersTable");
const ordersTableBody = document.getElementById("ordersTableBody");

const orderItemsModal = document.getElementById("orderItemsModal");
const closeOrderItemsBtn = document.getElementById("closeOrderItemsBtn");
const orderItemsModalTitle = document.getElementById("orderItemsModalTitle");
const orderItemsMessage = document.getElementById("orderItemsMessage");
const orderItemsPopupList = document.getElementById("orderItemsPopupList");

const lettersOnly = /^[A-Za-z]+$/;

let handlersReady = false;

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

function validateFirstName() {
    if (!lettersOnly.test(editFirstName.value.trim())) {
        setError(editFirstName, "Only letters allowed");
        return false;
    }

    setSuccess(editFirstName);
    return true;
}

function validateLastName() {
    if (!lettersOnly.test(editLastName.value.trim())) {
        setError(editLastName, "Only letters allowed");
        return false;
    }

    setSuccess(editLastName);
    return true;
}

function validateAddress() {
    if (editAddress.value.trim() === "") {
        setError(editAddress, "Address is required");
        return false;
    }

    setSuccess(editAddress);
    return true;
}

function validateEditForm() {
    const firstValid = validateFirstName();
    const lastValid = validateLastName();
    const addressValid = validateAddress();

    return firstValid && lastValid && addressValid;
}

function getFullName(profile) {
    if (!profile) {
        return "User";
    }

    if (profile.name) {
        return profile.name;
    }

    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    return profile.email || "User";
}

function renderProfileInfo() {
    const profile = AuthState.profile;
    const authUser = AuthState.authUser;

    profileName.textContent = getFullName(profile);
    profileEmail.textContent = profile?.email || authUser?.email || "No email";
    profileAddress.textContent = profile?.address || "Not added";
}

function fillEditForm() {
    const profile = AuthState.profile;

    editFirstName.value = profile?.first_name || "";
    editLastName.value = profile?.last_name || "";
    editAddress.value = profile?.address || "";

    setSuccess(editFirstName);
    setSuccess(editLastName);

    if (editAddress.value.trim() !== "") {
        setSuccess(editAddress);
    } else {
        editAddress.classList.remove("error_input");
        editAddress.classList.remove("valid_input");
        editAddress.parentElement.querySelector("small").innerText = "";
    }
}

function openEditModal() {
    fillEditForm();
    editProfileModal.classList.add("show");
    editProfileModal.setAttribute("aria-hidden", "false");
}

function closeEditModal() {
    editProfileModal.classList.remove("show");
    editProfileModal.setAttribute("aria-hidden", "true");
}

async function saveProfileChanges(e) {
    e.preventDefault();

    if (!validateEditForm()) {
        return;
    }

    const saveBtn = editProfileForm.querySelector(".save_btn");

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const firstNameValue = editFirstName.value.trim();
    const lastNameValue = editLastName.value.trim();
    const addressValue = editAddress.value.trim();
    const fullNameValue = `${firstNameValue} ${lastNameValue}`.trim();

    const { data, error } = await supabase
        .schema("store")
        .from("user")
        .update({
            first_name: firstNameValue,
            last_name: lastNameValue,
            name: fullNameValue,
            address: addressValue,
            updated_at: new Date().toISOString()
        })
        .eq("id", AuthState.authUser.id)
        .select("id, email, first_name, last_name, name, isadmin, address, created_at, updated_at")
        .single();

    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";

    if (error) {
        alert(error.message);
        return;
    }

    AuthState.profile = data;

    renderProfileInfo();
    closeEditModal();
}

async function loadOrders() {
    ordersTable.style.display = "none";
    ordersTableBody.innerHTML = "";
    ordersMessage.style.display = "block";
    ordersMessage.textContent = "Loading orders...";

    const { data, error } = await supabase
        .schema("store")
        .from("orders")
        .select("id, total, date")
        .eq("userid", AuthState.authUser.id)
        .order("date", { ascending: false });

    if (error) {
        ordersMessage.textContent = "Could not load orders.";
        console.error("Orders load error:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        ordersMessage.textContent = "You do not have any orders yet.";
        return;
    }

    ordersMessage.style.display = "none";
    ordersTable.style.display = "table";

    data.forEach(function (order) {
        const row = document.createElement("tr");
        const date = order.date ? new Date(order.date).toLocaleString() : "Unknown date";

        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${Number(order.total).toFixed(2)} SAR</td>
            <td>${date}</td>
            <td>
                <button type="button" class="order_items_btn" data-order-id="${order.id}">
                    View Items
                </button>
            </td>
        `;

        ordersTableBody.appendChild(row);
    });

    setupOrderItemsButtons();
}

function setupOrderItemsButtons() {
    const buttons = document.querySelectorAll(".order_items_btn");

    buttons.forEach(function (button) {
        button.addEventListener("click", async function () {
            const orderId = button.dataset.orderId;
            await openOrderItemsModal(orderId);
        });
    });
}

async function openOrderItemsModal(orderId) {
    orderItemsModalTitle.textContent = `Order #${orderId} Items`;
    orderItemsMessage.style.display = "block";
    orderItemsMessage.textContent = "Loading items...";
    orderItemsPopupList.innerHTML = "";

    orderItemsModal.classList.add("show");
    orderItemsModal.setAttribute("aria-hidden", "false");

    const { data: orderedItems, error: orderedItemsError } = await supabase
        .schema("store")
        .from("ordereditems")
        .select("itemid, quantity, price_at_time")
        .eq("orderid", orderId);

    if (orderedItemsError) {
        console.error("Ordered items error:", orderedItemsError.message);
        orderItemsMessage.textContent = "Could not load ordered items.";
        return;
    }

    if (!orderedItems || orderedItems.length === 0) {
        orderItemsMessage.textContent = "No items found for this order.";
        return;
    }

    const itemIds = orderedItems.map(function (orderedItem) {
        return orderedItem.itemid;
    });

    const { data: products, error: productsError } = await supabase
        .schema("store")
        .from("items")
        .select("id, name, category, price")
        .in("id", itemIds);

    if (productsError) {
        console.error("Products error:", productsError.message);
        orderItemsMessage.textContent = "Could not load product details.";
        return;
    }

    const productsById = {};

    products.forEach(function (product) {
        productsById[product.id] = product;
    });

    orderItemsMessage.style.display = "none";

    orderedItems.forEach(function (orderedItem) {
        const product = productsById[orderedItem.itemid];

        const title = product?.name || "Unknown Product";
        const category = product?.category || "N/A";
        const quantity = Number(orderedItem.quantity || 1);
        const unitPrice = Number(orderedItem.price_at_time || product?.price || 0);
        const subtotal = unitPrice * quantity;

        const itemElement = document.createElement("div");
        itemElement.className = "order_popup_item";

        itemElement.innerHTML = `
            <h3>${escapeHTML(title)}</h3>
            <p><strong>Category:</strong> ${escapeHTML(category)}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Unit Price:</strong> ${unitPrice.toFixed(2)} SAR</p>
            <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} SAR</p>
        `;

        orderItemsPopupList.appendChild(itemElement);
    });
}

function closeOrderItemsModal() {
    orderItemsModal.classList.remove("show");
    orderItemsModal.setAttribute("aria-hidden", "true");
}

async function deleteAccount() {
    const firstConfirm = confirm("Are you sure you want to delete your account? This cannot be undone.");

    if (!firstConfirm) {
        return;
    }

    const secondConfirm = prompt("Type DELETE to confirm account deletion.");

    if (secondConfirm !== "DELETE") {
        return;
    }

    deleteAccountBtn.disabled = true;
    deleteAccountBtn.textContent = "Deleting...";

    const { error } = await supabase
        .schema("store")
        .rpc("delete_my_account");

    if (error) {
        alert("Could not delete account: " + error.message);
        deleteAccountBtn.disabled = false;
        deleteAccountBtn.textContent = "Delete My Account";
        return;
    }

    await supabase.auth.signOut();
    window.location.href = "home.html";
}

function setupHandlers() {
    if (handlersReady) {
        return;
    }

    handlersReady = true;

    openEditProfileBtn.addEventListener("click", openEditModal);
    closeEditProfileBtn.addEventListener("click", closeEditModal);
    cancelEditProfileBtn.addEventListener("click", closeEditModal);

    editProfileModal.addEventListener("click", function (event) {
        if (event.target === editProfileModal) {
            closeEditModal();
        }
    });

    closeOrderItemsBtn.addEventListener("click", closeOrderItemsModal);

    orderItemsModal.addEventListener("click", function (event) {
        if (event.target === orderItemsModal) {
            closeOrderItemsModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeEditModal();
            closeOrderItemsModal();
        }
    });

    editFirstName.addEventListener("input", validateFirstName);
    editLastName.addEventListener("input", validateLastName);
    editAddress.addEventListener("input", validateAddress);

    editProfileForm.addEventListener("submit", saveProfileChanges);

    deleteAccountBtn.addEventListener("click", deleteAccount);
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

Auth.onReady(async function () {
    if (!AuthState.isLoggedIn) {
        return;
    }

    setupHandlers();
    renderProfileInfo();
    await loadOrders();
});