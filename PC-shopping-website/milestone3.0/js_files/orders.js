import { supabase } from "./supabaseClient.js";

const ordersTableBody = document.getElementById("ordersTableBody");
const ordersStatus = document.getElementById("ordersStatus");

const startDateFilter = document.getElementById("startDateFilter");
const endDateFilter = document.getElementById("endDateFilter");
const sortFilter = document.getElementById("sortFilter");

const refreshButton = document.getElementById("refreshButton");

const paginationControls = document.getElementById("paginationControls");
const previousPageButton = document.getElementById("previousPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const pageInfo = document.getElementById("pageInfo");

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;

const rowsPerPage = 50;

async function loadOrders() {
    setStatus("Loading orders...");

    ordersTableBody.innerHTML = `
        <tr>
            <td colspan="5">Loading orders...</td>
        </tr>
    `;

    const { data: ordersData, error: ordersError } = await supabase
        .schema("store")
        .from("orders")
        .select("id, userid, total, date")
        .order("date", { ascending: true });

    if (ordersError) {
        console.error("Orders loading error:", ordersError);
        allOrders = [];
        filteredOrders = [];

        setStatus("Failed to load orders.");

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="5">Error: ${ordersError.message}</td>
            </tr>
        `;

        updatePagination();
        return;
    }

    const { data: usersData, error: usersError } = await supabase
        .schema("store")
        .from("user")
        .select("id, name");

    if (usersError) {
        console.error("Users loading error:", usersError);
        allOrders = [];
        filteredOrders = [];

        setStatus("Failed to load user names.");

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="5">Error: ${usersError.message}</td>
            </tr>
        `;

        updatePagination();
        return;
    }

    const userMap = createUserMap(usersData || []);

    allOrders = (ordersData || []).map((order) => {
        return {
            id: order.id,
            userid: order.userid,
            username: userMap.get(Number(order.userid)) || "Unknown User",
            total: Number(order.total) || 0,
            date: order.date
        };
    });

    applyOrderModifiers();
}

function createUserMap(users) {
    const userMap = new Map();

    users.forEach((user) => {
        userMap.set(Number(user.id), user.name);
    });

    return userMap;
}

function applyOrderModifiers() {
    currentPage = 1;

    const startDateValue = startDateFilter.value;
    const endDateValue = endDateFilter.value;

    filteredOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.date);

        if (startDateValue) {
            const startDate = new Date(`${startDateValue}T00:00:00`);

            if (orderDate < startDate) {
                return false;
            }
        }

        if (endDateValue) {
            const endDate = new Date(`${endDateValue}T23:59:59`);

            if (orderDate > endDate) {
                return false;
            }
        }

        return true;
    });

    sortOrders();
    renderCurrentPage();
}

function sortOrders() {
    const selectedSort = sortFilter.value;

    if (selectedSort === "earliest-latest") {
        filteredOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (selectedSort === "latest-earliest") {
        filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (selectedSort === "most-expensive") {
        filteredOrders.sort((a, b) => b.total - a.total);
    }

    if (selectedSort === "least-expensive") {
        filteredOrders.sort((a, b) => a.total - b.total);
    }
}

function renderCurrentPage() {
    ordersTableBody.innerHTML = "";

    if (!filteredOrders || filteredOrders.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No matching orders found.";

        row.appendChild(cell);
        ordersTableBody.appendChild(row);

        setStatus("Showing 0 orders.");
        updatePagination();
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = filteredOrders.slice(startIndex, endIndex);

    currentRows.forEach((order) => {
        const row = document.createElement("tr");

        const orderIdCell = document.createElement("td");
        orderIdCell.textContent = order.id;

        const userIdCell = document.createElement("td");
        userIdCell.textContent = order.userid;

        const userNameCell = document.createElement("td");
        userNameCell.textContent = order.username;

        const totalCell = document.createElement("td");
        totalCell.textContent = formatTotal(order.total);

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(order.date);

        row.appendChild(orderIdCell);
        row.appendChild(userIdCell);
        row.appendChild(userNameCell);
        row.appendChild(totalCell);
        row.appendChild(dateCell);

        ordersTableBody.appendChild(row);
    });

    const showingStart = startIndex + 1;
    const showingEnd = Math.min(endIndex, filteredOrders.length);

    setStatus(`Showing ${showingStart}-${showingEnd} of ${filteredOrders.length} orders.`);

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    if (totalPages <= 1) {
        paginationControls.classList.remove("show");
        return;
    }

    paginationControls.classList.add("show");

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    previousPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

function goToPreviousPage() {
    if (currentPage <= 1) {
        return;
    }

    currentPage -= 1;
    renderCurrentPage();
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    if (currentPage >= totalPages) {
        return;
    }

    currentPage += 1;
    renderCurrentPage();
}

function resetOrderModifiers() {
    startDateFilter.value = "";
    endDateFilter.value = "";
    sortFilter.value = "earliest-latest";
    currentPage = 1;
}

function formatTotal(total) {
    return Number(total).toFixed(2);
}

function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function setStatus(message) {
    ordersStatus.textContent = message;
}

startDateFilter.addEventListener("change", applyOrderModifiers);
endDateFilter.addEventListener("change", applyOrderModifiers);
sortFilter.addEventListener("change", applyOrderModifiers);

refreshButton.addEventListener("click", () => {
    resetOrderModifiers();
    loadOrders();
});

previousPageButton.addEventListener("click", goToPreviousPage);
nextPageButton.addEventListener("click", goToNextPage);

loadOrders();