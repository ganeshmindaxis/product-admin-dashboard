# Product Admin Dashboard 🚀

A modern, responsive, and robust **Product Management Admin Dashboard** built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **Axios**. Powered by the free [DummyJSON API](https://dummyjson.com).

![Dashboard Preview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Live Demo & Repository
- **Live Demo (Vercel/Netlify):** [Deploy to Vercel](https://vercel.com/new)
- **Tech Stack:** Next.js, React, Tailwind CSS, Axios, Lucide Icons

---

## 🔑 Demo Credentials
- **Username:** `emilys`
- **Password:** `emilyspass`
*(Protected Routes: Only authenticated users can access `/products` and `/products/[id]`)*

---

## ✨ Features Finished

### 1. Authentication & Security 🔐
- **Login Page (`/login`):** Validates credentials against `POST /auth/login`. Displays inline error alerts for incorrect credentials.
- **Protected Layout:** Redirects unauthenticated users attempting to open dashboard routes back to `/login`.
- **Session Persistence:** Saves JWT access token and user info securely in `localStorage`.
- **Logout:** One-click session destruction and redirect.

### 2. Products List & Layout 📦
- **Desktop Table View:** Displays thumbnail image, title, category, price, discount %, rating, stock status, and actions.
- **Mobile Card View:** Automatically adapts on mobile viewports (`< md`) with card layouts.

### 3. Custom Pagination 📑
- **Limit & Skip API Integration:** Dynamic API fetching based on `page` and `limit`.
- **Page Controls:** Previous/Next buttons, direct page numbers with ellipsis for large page counts.
- **Page Size Selector:** Options for 10, 20, or 50 items per page.
- **Summary Text:** Precise item range summary (e.g., *"Showing 21–40 of 194"*).
- **Custom Built:** Written without third-party pagination libraries.

### 4. Debounced Search & URL Syncing 🔍
- **Search Endpoint:** Uses `/products/search?q=`.
- **Debounced Input:** 400ms delay wait until user stops typing before triggering Axios requests.
- **URL Synchronization:** Search term, page, category, and sorting values are continuously synchronized in the URL query string (`?page=1&search=phone&category=smartphones`).
- **Resets to Page 1:** Page automatically resets to 1 when a new search query is entered.

### 5. Filtering & Sorting 𝒁-𝑨
- **Category Filter:** Fetches categories from `/products/categories` and filters list accordingly.
- **Sorting Options:** Sort by Price (Low to High / High to Low), Rating (Highest / Lowest), and Title (A-Z / Z-A).

### 6. Product Details Page (`/products/[id]`) 🖼️
- **Rich Media & Specs:** Displays product thumbnail, image gallery selector, price, discount, stock badge, category, brand, and warranty/shipping policies.
- **Reviews Section:** Lists customer reviews with reviewer names, star ratings, dates, and comments.
- **404 Not Found Page:** Custom stylized error page when accessing invalid product IDs (e.g. `/products/999999`).

### 7. Product Management (Add, Edit, Delete) ✏️
- **Add Product Modal:** Form validation requiring title, price (> 0), stock (>= 0), category, and description.
- **Edit Product Modal:** Pre-populates existing data and updates item.
- **Confirm Delete Modal:** Modal popup to confirm item deletion.

### 8. Loading, Empty & Error States ⏳
- **Loading Skeleton:** Displays spinner while awaiting API responses.
- **Empty State:** Friendly graphic and message when search/filter returns zero items, plus a "Clear Filters" button.
- **Error State:** Shows error banner with a **"Retry API Request"** button.

---

## 🛠️ Things Handled Carefully & Edge Cases

### 1. Fast Typing & Race Conditions (Axios AbortController)
- **Problem:** If a user types fast in the search bar, older slow requests could resolve after newer requests, corrupting the search results.
- **Solution:** Integrated Axios `AbortController` (CancelToken pattern). Whenever a new search character is typed, any pending API request is aborted immediately before launching the new request. Tested with `&delay=2000`.

### 2. API Constraint: Search + Category Combination
- **Problem:** DummyJSON API does not natively support combining `/products/search?q=...` with `/products/category/...`.
- **Solution:** When both search and category filters are selected, our application fetches search results from the API and applies client-side category filtering seamlessly over the returned search subset. An informative banner is rendered in the UI explaining this choice.

### 3. DummyJSON Mock API Read-Only Limitation (Local Overlay Persistence)
- **Problem:** DummyJSON API endpoints (`POST /products/add`, `PUT /products/{id}`, `DELETE /products/{id}`) mock responses but do NOT save modifications permanently on the server DB. Subsequent `GET` calls reset all changes.
- **Solution:** Implemented a **ProductContext Local Overlay Store** (`localStorage`). Newly added products, edits, and deletions are saved locally and merged over API responses. Users can add, edit, or delete items and see changes persist throughout their session and across page reloads. A "Reset Changes" button is provided in the header to revert to pure DummyJSON data at any time.

### 4. Malformed / Invalid URL Parameters
- **Problem:** Users or manual links might contain invalid params like `?page=abc` or `?page=9999`.
- **Solution:** Implemented robust sanitization (`Math.max(1, parseInt(rawPage) || 1)`). If `page` or `limit` is invalid, the dashboard gracefully sanitizes the input without crashing or throwing React runtime errors.

### 5. Double-Submission / Rapid Click Throttling
- **Problem:** Rapidly clicking "Sign In", "Save Product", or "Delete" could fire duplicate network requests.
- **Solution:** Buttons enter a disabled `isSubmitting` state with loading spinners during async operations to block duplicate triggers.

---

## 🤖 AI Tools Disclosure & Reflection
- **Where AI Helped:** Accelerated initial boilerplate setup, assisted in structuring custom pagination logic, and helped design accessible Tailwind CSS UI components.
- **Understanding:** Every module—from the shared Axios interceptor (`lib/axios.ts`) to the AbortController race condition handler and local overlay store—is fully understood, documented, and ready for a live walkthrough and code modifications.

---

## 🚀 Local Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/your-username/product-admin-dashboard.git
cd product-admin-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```
