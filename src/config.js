// Demo mode: the admin panel works fully in the browser with sample data and needs no server or database.
// Edits stay in this browser only. Build with VITE_REAL_ADMIN=1 to use the real server login and storage instead.
export const DEMO_ADMIN = import.meta.env.VITE_REAL_ADMIN !== '1'
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'admin123'
