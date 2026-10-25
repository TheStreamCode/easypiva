import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Calculator from '@/pages/Calculator';

const pdfMocks = vi.hoisted(() => ({
  setFontSize: vi.fn(),
  text: vi.fn(),
  save: vi.fn(),
}));

vi.mock('jspdf', () => {
  function JsPdfMock() {
    return {
      setFontSize: pdfMocks.setFontSize,
      text: pdfMocks.text,
      save: pdfMocks.save,
    };
  }

  return { jsPDF: vi.fn(JsPdfMock) };
});

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('Calculator page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(await screen.findByText(/regime forfettario non applicabile/i)).toBeInTheDocument();
  });

  test('exposes an accessible wizard progress and invalid field state', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    await user.click(screen.getByRole('button', { name: /avanti/i }));

    const atecoTrigger = screen.getByLabelText(/categoria ateco/i);
    expect(atecoTrigger).toHaveAttribute('aria-invalid', 'true');
    expect(atecoTrigger).toHaveAttribute('aria-describedby', 'atecoId-error');
    expect(screen.getByText(/seleziona una categoria ateco/i)).toBeInTheDocument();
  });

  test('shows the fiscal assumption version next to the results', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByLabelText(/categoria ateco/i));
    await user.click(screen.getByText(/attività professionali/i));

    await user.click(screen.getByRole('button', { name: /avanti/i }));
    await user.click(screen.getByRole('button', { name: /avanti/i }));
    await user.click(screen.getByRole('button', { name: /calcola risultati/i }));

    expect(await screen.findByTestId('calculator-fiscal-profile-note')).toHaveTextContent(
      /assunzioni fiscali 2026, versione 2026\.1/i,
    );
  });

  test('includes the assumption version in the exported PDF', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByLabelText(/categoria ateco/i));
    await user.click(screen.getByText(/attività professionali/i));

    await user.click(screen.getByRole('button', { name: /avanti/i }));
    await user.click(screen.getByRole('button', { name: /avanti/i }));
    await user.click(screen.getByRole('button', { name: /calcola risultati/i }));

    const exportButton = await screen.findByRole('button', { name: /esporta pdf/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(pdfMocks.text).toHaveBeenCalledWith(
        expect.stringContaining('assunzioni 2026.1'),
        20,
        20,
      );
    });
  });
});
