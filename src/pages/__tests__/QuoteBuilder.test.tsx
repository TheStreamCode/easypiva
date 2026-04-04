import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import QuoteBuilder from '../QuoteBuilder';

vi.mock('@/lib/quote/export-pdf', () => ({
  exportQuoteToPdf: vi.fn().mockResolvedValue(undefined),
}));

const STORAGE_KEY = 'easypiva.quote-draft';

beforeEach(() => {
  localStorage.clear();
});

describe('QuoteBuilder draft persistence', () => {
  test('restores saved draft from localStorage on load', () => {
    const savedDraft = {
      providerName: 'Acme Srl',
      providerAddress: 'Via Roma 1',
      providerCity: 'Roma',
      providerVatNumber: 'IT111',
      providerEmail: 'info@acme.it',
      clientName: 'Cliente Test',
      clientAddress: 'Via Milano 2',
      clientEmail: 'cliente@test.it',
      quoteNumber: 'PREV-001',
      issueDate: '2026-01-15',
      title: 'Preventivo test',
      lineItems: [{ id: '1', description: 'Voce salvata', quantity: 2, unitPrice: 100 }],
      discount: 0,
      vatMode: 'none',
      logoDataUrl: '',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDraft));

    render(<QuoteBuilder />);

    expect(screen.getByLabelText(/Ragione Sociale/i)).toHaveValue('Acme Srl');
    expect(screen.getByLabelText(/Nome Cliente/i)).toHaveValue('Cliente Test');
    expect(screen.getByLabelText(/Numero Preventivo/i)).toHaveValue('PREV-001');
    expect(screen.getByLabelText(/Oggetto/i)).toHaveValue('Preventivo test');
  });

  test('uses placeholder defaults when no draft is saved', () => {
    render(<QuoteBuilder />);

    const providerNameInput = screen.getByLabelText(/Ragione Sociale/i);
    expect(providerNameInput).toHaveValue('');
    // Preview should show placeholder provider name (scope to visible preview only)
    const previewRoot = screen.getByTestId('quote-preview-root');
    expect(previewRoot.querySelector('p.text-sm.font-semibold')).toHaveTextContent(
      'EasyPIVA Studio Creativo',
    );
  });

  test('persists draft to localStorage on form change', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder />);

    const nameInput = screen.getByLabelText(/Ragione Sociale/i);
    await user.type(nameInput, 'Nuovo Fornitore');

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.providerName).toBe('Nuovo Fornitore');
    });
  });

  test('includes logoDataUrl in persisted state', async () => {
    const draftWithLogo = {
      providerName: 'Logo Co',
      providerAddress: 'Via Logo 1',
      providerCity: 'Milano',
      providerVatNumber: 'IT222',
      providerEmail: 'logo@co.it',
      clientName: 'Cli',
      clientAddress: 'Via Cli 1',
      clientEmail: 'cli@co.it',
      quoteNumber: 'L-001',
      issueDate: '2026-03-01',
      title: 'Logo test',
      lineItems: [{ id: '1', description: 'Desc', quantity: 1, unitPrice: 50 }],
      discount: 0,
      vatMode: 'none',
      logoDataUrl: 'data:image/png;base64,abc123',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftWithLogo));
    render(<QuoteBuilder />);

    // The preview should render without error and the persisted logo should be in storage
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.logoDataUrl).toBe('data:image/png;base64,abc123');
    });
  });
});

describe('QuoteBuilder responsive layout', () => {
  test('renders mobile actions bar that is always visible', () => {
    render(<QuoteBuilder />);

    // Mobile actions should be visible regardless of viewport - they are in a sticky/fixed bar
    const mobileActions = screen.getByTestId('mobile-actions');
    expect(mobileActions).toBeInTheDocument();
  });

  test('renders form and preview in a two-column layout on desktop', () => {
    render(<QuoteBuilder />);

    const container = screen.getByTestId('quote-builder-grid');
    expect(container).toHaveClass('lg:grid-cols-2');
  });
});

describe('QuoteBuilder safe defaults', () => {
  test('preview renders without errors with empty optional sections', () => {
    const minimalDraft = {
      providerName: '',
      providerAddress: '',
      providerCity: '',
      providerVatNumber: '',
      providerEmail: '',
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      quoteNumber: '',
      issueDate: '',
      title: '',
      lineItems: [{ id: '1', description: '', quantity: undefined, unitPrice: 0 }],
      discount: 0,
      vatMode: 'none',
      logoDataUrl: '',
      notes: '',
      offerValidity: '',
      deliveryTiming: '',
      paymentBeneficiary: '',
      paymentIban: '',
      paymentBankName: '',
      paymentInstructions: '',
      causale: '',
      vatExemptionReason: '',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalDraft));
    render(<QuoteBuilder />);

    // Preview root should exist without crashing
    expect(screen.getByTestId('quote-preview-root')).toBeInTheDocument();
  });

  test('numeric fields remain safe after localStorage stores NaN', () => {
    const brokenDraft = {
      providerName: 'Test',
      providerAddress: 'Addr',
      providerCity: 'City',
      providerVatNumber: 'IT',
      providerEmail: 'test@test.it',
      clientName: 'Client',
      clientAddress: 'Client Addr',
      clientEmail: 'client@test.it',
      quoteNumber: 'Q-1',
      issueDate: '2026-01-01',
      title: 'Broken',
      lineItems: [{ id: '1', description: 'Item', quantity: 'not-a-number', unitPrice: 'bad' }],
      discount: 'invalid',
      vatMode: 'none',
      logoDataUrl: '',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(brokenDraft));
    render(<QuoteBuilder />);

    // Should not crash, preview should still render
    expect(screen.getByTestId('quote-preview-root')).toBeInTheDocument();
  });

  test('renders the export container off-screen but not hidden', () => {
    render(<QuoteBuilder />);

    const exportRoot = document.getElementById('quote-export-root');
    expect(exportRoot).toBeInTheDocument();
    expect(exportRoot).toHaveStyle({ position: 'absolute', left: '-10000px', opacity: '1' });
  });

  test('exports pdf from the form button without validation blocking it', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder />);

    await user.click(screen.getByTestId('quote-export-button'));

    const { exportQuoteToPdf } = await import('@/lib/quote/export-pdf');
    expect(exportQuoteToPdf).toHaveBeenCalledTimes(1);
  });
});
