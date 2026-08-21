<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify in `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Marqetplace — Project Instructions

## Product

Marqetplace is a marketplace where sellers upload products and buyers can view products with interactive 3D prototypes.

The hackathon MVP prioritizes the core marketplace and 3D product experience. The landing page is secondary and should only be implemented after the core experience is complete.

## Tech Stack

- Next.js 16.3.1
- React 19.2.8
- TypeScript
- Tailwind CSS v4
- TanStack Query
- Lucide React
- model-viewer for displaying 3D models
- Tripo3D is handled by the backend

React Three Fiber and Drei are installed but should NOT be used unless explicitly required. Do not replace model-viewer with Three.js.

## Core User Flows

### Buyer

Storefront
→ Product
→ NAFDAC verification if applicable
→ 3D product view
→ Checkout
→ Order success

### Seller

Sign up
→ Create listing
→ Enter product details
→ Upload product images
→ Review listing
→ Publish
→ 3D model generation
→ Listing published
→ Storefront

## Product Categories

Products may belong to categories such as:

- Food
- Drug
- Health
- Fashion
- Electronics
- Other

NAFDAC verification eligibility is a business rule.

The frontend must use the backend-provided `isNafdacVerifiable` value as the source of truth whenever available.

Do not infer NAFDAC eligibility from product names, descriptions, or images.

## 3D Model Workflow

The backend handles Tripo3D generation.

Frontend workflow:

POST /api/products
→ receive productId
→ poll GET /api/products/:productId/status
→ display generation progress
→ receive modelUrls.glb
→ display using model-viewer

The frontend must not contain Tripo3D implementation details.

Create a reusable ProductViewer abstraction around model-viewer.

## API Architecture

Keep API access inside `lib/api`.

Do not place fetch calls directly inside UI components unless there is a strong architectural reason.

Use TanStack Query for server state.

Mock APIs must be isolated from UI code and structured so they can later be replaced with real backend calls without rewriting pages/components.

## UI Architecture

Prefer reusable components.

Do not create unnecessary one-file components for trivial markup.

Keep business logic separate from presentation where practical.

Pages should compose feature components rather than becoming large monolithic files.

## Routing

Core routes:

- `/` — storefront
- `/products/[id]` — product detail / 3D experience
- `/verify/[id]` — NAFDAC verification
- `/checkout/[id]` — checkout
- `/seller/listings` — seller listings
- `/seller/listings/new` — create listing
- `/seller/listings/new/review` — review and publish
- `/login` — login
- `/signup` — seller signup

## Publishing Flow

Publishing a listing may take several minutes because the backend generates a 3D model.

The UI must clearly communicate:

- publishing has started
- 3D generation is in progress
- current progress when available
- generation failure
- successful publication

Never make a long-running generation request look like a frozen or empty page.

## Storefront

The storefront displays product cards.

Product cards should contain appropriate product imagery, name, description, price, relevant badges, and an Add to Cart action.

Product cards are clickable and lead to the product experience.

Do not load full 3D models for every storefront card unless explicitly required. Prefer normal product images on cards and load the 3D model on the product experience page.

## Checkout

Checkout is currently a demo flow.

Do not implement real payments unless explicitly requested.

After a successful dummy order, display an order-success state explaining that order details would be sent by email.

## Development Workflow

Before changing code:

1. Understand the requested change.
2. Inspect relevant existing files.
3. Check the existing architecture and reuse it where possible.
4. Read relevant Next.js version-specific documentation when needed.
5. Make a short implementation plan.
6. Implement the smallest appropriate change.
7. Run lint/type/build checks when appropriate.
8. Fix issues caused by the implementation.
9. Review the resulting diff for unrelated changes.
10. Summarize what changed.

## Important Constraints

- Do not rewrite unrelated files.
- Do not duplicate existing functionality.
- Do not install dependencies without a clear reason.
- Do not remove working dependencies without checking their usage.
- Do not introduce React Three Fiber/Drei for the 3D MVP.
- Do not replace model-viewer with a custom Three.js viewer.
- Do not hardcode backend responses inside components.
- Do not couple UI components to Tripo3D.
- Do not invent backend API contracts when an existing contract is available.
- When backend behavior is unclear, clearly identify the assumption rather than silently inventing behavior.