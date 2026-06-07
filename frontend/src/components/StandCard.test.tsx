import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StandCard from './StandCard';
import type { PublicStand } from '../api/types';

const stand: PublicStand = {
  id: 1,
  title: 'Garagenflohmi Familie Muster',
  description: 'Spielsachen, Bücher, Geschirr',
  address: 'Bahnhofstrasse 1, 8603 Schwerzenbach',
  lat: 47.3828,
  lng: 8.6558,
  start_time: '09:00',
  end_time: '16:00',
  offers_food: false,
  offers_drinks: true,
  categories: [{ id: 3, name: 'Spielwaren' }],
};

describe('StandCard', () => {
  it('zeigt Titel, Adresse, Kategorie und Getränke-Hinweis', () => {
    render(
      <MemoryRouter>
        <StandCard stand={stand} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Garagenflohmi Familie Muster')).toBeInTheDocument();
    expect(screen.getByText('Bahnhofstrasse 1, 8603 Schwerzenbach')).toBeInTheDocument();
    expect(screen.getByText('Spielwaren')).toBeInTheDocument();
    expect(screen.getByText(/Getränke/)).toBeInTheDocument();
  });

  it('verlinkt auf die Detailseite', () => {
    render(
      <MemoryRouter>
        <StandCard stand={stand} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/stand/1');
  });
});
