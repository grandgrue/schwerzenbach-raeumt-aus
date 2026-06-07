import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-3xl font-bold">Seite nicht gefunden</h1>
      <p className="text-gray-600">Die aufgerufene Seite existiert nicht.</p>
      <Link to="/" className="text-brand-600 hover:underline">← Zur Startseite</Link>
    </div>
  );
}
