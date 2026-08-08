import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import Contributions from '@/pages/Contributions';

describe('Contributions page', () => {
  test('shows the 2026 INPS fixed instalment deadlines', async () => {
    const user = userEvent.setup();
    render(<Contributions />);

    await user.click(screen.getByLabelText(/Gestione INPS/i));
    await user.click(await screen.findByRole('option', { name: /Artigiani/i }));

    const contributionHistory = screen.getByLabelText(/Anzianità contributiva/i);
    await user.click(contributionHistory);
    expect(
      await screen.findByRole('option', { name: /Prima iscrizione dal 1° gennaio 1996/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /Anzianità contributiva al 31 dicembre 1995/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('18 Maggio 2026')).toBeInTheDocument();
    expect(screen.getByText('20 Agosto 2026')).toBeInTheDocument();
    expect(screen.getByText('16 Novembre 2026')).toBeInTheDocument();
    expect(screen.getByText('16 Febbraio 2027')).toBeInTheDocument();
  });
});
