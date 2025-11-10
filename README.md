# PageTurner Books

A simple multi-page bookstore demo built with plain HTML/CSS/JS (no build tools). It showcases search & filters, dark mode, localStorage-powered authentication, profile, basic reviews persistence, and form validation.

## Project Structure

- `index.html` — Landing page
- `catalog.html` — Book catalog with search, filters, and lazy-loaded images
- `my-books.html` — Personal library mock (actions are demoed with notifications)
- `review.html` — Book details page with customer reviews and add-review modal
- `form.html` — Contact page with validated form and FAQ
- `login.html` — Log in page
- `signup.html` — Sign up page
- `profile.html` — Profile page (name, email, phone; requires auth)

Assets:
- `styles/` — Page-specific CSS
- `scripts/` — Shared JavaScript:
  - `query.js` — UI interactions (search, filters, counters, lazy-load, review modal, notifications)
  - `theme.js` — Dark mode toggle with persistence
  - `auth.js` — LocalStorage-based auth (sign up / log in / logout, profile rendering, helpers)
  - `nav-auth.js` — Hides menu items when logged out (shows only Home + Log In)

## Key Features

- Dark mode: toggled via floating button, persisted in `localStorage` (`theme` key).
- Authentication (no backend):
  - Sign Up creates a user in `localStorage.users` and sets `currentUserEmail`
  - Log In validates credentials and sets `currentUserEmail`
  - Profile page displays current user; includes Log Out
  - Route guard (`scripts/guard.js`) blocks access to protected pages when not logged in (applied to catalog, my-books, review)
- Search & filters (Catalog):
  - Live search over title/author/genre with autocomplete
  - Filter buttons and category chips
  - Search state is persisted in `localStorage.searchState` and restored
- Reviews:
  - “Write a Review” opens a modal; submitted reviews are saved to `localStorage` and appended
  - Helpful counts for saved reviews are persisted
- Forms & Validation:
  - Contact form with validation: required fields, email, phone, password strength
  - Sign Up enforces password complexity (8+ chars with upper/lower/number/special) and matching confirmation

## Running Locally

No build or server is required; open `index.html` with any modern browser.

For best results with persistence:
- Use a local HTTP server to avoid cross-origin issues with some browsers.

Quick servers (run in the project root):
- Python 3: `python -m http.server 5500`
  - Then open `http://localhost:5500/index.html`

## Authentication Details (Local Only)

LocalStorage keys:
- `users`: JSON object keyed by email:
  ```json
  {
    "alice@example.com": {
      "name": "Alice",
      "email": "alice@example.com",
      "phone": "+1 555 000 0000",
      "password": "PlainTextForDemoOnly"
    }
  }
  ```
- `currentUserEmail`: currently authenticated user’s email

Notes:
- Passwords are stored in plaintext for demo purposes only. Do NOT use this approach in production.
- Logging out clears `currentUserEmail`.

## Access Control

- Header menu items are controlled by `nav-auth.js`:
  - Logged out: only “Home” and “Log In” are visible
  - Logged in: all menu items are visible
- `scripts/guard.js` redirects logged-out visitors to `login.html` when visiting protected pages.

## Dark Mode Readability

- `login.html`, `signup.html`, and `profile.html` include small scoped styles to improve text readability in dark mode (light titles, labels, inputs, and links).

## Reviews Persistence

- On `review.html`, posted reviews are saved under a local key (e.g., `reviews:murder-orient-express`). Helpful up/down counts for those saved reviews persist.

## Search State Persistence

- Catalog search term, active filter, and category are saved in `localStorage.searchState` and restored on load.

## Known Limitations

- All data is client-side only (LocalStorage). Refreshing or clearing storage removes the data.
- Passwords are not hashed and there’s no backend. This is strictly for coursework/demos.

## Customization Tips

- Update theme colors in `styles/*.css` and `scripts/theme.js` as needed.
- Extend validations in `scripts/script.js` and `scripts/auth.js`.
- Add more books by copying `catalog.html` book-item blocks and updating their `data-*` attributes.

## Credits

- UI interactions and components implemented with vanilla JS and small scoped styles.
- Some UI patterns adapted from public “Uiverse.io” snippets and tailored to fit the existing design.


