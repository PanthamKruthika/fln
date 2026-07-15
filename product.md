# Product Changes & Feature Isolation Log

This document tracks key modifications made to the Foundational Literacy & Numeracy (FLN) Assessment Platform to simplify its operation and focus strictly on the AI Answer Key Generator.

---

## 🔑 1. Login Feature Removal
To streamline testing and administrative access, the authentication requirement has been bypassed:

### Backend Changes
*   **Authentication Bypass:** Modified `backend/src/middleware/auth.js`.
    *   Bypassed manual JWT token verification.
    *   All incoming API requests are automatically authenticated under a `superadmin` user context.
    *   If no superadmin user exists in the MongoDB database, it is automatically created on the first request (`superadmin@fln.org`).

### Frontend Changes
*   **Default Logged-in State:** Updated `frontend/src/contexts/AuthContext.tsx`.
    *   The user context is pre-loaded with a mock Super Admin profile.
    *   A dummy token (`mock-token`) is set in localStorage on startup.
*   **Routing Guard Bypass:** Modified `frontend/src/App.tsx`.
    *   Removed the `/login` route.
    *   Removed the `<RequireAuth>` router guard wrapper.
*   **UI Menu Cleanup:**
    *   Removed the **Logout** button from the bottom of the Sidebar.
    *   Removed the **Logout** link from the Topbar profile dropdown menu.
    *   Removed the **Logout** button from the Profile page.

---

## 📊 2. Dashboard Simplification (AI Answer Key Isolation)
To focus the platform entirely on the core AI-powered extraction workflow, all other modules and dashboard widgets have been removed.

### Routing Restructuring
*   **Modified file:** `frontend/src/App.tsx`
    *   All analytic, listing, reporting, user management, and setting routes have been deleted.
    *   The root path (`/`) and all unrecognized wildcard paths (`*`) redirect directly to the **AI Answer Key** landing page (`/answer-key-generator`).

### Layout & Navigation Simplification
*   **Modified file:** `frontend/src/components/layout/Sidebar.tsx`
    *   Removed all sidebar navigation links except for the **AI Answer Key** module.
*   **Modified file:** `frontend/src/components/layout/Topbar.tsx`
    *   Removed settings and profile links from the profile dropdown menu to prevent dead links.
