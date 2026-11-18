# Deep Jyoti Medical

Website for Deep Jyoti Medical (Ayurvedic clinic and medicine store, Kolkata). It was originally built
on the Base44 website builder. It now runs on Cloudflare, with no Base44 account, SDK or servers.

- **Website:** Vite 6, React 18, React Router 6, Tailwind CSS 3, shadcn/ui (Radix)
- **Backend:** a Cloudflare Worker in `server/`
- **Database:** Cloudflare D1 · **Uploaded files:** Cloudflare R2 · **Email:** Resend
- **Images:** local copies in `public/images/`

## Run it on your computer

Requires Node.js 22.13 or newer.

```bash
npm ci
```

```bash
npm run dev
```

Open http://localhost:5173. The website and its `/api` backend run together on that one port, using
a local copy of Cloudflare's runtime. The local database and uploads are kept in the `.wrangler/` folder;
delete that folder to start again from scratch. The first run adds the 25 products from `src/lib/products.js`.

Opening `index.html` by double-clicking it does not work. The site must be opened through the dev server.

### Create a local admin account

Run this while `npm run dev` has been started at least once:

```bash
npm run make-admin -- you@example.com
```

It asks for a password (at least 8 characters). Then sign in at `/login` and open `/admin`.

## Deploy to Cloudflare

You need a free Cloudflare account. Do these once, in order.

**1. Turn on R2** in the Cloudflare dashboard (R2 Object Storage → enable). Cloudflare asks for a payment
card even though this site fits inside the free allowance.

**2. Sign in from this folder:**

```bash
npx wrangler login
```

**3. Deploy:**

```bash
npm run deploy
```

Wrangler creates the D1 database and the R2 bucket on the first deploy and writes the database id back
into `wrangler.jsonc`. It then prints your site address (`https://deep-jyoti-medical.<your-name>.workers.dev`).
If it reports that the database or bucket is missing instead, create them and deploy again:

```bash
npx wrangler d1 create deep-jyoti-db
```

```bash
npx wrangler r2 bucket create deep-jyoti-files
```

**4. Open the Products page** in a browser. Its first API request creates the tables and adds the 25 products.

**5. Create your live admin account:**

```bash
npm run make-admin -- you@example.com --remote
```

**6. Set up email before opening registration:**

- Create an account at https://resend.com and verify your domain there.
- In `wrangler.jsonc`, set `EMAIL_FROM` (for example `Deep Jyoti Medical <orders@deepjyotimedical.com>`)
  and `PUBLIC_URL` (for example `https://deepjyotimedical.com`).
- Store the API key as a secret, then deploy again with `npm run deploy`:

```bash
npx wrangler secret put RESEND_API_KEY
```

- Test registration with an inbox you control, then request a password reset and follow the link.
- For local testing, copy `.dev.vars.example` to `.dev.vars` and set the local sender and API key there.

**Set up online payment (Razorpay).** Without these secrets, checkout offers Cash on Delivery only.

- In the Razorpay Dashboard, complete account activation (KYC). Until then only Test Mode works.
- Account & Settings → API Keys → generate a key. Use the **Test Mode** key first, then switch to the
  **Live Mode** key once a test order works end to end. Store both values as secrets:

```bash
npx wrangler secret put RAZORPAY_KEY_ID
```

```bash
npx wrangler secret put RAZORPAY_KEY_SECRET
```

- Account & Settings → Webhooks → Add New Webhook. URL: `https://<your-site>/api/payments/razorpay/webhook`.
  Choose a secret and tick the events `order.paid`, `payment.captured` and `payment.authorized`. Then:

```bash
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
```

  The webhook creates the order if the customer pays but closes the tab before returning to the site.
- Test Mode and Live Mode have separate keys **and** separate webhooks; set up both when going live.
- Admin → Settings has a switch to hide online payment without removing the keys.
- For local testing, put the test keys in `.dev.vars` (see `.dev.vars.example`).

**7. Connect your domain:** Cloudflare dashboard → Workers & Pages → deep-jyoti-medical → Settings →
Domains & Routes → Add custom domain. The domain must use Cloudflare's nameservers.

To publish later changes, run `npm run deploy` again. Your data is not affected by deploys.

### Backups

Orders, customers and accounts are in D1, and prescriptions are in R2. Keep exports in a secure
directory outside this repository because they contain customer data. For example:

```bash
npx wrangler d1 export deep-jyoti-db --remote --output=../backup.sql
```

D1 also keeps 30 days of point-in-time history ("Time Travel") that can be restored from the dashboard.

### Costs and limits

The free plan covers 100,000 requests a day, 5 GB of D1 and 10 GB of R2, which is far more than this
site needs. One limit matters: the free plan allows very little processing time per request, and
checking a password is the heaviest thing the site does. If sign-ins ever fail with an error under load,
the Workers Paid plan (US$5 a month) removes that limit.

## How the backend works

