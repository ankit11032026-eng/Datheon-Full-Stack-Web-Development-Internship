// ---------- Config & state ----------
const API_URL = "https://fakestoreapi.com/products";
const CART_KEY = "shopwave.cart.v1";
const TAX_RATE = 0.08, SHIPPING_FEE = 5.99, FREE_SHIPPING_OVER = 100, MAX_QTY = 10;

let products = [];   // from FakeStoreAPI
let cart = [];       // [{ id, title, price, image, qty }]
let category = "all", query = "", sort = "featured";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

// FakeStoreAPI spells jewelry as "jewelery" and has men's + women's clothing
const CATEGORY_TEST = {
  all: () => true,
  electronics: (p) => p.category === "electronics",
  jewelry: (p) => p.category === "jewelery",
  clothing: (p) => p.category.includes("clothing")
};

// ---------- Cart persistence ----------
function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { console.warn(e); } }
function loadCart() {
  try { const d = JSON.parse(localStorage.getItem(CART_KEY)); cart = Array.isArray(d) ? d : []; } catch (e) { cart = []; }
}

// ---------- Cart actions ----------
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) { item.qty = Math.min(MAX_QTY, item.qty + 1); }
  else {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
  }
  saveCart(); renderCart(true);
}
function removeFromCart(id) { cart = cart.filter((i) => i.id !== id); saveCart(); renderCart(); }
function updateQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  const qty = item.qty + delta;
  if (qty <= 0) return removeFromCart(id);
  item.qty = Math.min(MAX_QTY, qty);
  saveCart(); renderCart();
}
function calculateTotal() {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}

// ---------- Products ----------
function badgeFor(p) {
  if (p.rating.rate >= 4.5) return "Top rated";
  if (p.rating.count >= 400) return "Popular";
  if (p.price < 20) return "Great value";
  return "";
}
function visibleProducts() {
  const q = query.trim().toLowerCase();
  const list = products.filter((p) => CATEGORY_TEST[category](p) && (!q || p.title.toLowerCase().includes(q)));
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating.rate - a.rating.rate);
  return list;
}
function renderProducts() {
  const list = visibleProducts();
  $("count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
  $("grid").innerHTML = list.map((p) => {
    const b = badgeFor(p);
    return `<article class="card">
      <div class="thumb">${b ? `<span class="pbadge">${b}</span>` : ""}<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div>
      <div class="info">
        <span class="cat-name">${esc(p.category)}</span>
        <h3 class="title" title="${esc(p.title)}">${esc(p.title)}</h3>
        <div class="rating"><span class="stars" aria-hidden="true">${stars(p.rating.rate)}</span> ${p.rating.rate} (${p.rating.count})</div>
        <div class="price-row"><span class="price">${money(p.price)}</span>
          <button class="btn small" data-add="${p.id}" aria-label="Add ${esc(p.title)} to cart">Add to cart</button></div>
      </div></article>`;
  }).join("");
  const state = $("state");
  state.hidden = list.length > 0 || !products.length;
  if (!state.hidden) state.textContent = "No products match your search.";
}
function showSkeletons() {
  $("state").hidden = true; $("count").textContent = "Loading products...";
  $("grid").innerHTML = '<div class="skeleton"></div>'.repeat(8);
}
async function loadProducts() {
  showSkeletons();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error(err);
    $("grid").innerHTML = ""; $("count").textContent = "";
    const s = $("state"); s.hidden = false;
    s.innerHTML = '<p>We could not load products. Check your connection and try again.</p><button class="btn" id="retry">Retry</button>';
    $("retry").addEventListener("click", loadProducts);
  }
}

// ---------- Cart UI ----------
function renderCart(bump = false) {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const badge = $("badge");
  badge.textContent = count;
  $("cartBtn").setAttribute("aria-label", `Open cart, ${count} item${count === 1 ? "" : "s"}`);
  if (bump) { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }

  $("cartItems").innerHTML = cart.length ? cart.map((i) => `
    <div class="line">
      <img src="${esc(i.image)}" alt="">
      <div>
        <div class="t">${esc(i.title)}</div>
        <div class="p">${money(i.price)} each</div>
        <div class="ctrl">
          <button class="q" data-dec="${i.id}" aria-label="Decrease quantity of ${esc(i.title)}">−</button>
          <span class="qn" aria-live="polite">${i.qty}</span>
          <button class="q" data-inc="${i.id}" aria-label="Increase quantity of ${esc(i.title)}">+</button>
          <span class="lt">${money(i.price * i.qty)}</span>
          <button class="rm" data-rm="${i.id}">Remove</button>
        </div>
      </div>
    </div>`).join("") : '<p class="empty">Your cart is empty.<br>Add something you like.</p>';

  const t = calculateTotal();
  $("cartFoot").hidden = cart.length === 0;
  $("subtotal").textContent = money(t.subtotal);
  $("tax").textContent = money(t.tax);
  $("shipping").textContent = t.shipping === 0 ? "Free" : money(t.shipping);
  $("total").textContent = money(t.total);
  const note = $("shipNote");
  const need = FREE_SHIPPING_OVER - t.subtotal;
  note.classList.toggle("ok", need <= 0);
  note.textContent = need <= 0 ? "You get free shipping!" : `Add ${money(need)} more for free shipping.`;
}

// ---------- Drawer open/close ----------
const drawer = $("drawer"), overlay = $("overlay");
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  overlay.hidden = false; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock"); $("closeCart").focus();
}
function closeCart() {
  overlay.hidden = true; drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock"); if (lastFocus) lastFocus.focus();
}
$("cartBtn").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

// ---------- Event delegation ----------
$("grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-add]");
  if (b) addToCart(Number(b.dataset.add));
});
$("cartItems").addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rm = e.target.closest("[data-rm]");
  if (inc) updateQuantity(Number(inc.dataset.inc), 1);
  if (dec) updateQuantity(Number(dec.dataset.dec), -1);
  if (rm) removeFromCart(Number(rm.dataset.rm));
});
$("clearBtn").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });

$("cats").addEventListener("click", (e) => {
  const b = e.target.closest(".cat"); if (!b) return;
  category = b.dataset.cat;
  document.querySelectorAll(".cat").forEach((x) => { const on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", on); });
  renderProducts();
});
$("search").addEventListener("input", (e) => { query = e.target.value; renderProducts(); });
$("sort").addEventListener("change", (e) => { sort = e.target.value; renderProducts(); });

// ---------- Simulated checkout ----------
const co = $("checkout");
$("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  $("coTotal").textContent = money(calculateTotal().total);
  $("coForm").hidden = false; $("coDone").hidden = true; $("coForm").reset();
  co.showModal();
});
$("coCancel").addEventListener("click", () => co.close());
$("coClose").addEventListener("click", () => co.close());
$("coForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("doneName").textContent = $("coName").value.trim();
  $("doneMail").textContent = `A confirmation was sent to ${$("coEmail").value.trim()} (simulated).`;
  $("orderId").textContent = "#SW-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  cart = []; saveCart(); renderCart(); closeCart();
  $("coForm").hidden = true; $("coDone").hidden = false;
});

// ---------- Theme ----------
const root = document.documentElement, themeBtn = $("themeBtn");
function applyTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "☀" : "☾";
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("shopwave.theme"); } catch (e) {}
applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("shopwave.theme", next); } catch (e) {}
});

// ---------- Init ----------
loadCart();
renderCart();
loadProducts();
