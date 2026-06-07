import { NavLink, Outlet, Link } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Start', end: true },
  { to: '/karte', label: 'Karte' },
  { to: '/liste', label: 'Liste' },
  { to: '/anmelden', label: 'Stand anmelden' },
  { to: '/faq', label: 'FAQ' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-brand-50'
    }`;

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-[1000]">
        <nav className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-brand-700">
              <span className="text-xl">♻️</span>
              <span>Schwerzenbach räumt aus</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menü"
              aria-expanded={open}
            >
              ☰
            </button>
          </div>
          {open && (
            <div className="md:hidden pb-3 space-y-1" onClick={() => setOpen(false)}>
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Schwerzenbach räumt aus</span>
          <div className="flex gap-4">
            <Link to="/faq" className="hover:text-brand-600">FAQ &amp; Datenschutz</Link>
            <Link to="/admin" className="hover:text-brand-600">Organisator:innen</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
