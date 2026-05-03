import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';

import Comparison from '@/pages/Comparison';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('Comparison page form', () => {
  test('espone il selettore della cassa INPS', () => {
    render(<Comparison />);

    expect(screen.getByLabelText(/Gestione INPS/i)).toBeInTheDocument();
  });

  test('normalizza i ricavi negativi a zero', async () => {
    render(<Comparison />);

    const ricaviInput = screen.getByLabelText(/Ricavi Annui Stimati/i);
    fireEvent.change(ricaviInput, { target: { value: '-100' } });

    expect(ricaviInput).toHaveValue(0);
  });
});