| Area | What it does | Files |
| --- | --- | --- |
| Routing and access rules | Products, settings and approved reviews are public. Visitors can submit inquiries and prescriptions. To track an order they must enter its ID and the mobile number used at checkout. The tracking response contains only order status, payment details, and status timestamps | `server/worker.js` (`ENTITIES`, `ROUTES`) |
| Data | Products, orders, customers, settings, inquiries, prescriptions and reviews are JSON documents in D1. Tables are created automatically on first use | `server/db.js`, `server/schema.js` |
| Online payment | Razorpay. The server prices the cart and opens a Razorpay order. The real order is created only after Razorpay confirms the payment (signature, amount, status), from the browser or the webhook, exactly once. Unpaid checkouts hold no stock | `server/razorpay.js`, `src/lib/razorpay.js` |
| Orders | The server checks prices, stock, COD rules and totals. Checkout detects concurrent changes before saving the order and updating the customer and stock in one transaction | `server/orders.js`, `src/lib/orderLogic.js` |
| Accounts | Email + password (PBKDF2), 6-digit email verification, 30-day sessions, password reset by emailed link | `server/auth.js` |
| Files | Prescription uploads: JPG/PNG/PDF only, 10 MB, content checked. Stored privately in R2; admins open them through links that expire after 10 minutes | `server/worker.js` |
| Email | Sent through Resend. The `outbox` records delivery status and omits verification codes and reset links | `server/email.js` |
| Abuse protection | Sign-in, form submissions and order lookups are rate-limited per visitor | `server/db.js` (`rateLimit`) |
| Browser client | Keeps the `db.entities.X.list()` / `db.auth.me()` shape the pages were written against | `src/api/client.js` |
| Cloudflare settings | Worker entry, static assets, database and bucket bindings, variables | `wrangler.jsonc` |

Registration and password-reset requests require email configuration. Verification codes and reset
links are sent through email. Existing accounts can sign in while email is unconfigured.

## What does not work yet

- **Email delivery** until Resend is set up (step 6). The Resend connection itself has not been tested
  with a real key.
- **Online payments** until the Razorpay keys are set (see above). Refunds are made in the Razorpay
  dashboard; then change the order's payment status to Refunded in Admin.
- **Inquiries have no admin page.** Contact-form inquiries are saved and emailed to the admin address,
  but (as in the original) no screen lists them.

## Things to know

- **Product data is partial.** The database is seeded from the 25 products that were hardcoded in the
  export (name, category, price, image, description). MRP, brand, stock levels and reviews from the old
  Base44 database were not in the export; add them in Admin → Products / Inventory.
- **Old orders and customers are not here.** Nothing was imported from the Base44 database.
- `server/data/`, if present, is the database of the earlier Node version of the backend. It is no longer used.

Before committing, run `npm run lint`, `npm run typecheck`, and `npm run build`. Check that Git
excludes database exports, `.wrangler/`, `server/data/`, and local secret files.

## History of changes

The download came from a third-party exporter that damaged the code. The untouched original is in
`.original-export-backup/` (not tracked by git).

**Repair of the export**

- Removed the stub the exporter inserted at the top of 40 files and restored real backend calls.
- Fixed 47 image URLs that pointed to a non-existent host.
- Recreated 13 missing files. Standard ones: `src/components/ui/{card,accordion,switch}.jsx`.
  Rebuilt from how the code uses them (may differ in detail from the live site):
  `src/components/ui/use-toast.jsx`, `src/lib/authReturnTo.js`, `src/lib/PageNotFound.jsx` and
  `src/components/product/{ProductGallery,ProductPurchasePanel,ProductDescription,ProductReviews,RecentlyViewed}.jsx`.
- Wired the toast close button in `src/components/ui/toaster.jsx`.

**Moving off Base44**

- Replaced the Base44 SDK with the site's own backend and the browser client `src/api/client.js`.
- `src/lib/AuthContext.jsx`: now just restores the signed-in user from the backend.
- `src/lib/orders.js`: order placement and email sending moved to the server; shared rules moved to
  `src/lib/orderLogic.js`. Customer-entered text is escaped in order emails, and the admin email's
  "View Order" link points to the correct order page.
- Downloaded the 35 images from Base44's CDN into `public/images/` and pointed all references at them.
- `index.html`: favicon now uses the site logo (the previous file did not exist).
- Deleted files that only worked on Base44: the `base44/` folder, `src/pages/OAuthConsent.jsx` (and its
  `/oauth/consent` route), `src/pages/Mfa.jsx`, `src/components/Mfa*.jsx`, `src/lib/authMfa.js`,
  `src/lib/authMfaFlow.js` and `src/lib/app-params.js`.

**Moving to Cloudflare**

- Rewrote the backend from Node/Express/SQLite to a Cloudflare Worker (`server/worker.js`) with D1 and R2.
- Email now goes through the Resend API instead of SMTP.
- Password hashing changed from scrypt to PBKDF2-SHA256 (100,000 iterations), the strongest setting
  Cloudflare Workers allow.
- Rate limiting moved from server memory into the database.
- Removed `express`, `multer`, `nodemailer`; added `wrangler` and `@cloudflare/vite-plugin`.
- Added `wrangler.jsonc`, `.dev.vars.example` and `scripts/make-admin.mjs`; `npm start` was replaced by `npm run deploy`.
