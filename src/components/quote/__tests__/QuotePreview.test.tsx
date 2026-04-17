import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { quotePlaceholder } from '@/lib/quote/placeholders';

import { QuotePreview } from '../QuotePreview';
import type { QuoteDraft } from '../quotePreviewData';

const baseDraft: QuoteDraft = {
  ...quotePlaceholder,
  items: quotePlaceholder.items,
  notes: quotePlaceholder.notes,
};

function makeLongDraft(): QuoteDraft {
  return {
    ...baseDraft,
    items: Array.from({ length: 22 }, (_, index) => ({
      id: `item-${index + 1}`,
      description: `Voce molto lunga numero ${index + 1} con testo aggiuntivo per forzare la paginazione e rendere chiaro il comportamento dello slider`,
      quantity: 1,
      unitPrice: 120 + index,
    })),
    notes:
      'Nota lunga per test slider. '.repeat(18) +
      'Causale e condizioni di pagamento devono restare leggibili anche quando il preventivo genera piu pagine.',
  };
}

describe('QuotePreview slider', () => {
  test('renders page controls and page counter', () => {
    render(<QuotePreview quote={baseDraft} />);

    expect(screen.getByRole('button', { name: /pagina precedente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pagina successiva/i })).toBeInTheDocument();
    expect(screen.getByTestId('quote-preview-page-counter')).toHaveTextContent(/^1\/?\d+$/);
  });

  test('shows the enlarge action and opens a modal', async () => {
    const user = userEvent.setup();
    render(<QuotePreview quote={baseDraft} />);

    await user.click(screen.getByRole('button', { name: /ingrandisci/i }));

    expect(screen.getByText(/anteprima preventivo/i)).toBeInTheDocument();
  });

  test('keeps a single visible page in the main preview', () => {
    render(<QuotePreview quote={makeLongDraft()} />);

    expect(screen.getAllByText(/Pagina \d+ \//i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('quote-preview-root')).toBeInTheDocument();
  });

  test('renders formatted date and vat label in the preview', () => {
    render(<QuotePreview quote={baseDraft} />);

    expect(screen.getByText('04/04/2026')).toBeInTheDocument();
    expect(screen.getAllByText(/Operazione non soggetta a IVA/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^none$/i)).not.toBeInTheDocument();
  });
});
