import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';

import Calculator from '@/pages/Calculator';

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  })),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('Calculator page', () => {
  test('blocks PDF export when the immediate exit threshold is exceeded', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByLabelText(/categoria ateco/i));
    await user.click(screen.getByText(/attività professionali/i));

    await user.clear(screen.getByLabelText(/ricavi\/compensi annui/i));
    await user.type(screen.getByLabelText(/ricavi\/compensi annui/i), '100001');

    await user.click(screen.getByRole('button', { name: /avanti/i }));
    await user.click(screen.getByRole('button', { name: /avanti/i }));
    await user.click(screen.getByRole('button', { name: /calcola risultati/i }));

    expect(screen.queryByRole('button', { name: /esporta pdf/i })).not.toBeInTheDocument();
    expect(await screen.findByText(/simulazione non esportabile/i)).toBeInTheDocument();
  });
});
