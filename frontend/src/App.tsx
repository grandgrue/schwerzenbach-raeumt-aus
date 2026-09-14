import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import SeasonRoute from './components/SeasonRoute';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ListPage from './pages/ListPage';
import StandDetailPage from './pages/StandDetailPage';
import RegisterPage from './pages/RegisterPage';
import EditStandPage from './pages/EditStandPage';
import RequestLinkPage from './pages/RequestLinkPage';
import FaqPage from './pages/FaqPage';
import RueckblickPage from './pages/RueckblickPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        {/* Saison-Seiten: im Pausenmodus auf die Startseite umgeleitet. */}
        <Route element={<SeasonRoute />}>
          <Route path="karte" element={<MapPage />} />
          <Route path="liste" element={<ListPage />} />
          <Route path="stand/:id" element={<StandDetailPage />} />
          <Route path="anmelden" element={<RegisterPage />} />
        </Route>
        <Route path="rueckblick" element={<RueckblickPage />} />
        <Route path="bearbeiten/:token" element={<EditStandPage />} />
        <Route path="link-anfordern" element={<RequestLinkPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
