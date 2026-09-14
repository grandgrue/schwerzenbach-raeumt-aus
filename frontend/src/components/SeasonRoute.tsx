import { Navigate, Outlet } from 'react-router-dom';
import { useEvent } from '../api/hooks';
import { Loading } from './StatusViews';

/**
 * Schützt die «Saison»-Seiten (Karte, Liste, Detail, Anmeldung).
 * Im Pausenmodus (`event.paused`) werden diese still auf die Startseite umgeleitet.
 */
export default function SeasonRoute() {
  const { data: event, isLoading } = useEvent();

  if (isLoading) {
    return <div className="py-16"><Loading /></div>;
  }
  if (event?.paused) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
