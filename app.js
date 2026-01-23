// =====================
// Invoice App - App.js
// =====================

// خدمات اولیه
let services = [
  { id: 1, name: "شستشو سرسیلندر", price: 3000000, qty: 1, checked: false },
  { id: 2, name: "آب‌بندی سوپاپ", price: 7000000, qty: 1, checked: false },
  { id: 3, name: "تراش سرسیلندر", price: 5000000, qty: 1, checked: false }
];

// شماره فاکتور
let invoiceNumber = Number(localStorage.getItem("invoiceNumber")) || 1;
let history = JSON.parse(localStorage.getItem("invoiceHistory")) || [];

// =====================
// Helpers
// =====================
const formatPrice = n => n.toLocaleString("fa-IR");

const getTotal = () =>
  services.reduce(
    (sum, s) => s.checked ? sum + s.price * s.qty : sum,
    0
  );

// =====================
// Render
// =====================
function render() {
  const list = document.getElementById("services");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";

  services.forEach((s, index) => {
    const row = document.createElement("div");
    row.className = "service-row";

    row.innerHTML = `
      <div class="reorder">
        <span onclick="moveUp(${index})">▴</span>
        <span onclick="moveDown(${index})">▾</span>
      </div>

      <input type="checkbox" ${s.checked ? "checked" : ""}
        onchange="toggleService(${s.id})">

      <div class="service-name">${index + 1}- ${s.name}</div>

      <input type="number" min="1" value="${s.qty}"
        onchange="changeQty(${s.id}, this.value)">

      <div class="price">${formatPrice(s.price * s.qty)} ریال</div>
    `;

    list.appendChild(row);
  });

  totalEl.textContent = formatPrice(getTotal()) + " ریال";
}

// =====================
// Actions
// =====================
function toggleService(id) {
  const s = services.find(x => x.id === id);
  s.checked = !s.checked;
  render();
}

function changeQty(id, value) {
  const s = services.find(x => x.id === id);
  s.qty = Number(value) || 1;
  render();
}

function moveUp(i) {
  if (i === 0) return;
  [services[i - 1], services[i]] = [services[i], services[i - 1]];
  render();
}

function moveDown(i) {
  if (i === services.length - 1) return;
  [services[i + 1], services[i]] = [services[i], services[i + 1]];
  render();
}

// =====================
// Issue Invoice
// =====================
function issueInvoice() {
  if (getTotal() === 0) {
    alert("هیچ خدمتی انتخاب نشده");
    return;
  }

  const invoice = {
    number: invoiceNumber,
    date: new Date().toLocaleDateString("fa-IR"),
    items: services.filter(s => s.checked),
    total: getTotal()
  };

  history.unshift(invoice);
  localStorage.setItem("invoiceHistory", JSON.stringify(history));

  invoiceNumber++;
  localStorage.setItem("invoiceNumber", invoiceNumber);

  // ریست تیک و تعداد
  services.forEach(s => {
    s.checked = false;
    s.qty = 1;
  });

  renderHistory();
  render();
}

// =====================
// History
// =====================
function renderHistory() {
  const box = document.getElementById("history");
  box.innerHTML = "";

  history.forEach(inv => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>فاکتور #${inv.number}</div>
      <div>${inv.date}</div>
      <div>${formatPrice(inv.total)} ریال</div>
    `;

    box.appendChild(div);
  });
}

// =====================
// Init
// =====================
render();
renderHistory();
