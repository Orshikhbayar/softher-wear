# softher Storefront

A polished, responsive Mongolian-language 3D storefront concept for a premium women's cotton underwear brand. The experience includes a procedural hero scene, interactive product viewer, product discovery tools, bundle building, persistent shopping cart, and a complete demo checkout flow.

## Features

- Responsive announcement bar, navigation, mobile menu, and accessible skip link
- Procedural React Three Fiber hero with floating cotton, ribbons, flowers, and a rotating product
- Interactive 3D product viewer with pointer rotation, zoom, reset, and fabric-detail mode
- Automatic static fallback for reduced-motion preferences and lower-powered devices
- Six product categories with search, category, size, color, price, and sort controls
- Product cards with color swatches, ratings, wishlist persistence, quick add, and detail dialogs
- Product details with sizes, quantity, composition, care, reviews, and related products
- Three-item mix-and-match bundle builder with an applied 10% discount
- Cart drawer with quantity controls, shipping choices, subtotal, demo checkout, and localStorage persistence
- Fit finder, brand benefits, customer reviews, lifestyle gallery, newsletter form, and full footer
- Generated, tasteful lifestyle photography featuring diverse adult women in everyday cotton loungewear

## Stack

- React 18 and Vite 6
- React Three Fiber and Drei
- Three.js
- Framer Motion
- Lucide React icons
- Responsive, custom CSS

## Getting started

Node.js 18 or newer is recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Production checks

```bash
npm run lint
npm run build
npm run preview
```

The optimized production files are written to `dist/`.

## Project structure

```text
softher.wear/
├── public/
│   └── images/                 # Optimized generated lifestyle photography
├── src/
│   ├── components/
│   │   ├── CartDrawer.jsx      # Cart, delivery, and demo checkout flow
│   │   ├── ProductArt.jsx      # Reusable product illustration
│   │   ├── ProductModal.jsx    # Product details and interactive viewer
│   │   └── ThreeScenes.jsx     # Procedural hero and product 3D scenes
│   ├── context/
│   │   └── CartContext.jsx     # Cart state and persistence
│   ├── data/
│   │   └── products.js         # Realistic catalog and review data
│   ├── hooks/
│   │   └── useDialogA11y.js    # Dialog focus management and keyboard support
│   ├── App.jsx                 # Storefront sections and interactions
│   ├── main.jsx                # Application entry point
│   └── styles.css              # Responsive design system and component styles
├── index.html
├── vite.config.js
└── package.json
```

## 3D performance and fallback

The 3D scenes use simple procedural geometry instead of large model downloads, capped device pixel ratios, demand-aware rendering, soft baked-looking lighting, and lazy Suspense boundaries. The experience automatically switches to a fully functional illustrated fallback when reduced motion is requested, when hardware-concurrency or device-memory signals indicate a lower-powered device, or when WebGL cannot initialize. Shopping, filters, product details, bundles, and cart functions do not depend on the 3D scene.

## Accessibility

The interface uses semantic landmarks and headings, descriptive control labels, focus-visible states, keyboard-operable dialogs and menus, focus restoration, sufficient contrast, and a polite live region for cart feedback. Motion is substantially reduced under `prefers-reduced-motion`, while all controls retain equivalent non-animated states.

## Local persistence

The project stores demo data only in the browser:

- `softher-cart-v1` for cart items
- `softher-wishlist-v1` for saved products

The checkout is intentionally a front-end demonstration. It does not transmit personal information, process payment, or contact a backend.
