import { supabase } from "./supabaseClient.js";

const ordersCountCanvas = document.getElementById("ordersCountChart");
const salesTotalCanvas = document.getElementById("salesTotalChart");
const chartStatus = document.getElementById("chartStatus");
const refreshChartsButton = document.getElementById("refreshChartsButton");

let monthlyOrdersData = [];

async function loadOrdersForCurrentMonth() {
    setChartStatus("Loading order charts...");

    const { startDate, endDate } = getCurrentMonthRange();

    const { data, error } = await supabase
        .schema("store")
        .from("orders")
        .select("id, total, date")
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: true });

    if (error) {
        console.error("Orders chart error:", error);
        setChartStatus(`Error loading orders: ${error.message}`);
        clearCanvas(ordersCountCanvas);
        clearCanvas(salesTotalCanvas);
        return;
    }

    monthlyOrdersData = data || [];

    const chartData = buildDailyChartData(monthlyOrdersData);

    drawBarChart(
        ordersCountCanvas,
        chartData.labels,
        chartData.orderCounts,
        "Orders"
    );

    drawBarChart(
        salesTotalCanvas,
        chartData.labels,
        chartData.salesTotals,
        "Sales"
    );

    const monthName = new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric"
    });

    if (monthlyOrdersData.length === 0) {
        setChartStatus(`No orders found for ${monthName}.`);
    } else {
        setChartStatus(`Showing ${monthlyOrdersData.length} orders for ${monthName}.`);
    }
}

function getCurrentMonthRange() {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
        startDate: toDatabaseTimestamp(start),
        endDate: toDatabaseTimestamp(end)
    };
}

function toDatabaseTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day} 00:00:00`;
}

function buildDailyChartData(orders) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const labels = [];
    const orderCounts = [];
    const salesTotals = [];

    for (let day = 1; day <= daysInMonth; day++) {
        labels.push(String(day));
        orderCounts.push(0);
        salesTotals.push(0);
    }

    orders.forEach((order) => {
        const orderDate = new Date(order.date);
        const dayIndex = orderDate.getDate() - 1;

        if (dayIndex >= 0 && dayIndex < daysInMonth) {
            orderCounts[dayIndex] += 1;
            salesTotals[dayIndex] += Number(order.total) || 0;
        }
    });

    return {
        labels,
        orderCounts,
        salesTotals
    };
}

function drawBarChart(canvas, labels, values, valueLabel) {
    const ctx = canvas.getContext("2d");

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    canvas.width = displayWidth * window.devicePixelRatio;
    canvas.height = displayHeight * window.devicePixelRatio;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const padding = {
        top: 25,
        right: 25,
        bottom: 45,
        left: 55
    };

    const chartWidth = displayWidth - padding.left - padding.right;
    const chartHeight = displayHeight - padding.top - padding.bottom;

    const maxValue = Math.max(...values, 1);

    drawChartBackground(ctx, displayWidth, displayHeight);
    drawYAxis(ctx, padding, chartWidth, chartHeight, maxValue, valueLabel);
    drawBars(ctx, labels, values, padding, chartWidth, chartHeight, maxValue);
    drawXAxisLabels(ctx, labels, padding, chartWidth, chartHeight);
}

function drawChartBackground(ctx, width, height) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
}

function drawYAxis(ctx, padding, chartWidth, chartHeight, maxValue, valueLabel) {
    const steps = 5;

    ctx.strokeStyle = "#d5d5d5";
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= steps; i++) {
        const value = (maxValue / steps) * i;
        const y = padding.top + chartHeight - (chartHeight / steps) * i;

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();

        ctx.fillText(formatChartNumber(value, valueLabel), padding.left - 8, y);
    }

    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
}

function drawBars(ctx, labels, values, padding, chartWidth, chartHeight, maxValue) {
    const barGap = 4;
    const barWidth = Math.max((chartWidth / labels.length) - barGap, 4);

    ctx.fillStyle = "#2f4858";

    values.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding.left + index * (chartWidth / labels.length) + barGap / 2;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);
    });
}

function drawXAxisLabels(ctx, labels, padding, chartWidth, chartHeight) {
    const labelStep = Math.ceil(labels.length / 8);

    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    labels.forEach((label, index) => {
        if (index % labelStep !== 0 && index !== labels.length - 1) {
            return;
        }

        const x = padding.left + index * (chartWidth / labels.length) + (chartWidth / labels.length) / 2;
        const y = padding.top + chartHeight + 12;

        ctx.fillText(label, x, y);
    });
}

function formatChartNumber(value, valueLabel) {
    if (valueLabel === "Sales") {
        return value.toFixed(0);
    }

    return String(Math.round(value));
}

function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
}

function setChartStatus(message) {
    chartStatus.textContent = message;
}

refreshChartsButton.addEventListener("click", loadOrdersForCurrentMonth);

window.addEventListener("resize", () => {
    const chartData = buildDailyChartData(monthlyOrdersData);

    drawBarChart(
        ordersCountCanvas,
        chartData.labels,
        chartData.orderCounts,
        "Orders"
    );

    drawBarChart(
        salesTotalCanvas,
        chartData.labels,
        chartData.salesTotals,
        "Sales"
    );
});

loadOrdersForCurrentMonth();