# Nexus Technical Practical Test

A Shopify extension-only app containing two extensions:

1. **Free Shipping Indicator** : a checkout UI extension that displays a progress banner toward free shipping.
2. **Theme Extension** : a theme app extension with a Delivery & Returns Helper block.

## Project Structure

```
├── extensions/
│   ├── free-shipping-indicator/   # Checkout UI extension
│   │   ├── src/Checkout.tsx
│   │   ├── locales/
│   │   └── shopify.extension.toml
│   └── theme-extension/           # Theme app extension
│       ├── assets/
│       ├── blocks/
│       ├── snippets/
│       ├── src/delivery_eta_returns_helper/
│       └── shopify.extension.toml
├── shopify.app.toml
└── package.json
```

## Setup steps (CLI commands used)

### Prerequisites

- [Node.js](https://nodejs.org/)
- A [Shopify Partner account](https://partners.shopify.com/signup)
- A [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store)

## Development

Start both the Shopify dev server and the Vite block watcher in separate terminals:

Terminal 1 - Shopify Dev
`dev` connects the app to your development store via the Shopify CLI.
```shell
npm run dev
```
Terminal 2 - Shopify Block Watcher
`dev:blocks` watches and rebuilds the React-based theme blocks on file changes.
```shell
npm run dev:blocks
```

### Build

```shell
npm run build
```

### Deploy

```shell
npm run deploy
```

## Extensions

### Free Shipping Indicator

- **Type:** Checkout UI (`purchase.checkout.block.render`)
- **Entry:** `extensions/free-shipping-indicator/src/Checkout.tsx`
- Reads the cart subtotal and compares it against a configurable `free_shipping_threshold` setting.
- Shows a success banner when the threshold is met, or an info banner with the remaining amount.

### Theme Extension -- Delivery & Returns Helper

- **Type:** Theme app extension (block)
- **Liquid block:** `extensions/theme-extension/blocks/delivery_eta_returns_helper.liquid`
- **React source:** `extensions/theme-extension/src/delivery_eta_returns_helper/DeliveryReturnHelper.tsx`
- Renders delivery estimates by region and variant availability on the product page.
- Region data is loaded from `extensions/theme-extension/assets/regions.json`.


## Assumptions and Design Decisions

### Architecture

- **Extension-only app:** This app has no backend. This was only intended as an extension-only app. All logic lives in Shopify extensions, keeping the deployment surface minimal and avoiding hosting infrastructure.

- **Theme Extension:**
  - **React inside a theme extension via Vite:** Theme app extensions don't natively support React, so the `delivery_eta_returns_helper` is compiled by Vite and bundled as `assets/delivery_eta_returns_helper.js`. This enables writing scripts in React/TypeScript while staying compatible with Shopify's theme extension model.
  - **Liquid as a data-bridge layer:** The Liquid block provides access to product data (variants, tags, availability, selected variant) and passed through `data-*` attributes on a container div. The React scripts reads these attributes to hydrate the component, cleanly separating Shopify's server-side Liquid context from client-side React rendering.

- **Checkout UI Extension:** limited with Shopify's native UI components (`s-banner`, `s-text`)


### Delivery & Returns Helper
- **MutationObserver for variant syncing:** The component detects variant changes by observing mutations on `form[action*="/cart/add"] input[ref="variantId"] element` assuming a Shopify theme uses and updates this element on variant changes via variant selector. 

- **Static regions JSON:** Region and delivery-day data is stored `assets/regions.json` as part of the requirements.

- **Default region is the first entry:** The component defaults to the first region in the JSON array. 

- **Delivery days vary by stock status:** In-stock variants use `inStockDeliveryDays`. For out-of-stock it assumes these variants are for pre-order. The out-of-stock (pre-order) variants use `preOrderDeliveryDays`.

- **Lead time is additive and merchant-configurable:** The `lead_time` block setting adds extra days on top of the region-based delivery window.

### Free Shipping Indicator

- **Threshold is merchant-configurable:** The free shipping threshold is a `number_integer` setting in the checkout extension config. If no threshold is set the extension renders nothing.
- **Remaining amount is rounded up:** `Math.ceil((threshold - subtotal) * 100) / 100` avoids displaying sub-cent values by ceiling to the nearest cent.
- **Currency formatting via Shopify i18n:** The remaining amount uses `shopify.i18n.formatCurrency()`, automatically respecting the store's currency and locale settings.

## Known Limitations & Future Improvements

### Known Limitations

**Delivery & Returns Helper**
- **Variant detection is theme-dependent:** The MutationObserver targets `form[action*="/cart/add"] input[ref="variantId"]`, which is specific to certain Shopify themes. Themes that structure their variant selector differently will silently fail to sync variant changes.
- **Static regions data:** `regions.json` is a bundled theme asset.
- **Calendar-day estimates only:** Delivery windows are calculated in pure calendar days, weekends and public holidays are not excluded.

**Free Shipping Indicator**
- **No progress visualisation:** The indicator is a text-only banner with no visual progress bar.
- **Single-condition logic:** The threshold only checks cart subtotal.

### What I Would Improve With More Time
- **Robust variant syncing** — Listen for `variant:change` events, observe URL parameter changes (`?variant=`), or use Shopify's Section Rendering API instead of relying on a single DOM selector.
- **Dynamic region management** — Store region data in shop metafields so merchants can manage regions from the Shopify admin without deploying code.
- **Visual progress bar** — Augment the free shipping banner with a progress bar component showing how close the customer is to the threshold.
- **Business-day delivery estimates** — Skip weekends and configurable holidays when calculating delivery windows.