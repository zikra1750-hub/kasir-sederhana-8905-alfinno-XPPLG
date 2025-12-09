const state = { items: [], discountPercent: 0, applyTax: false, receiptId: null };

const el = {
  itemForm: document.getElementById("itemForm"),
  itemName: document.getElementById("itemName"),
  itemPrice: document.getElementById("itemPrice"),
  itemQty: document.getElementById("itemQty"),
  cartBody: document.getElementById("cartBody"),
  discountPercent: document.getElementById("discountPercent"),
  applyTax: document.getElementById("applyTax"),
  grossTotal: document.getElementById("grossTotal"),
  discountAmount: document.getElementById("discountAmount"),
  taxAmount: document.getElementById("taxAmount"),
  netTotal: document.getElementById("netTotal"),
  saveBtn: document.getElementById("saveTransaction"),
  loadLast: document.getElementById("loadLast"),
  newTransaction: document.getElementById("newTransaction"),
  toggleTheme: document.getElementById("toggleTheme"),
  printReceipt: document.getElementById("printReceipt"),
  resetTotal: document.getElementById("resetTotal"),
  receiptDate: document.getElementById("receiptDate"),
  receiptId: document.getElementById("receiptId"),
  receiptBody: document.getElementById("receiptBody"),
  rNet: document.getElementById("rNet")
};

function formatIDR(n) { return "Rp " + Number(n || 0).toLocaleString("id-ID"); }
function makeId() { return "TRX-" + Date.now(); }

function render() {
  el.cartBody.innerHTML = "";
  let gross = 0;
  state.items.forEach((it, i) => {
    const sub = it.price * it.qty; gross += sub;
    el.cartBody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${it.name}</td>
        <td>${formatIDR(it.price)}</td>
        <td>${it.qty}</td>
        <td>${formatIDR(sub)}</td>
        <td><button class="btn btn-danger btn-sm" data-id="${it.id}">Hapus</button></td>
      </tr>`;
  });

  const discAmt = gross * state.discountPercent / 100;
  const base = gross - discAmt;
  const tax = state.applyTax ? base * 0.11 : 0;
  const net = base + tax;

  el.grossTotal.textContent = formatIDR(gross);
  el.discountAmount.textContent = formatIDR(discAmt);
  el.taxAmount.textContent = formatIDR(tax);
  el.netTotal.textContent = formatIDR(net);

  // Struk
  el.receiptBody.innerHTML = "";
  state.items.forEach(it => {
    el.receiptBody.innerHTML += `
      <tr>
        <td>${it.name}</td>
        <td>${it.qty}</td>
        <td>${formatIDR(it.price)}</td>
        <td>${formatIDR(it.price * it.qty)}</td>
      </tr>`;
  });
  el.receiptDate.textContent = new Date().toLocaleString("id-ID");
  el.receiptId.textContent = "ID: " + (state.receiptId || makeId());
  el.rNet.textContent = formatIDR(net);
}

// Tambah item
el.itemForm.addEventListener("submit", e => {
  e.preventDefault();
  state.items.push({
    id: makeId(),
    name: el.itemName.value,
    price: Number(el.itemPrice.value),
    qty: Number(el.itemQty.value)
  });
  el.itemForm.reset();
  el.itemQty.value = 1;
  render();
});

// Hapus item (delegasi)
el.cartBody.addEventListener("click", e => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  state.items = state.items.filter(it => it.id !== id);
  render();
});

// Reset
el.resetTotal.addEventListener("click", () => {
  state.items = [];
  state.discountPercent = 0;
  state.applyTax = false;
  el.discountPercent.value = 0;
  el.applyTax.checked = false;
  render();
});

// Diskon & Pajak
el.discountPercent.addEventListener("input", () => {
  state.discountPercent = Number(el.discountPercent.value || 0);
  render();
});
el.applyTax.addEventListener("change", () => {
  state.applyTax = el.applyTax.checked;
  render();
});

// Simpan / Muat / Baru
el.saveBtn.addEventListener("click", () => {
  localStorage.setItem("kasir_last", JSON.stringify(state));
  alert("Transaksi disimpan.");
});
el.loadLast.addEventListener("click", () => {
  const raw = localStorage.getItem("kasir_last");
  if (!raw) { alert("Belum ada transaksi tersimpan."); return; }
  const data = JSON.parse(raw);
  state.items = data.items || [];
  state.discountPercent = data.discountPercent || 0;
  state.applyTax = !!data.applyTax;
  state.receiptId = data.receiptId || null;
  el.discountPercent.value = state.discountPercent;
  el.applyTax.checked = state.applyTax;
  render();
});
el.newTransaction.addEventListener("click", () => {
  state.items = [];
  state.discountPercent = 0;
  state.applyTax = false;
  state.receiptId = null;
  el.discountPercent.value = 0;
  el.applyTax.checked = false;
  render();
});

// Print
el.printReceipt.addEventListener("click", () => {
  render();
  window.print();
});

// Tema
(function initTheme() {
  const saved = localStorage.getItem("kasir_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();
el.toggleTheme.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("kasir_theme", next);
});

// Render awal
render();