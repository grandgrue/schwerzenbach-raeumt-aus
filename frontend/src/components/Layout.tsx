import { NavLink, Outlet, Link } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Start', end: true },
  { to: '/karte', label: 'Karte' },
  { to: '/liste', label: 'Liste' },
  { to: '/faq', label: 'FAQ' },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-sm font-bold transition-colors ${
      isActive ? 'text-primary' : 'text-white/90 hover:text-primary'
    }`;

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-ink-dark sticky top-0 z-[1000] shadow-md">
        <nav className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo Schwerzenbach räumt aus"
                className="h-11 w-11 rounded-full ring-2 ring-primary object-cover"
              />
              <span className="font-display text-primary text-xl sm:text-2xl leading-none tracking-wide">
                Schwerzenbach räumt aus
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
              <Link to="/anmelden" className="btn-primary ml-2 !py-2 !px-4 text-sm">
                Stand anmelden
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-white"
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
              <Link to="/anmelden" className="btn-primary mt-2 w-full !py-2 text-sm">
                Stand anmelden
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-ink-dark text-white/60 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center space-y-3">
          <img
            src="/logo.png"
            alt=""
            aria-hidden
            className="mx-auto h-20 w-20 rounded-full ring-2 ring-primary/70 opacity-90"
          />
          <div className="font-display text-primary text-2xl tracking-wide">
            Schwerzenbach räumt aus
          </div>
          <div className="text-sm">Der Quartier-Flohmarkt von Schwerzenbach</div>
          <div className="text-lg" aria-hidden>🐟</div>
          <div className="flex justify-center gap-5 text-sm pt-2">
            <Link to="/faq" className="text-white/70 hover:text-primary">FAQ &amp; Datenschutz</Link>
            <Link to="/anmelden" className="text-white/70 hover:text-primary">Stand anmelden</Link>
            <Link to="/admin" className="text-white/70 hover:text-primary">Organisator:innen</Link>
          </div>
          <div className="text-xs text-white/40 pt-2">
            © {new Date().getFullYear()} Schwerzenbach räumt aus
          </div>
        </div>
      </footer>
    </div>
  );
}
