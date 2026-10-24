# ShopWave | E-Commerce Product Catalog & Shopping Cart

A modern online store front-end. Products are fetched live from [FakeStoreAPI](https://fakestoreapi.com/), and the cart is a slide-out drawer that survives page reloads. Built with plain HTML, CSS and JavaScript (ES6+).

## Features

- Product catalog from `https://fakestoreapi.com/products`, shown in a responsive CSS Grid
- Product cards with image, category, star rating and review count, price and badges (Top rated, Popular, Great value)
- Category filters: All, Electronics, Jewelry, Clothing
- Search by product name and sort by price or rating
- Slide-out cart drawer with a live item-count badge in the navbar
- Quantity increment / decrement (1 to 10), remove item, clear cart
- Subtotal, 8% tax and shipping calculation (flat $5.99, free over $100) with a free-shipping hint
- Cart saved in `localStorage`, so it persists after refresh
- Simulated checkout modal with an order confirmation (no real payment)
- Loading skeletons, error state with Retry button, dark / light theme
- Accessible: keyboard support, Esc closes the drawer, ARIA labels, reduced-motion support

## Project structure

```
task-4-ecommerce-cart/
├── index.html   # Markup: navbar, filters, product grid, cart drawer, checkout modal
├── style.css    # Styling, grid, drawer animation, themes
├── script.js    # Fetching, state, cart logic, rendering, checkout
└── README.md
```

## Cart logic

| Function | What it does |
| --- | --- |
| `addToCart(id)` | Adds a product or increases its quantity |
| `removeFromCart(id)` | Removes an item |
| `updateQuantity(id, delta)` | Increases or decreases quantity (removes at 0) |
| `calculateTotal()` | Returns `{ subtotal, tax, shipping, total }` |
| `saveCart()` / `loadCart()` | Persist and restore the cart with localStorage |

Each cart item stores its own title, price and image, so the cart still shows correctly even before products finish loading.

## Run locally

```bash
python -m http.server 8000
```

Then visit http://localhost:8000

## Deploy

Push to GitHub, then **Settings → Pages → Deploy from a branch → `main` / `(root)`**. Live URL format:
`https://<username>.github.io/<repo>/task-4-ecommerce-cart/`

## Notes

- Prices are in USD, as returned by FakeStoreAPI.
- FakeStoreAPI spells the jewelry category as `jewelery` and has separate men's and women's clothing. The filters handle both.
- This is a demo: checkout is simulated and no data is sent anywhere.

## Tech stack

HTML5 · CSS3 (Grid, Flexbox) · JavaScript ES6+ · Fetch API · localStorage · FakeStoreAPI
