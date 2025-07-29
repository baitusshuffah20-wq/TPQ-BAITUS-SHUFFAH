# Header Component: High-Level Documentation

## Purpose

The `Header` component is the main navigation bar for a Next.js web application. It provides responsive navigation links, branding, and user authentication controls (login/register or user menu) for both desktop and mobile views.

---

## Key Features

### 1. Responsive Layout

- **Desktop Navigation:** Visible on medium and larger screens; displays branding and navigation links horizontally.
- **Mobile Navigation:** Collapses navigation links into a toggleable menu; includes all navigation and authentication elements.

### 2. Site Branding

- Displays a logo and site title/subtitle.
- Ensures consistent branding across the application.

### 3. Navigation Links

- Renders a set of defined navigation links (such as "Beranda", "Tentang Kami", etc.) each with an associated icon.
- Active link is visually highlighted based on the current path.

### 4. User Authentication Controls

- Integrates with NextAuth's `useSession` for session management.
- **When user is authenticated:**
  - Shows a user-avatar button with dropdown menu (desktop) or user section (mobile).
  - Dropdown includes links to dashboard, profile, and a logout button.
  - Displays user name and email.
- **When no user is authenticated:**
  - Shows `Masuk` (login) and `Daftar` (register) buttons.

### 5. Dropdown and Menu Management

- Dropdown menu for user profile/actions appears only on desktop.
- Mobile navigation uses a hamburger (`Menu` icon) to toggle the menu, and an `X` icon to close it.

### 6. User Experience Enhancements

- Visual feedback (color and size changes) on navigation and button clicks.
- Dropdown closes on external clicks (click outside).
- Handles potential errors in authentication logic gracefully.

### 7. Accessibility

- Buttons and menus have appropriate ARIA labels and keyboard interactions.
- Handles focus and active states for accessibility and feedback.

---

## Technologies & Dependencies

- **React** (hooks: `useState`, `useRef`, `useEffect`)
- **Next.js** (`Link`, `Image`, `usePathname` from next/navigation)
- **NextAuth** (`useSession`, `signOut`)
- **Icon Library:** Lucide React
- **Custom UI Components:** `Button`, `Logo`
- **Utility Functions:** `cn` for conditional class management

---

## Code Structure

- **Header:** Main component encapsulating branding, navigation, user controls.
- **navigation:** Array describing available navigation links (name, path, icon).
- **Authenticated/Nav Logic:** Conditional rendering based on authentication status.
- **Event Handling:** Click events, menu toggling, sign-out, and click-outside for dropdown.
- **Styling:** Tailwind CSS utility classes and some minor dynamic effects.

---

## Usage

This component is intended to be placed at the root level of most pages/layouts. It manages navigation and user session controls automatically and adapts its layout based on screen size. All significant actions (navigation, login, logout) are handled within the component.

---

## Customization

- **Add/Remove Navigation items:** Edit the `navigation` array.
- **Styling:** Tailwind classes can be adjusted for branding needs.
- **User Dropdown:** Extend for more user actions if needed.

---

In summary, the `Header` component provides a fully-responsive, accessible, and authenticated-aware navigation bar for a modern Next.js application, handling core navigation and user flows robustly.
