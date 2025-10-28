/* script.js for Pizza menu
   - Handles add to cart (size + qty)
   - Cart preview, remove items
   - Checkout -> WhatsApp (to +91 8384826808)
   - Persists cart in localStorage (optional)
*/

const WA_NUMBER = "918384826808"; // WhatsApp number with country code (no +)
let cart = JSON.parse(localStorage.getItem("cart_v1") || "[]");

// Elements
const cartBtn = document.getElementById("cart-btn");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartTotal2El = document.getElementById("cart-total-2");
const cartPreview = document.getElementById("cart-preview");
const cartItemsEl = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkout-btn");

// Helpers
function getTableFromURL(){
  try {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('table');
    if(t && /^\d+$/.test(t)) return t;
  } catch(e){}
  return null;
}

function saveCart(){
  localStorage.setItem("cart_v1", JSON.stringify(cart));
}

function calcTotals(){
  let total = 0;
  cart.forEach(it => total += it.price * it.qty);
  return total;
}

function renderCart(){
  // update count & totals in header
  cartCountEl.textContent = cart.length;
  const total = calcTotals();
  cartTotalEl.textContent = total;
  cartTotal2El.textContent = total;

  // build preview list
  cartItemsEl.innerHTML = "";
  if(cart.length === 0){
    const li = document.createElement("li");
    li.textContent = "Your order is empty.";
    li.style.padding = "8px 0";
    cartItemsEl.appendChild(li);
    return;
  }

  cart.forEach((it, idx) => {
    const li = document.createElement("li");
    // left meta
    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("div");
    name.textContent = `${it.name} (${it.size})`;
    const small = document.createElement("small");
    small.textContent = `${it.qty} × ₹${it.price}  = ₹${it.price * it.qty}`;
    meta.appendChild(name);
    meta.appendChild(small);

    // remove button
    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.flexDirection = "column";
    right.style.alignItems = "flex-end";
    right.style.gap = "6px";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.index = idx;
    removeBtn.style.background = "transparent";
    removeBtn.style.border = "none";
    removeBtn.style.color = "#d84315";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontWeight = "700";

    right.appendChild(removeBtn);

    li.appendChild(meta);
    li.appendChild(right);
    cartItemsEl.appendChild(li);
  });
}

// Add item to cart
function addToCart(name, sizeLabel, price, qty){
  // If same item+size already exists => increase qty
  const existing = cart.find(it => it.name === name && it.size === sizeLabel && it.price === price);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({ name, size: sizeLabel, price, qty });
  }
  saveCart();
  renderCart();
}

// Remove item by index
function removeFromCart(index){
  if(index >= 0 && index < cart.length){
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }
}

// Build WhatsApp message and open chat
function checkoutToWhatsApp(){
  if(cart.length === 0){
    alert("Your order is empty!");
    return;
  }

  const table = getTableFromURL();
  let message = `Hello! I would like to place an order${table ? " for Table " + table : ""}.\n\nOrder details:\n`;
  let total = 0;
  cart.forEach((it, i) => {
    message += `${i+1}. ${it.name} — ${it.size} × ${it.qty} = ₹${it.price * it.qty}\n`;
    total += it.price * it.qty;
  });
  message += `\nTotal: ₹${total}`;
  if(table) message += `\nTable: ${table}`;

  const encoded = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
  window.open(waUrl, "_blank");
}

// Wire up "Select" buttons
function initAddButtons(){
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemName = btn.dataset.name || btn.getAttribute("data-name") || btn.closest(".menu-item")?.querySelector(".item-name")?.textContent?.trim();
      const parent = btn.closest(".item-right") || btn.closest(".menu-item");
      if(!parent) return;

      const select = parent.querySelector(".size-select");
      const qtyInput = parent.querySelector(".qty-input");
      if(!select || !qtyInput){
        alert("Size or quantity control missing.");
        return;
      }

      const val = select.value;
      if(!val){
        alert("Please choose a size.");
        return;
      }
      const price = Number(val);
      const sizeLabel = select.options[select.selectedIndex]?.getAttribute("data-size") || select.options[select.selectedIndex]?.text || "";
      let qty = Number(qtyInput.value) || 1;
      if(qty <= 0) { alert("Enter a valid quantity."); return; }

      addToCart(itemName, sizeLabel, price, qty);
      // small feedback
      btn.textContent = "Added ✓";
      setTimeout(()=> btn.textContent = "Select", 900);
    });
  });
}

// Cart button toggle
cartBtn.addEventListener("click", (e) => {
  const expanded = cartBtn.getAttribute("aria-expanded") === "true";
  if(expanded){
    cartPreview.hidden = true;
    cartBtn.setAttribute("aria-expanded", "false");
  } else {
    renderCart();
    cartPreview.hidden = false;
    cartBtn.setAttribute("aria-expanded", "true");
  }
});

// Delegate remove button clicks
cartItemsEl.addEventListener("click", (e) => {
  const rem = e.target.closest(".remove-btn");
  if(!rem) return;
  const idx = Number(rem.dataset.index);
  removeFromCart(idx);
});

// Checkout
checkoutBtn.addEventListener("click", () => {
  checkoutToWhatsApp();
});

// Close preview when clicking outside
document.addEventListener("click", (e) => {
  if(!cartPreview) return;
  const inside = e.target.closest(".cart-area");
  if(!inside && !cartPreview.hidden){
    cartPreview.hidden = true;
    cartBtn.setAttribute("aria-expanded", "false");
  }
});

// Smooth scroll for index links
document.querySelectorAll(".menu-index a").forEach(a => {
  a.addEventListener("click", (ev) => {
    ev.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // 🧹 Clear cart whenever page is loaded (new QR scan)
  cart = [];
  saveCart();
  
  initAddButtons();
  renderCart();
});
