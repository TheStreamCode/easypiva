import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { QuoteForm, type QuoteFormValues } from '../QuoteForm';
import { quotePlaceholder } from '@/lib/quote/placeholders';

function FormWrapper({
  onSubmit,
  onExportStateChange,
}: {
  onSubmit?: (data: unknown) => void;
  onExportStateChange?: (state: { isExporting: boolean }) => void;
} = {}) {
  const form = useForm({
    defaultValues: {
      providerName: '',
      providerAddress: '',
      providerCity: '',
      providerVatNumber: '',
      providerTaxCode: '',
      providerEmail: '',
      clientName: '',
      clientAddress: '',
      clientCity: '',
      clientVatNumber: '',
      clientTaxCode: '',
      clientEmail: '',
      quoteNumber: '',
      issueDate: '',
      title: '',
      offerValidity: '',
      deliveryTiming: '',
      lineItems: [{ id: 'item-1', description: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      vatMode: 'none' as const,
      vatExemptionReason: '',
      paymentBeneficiary: '',
      paymentIban: '',
      paymentBankName: '',
      paymentInstructions: '',
      causale: '',
      notes: '',
      logoDataUrl: '',
    },
  });

  return (
    <FormProvider {...form}>
      <QuoteForm
        onExportStateChange={onExportStateChange}
        onSubmit={(values) => onSubmit?.(values)}
      />
    </FormProvider>
  );
}

function VatToggleWrapper() {
  const { setValue } = useFormContext<QuoteFormValues>();
  return (
    <div>
      <QuoteForm />
      <button type="button" data-testid="set-vat10" onClick={() => setValue('vatMode', 'vat10')}>
        Set VAT 10
      </button>
      <button type="button" data-testid="set-vat-none" onClick={() => setValue('vatMode', 'none')}>
        Set No VAT
      </button>
    </div>
  );
}

function VatTestWrapper() {
  const form = useForm({
    defaultValues: {
      providerName: '',
      providerAddress: '',
      providerCity: '',
      providerVatNumber: '',
      providerTaxCode: '',
      providerEmail: '',
      clientName: '',
      clientAddress: '',
      clientCity: '',
      clientVatNumber: '',
      clientTaxCode: '',
      clientEmail: '',
      quoteNumber: '',
      issueDate: '',
      title: '',
      offerValidity: '',
      deliveryTiming: '',
      lineItems: [{ id: 'item-1', description: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      vatMode: 'none' as const,
      vatExemptionReason: '',
      paymentBeneficiary: '',
      paymentIban: '',
      paymentBankName: '',
      paymentInstructions: '',
      causale: '',
      notes: '',
      logoDataUrl: '',
    },
  });

  return (
    <FormProvider {...form}>
      <VatToggleWrapper />
    </FormProvider>
  );
}

function PrefilledFormWrapper({ onSubmit }: { onSubmit?: (data: unknown) => void } = {}) {
  const form = useForm({
    defaultValues: {
      providerName: 'Test Srl',
      providerAddress: 'Via Test 1',
      providerCity: 'Milano',
      providerVatNumber: 'IT123',
      providerTaxCode: '',
      providerEmail: 'test@test.it',
      clientName: 'Client Srl',
      clientAddress: 'Via Client 1',
      clientCity: '',
      clientVatNumber: '',
      clientTaxCode: '',
      clientEmail: 'client@test.it',
      quoteNumber: 'Q-001',
      issueDate: '2026-01-01',
      title: 'Test preventivo',
      offerValidity: '',
      deliveryTiming: '',
      lineItems: [{ id: 'item-1', description: 'Test', quantity: 1, unitPrice: 100 }],
      discount: 0,
      vatMode: 'none' as const,
      vatExemptionReason: '',
      paymentBeneficiary: '',
      paymentIban: '',
      paymentBankName: '',
      paymentInstructions: '',
      causale: '',
      notes: '',
      logoDataUrl: '',
    },
  });

  return (
    <FormProvider {...form}>
      <QuoteForm onSubmit={(values) => onSubmit?.(values)} />
    </FormProvider>
  );
}

describe('QuoteForm', () => {
  it('renders business/provider fields', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/ragione sociale/i)).toBeInTheDocument();
    expect(document.getElementById('providerAddress')).toBeInTheDocument();
    expect(document.getElementById('providerCity')).toBeInTheDocument();
    expect(document.getElementById('providerEmail')).toBeInTheDocument();
    expect(document.getElementById('providerVatNumber')).toBeInTheDocument();
    expect(document.getElementById('providerTaxCode')).toBeInTheDocument();
  });

  it('renders client fields', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/nome cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/indirizzo cliente/i)).toBeInTheDocument();
  });

  it('renders quote header fields', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/numero preventivo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/oggetto/i)).toBeInTheDocument();
  });

  it('renders offer validity, delivery timing, and notes', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/validita/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tempistiche/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^note$/i)).toBeInTheDocument();
  });

  it('renders payment detail fields', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/beneficiario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/iban/i)).toBeInTheDocument();
  });

  it('renders discount, VAT mode, causale, and disclaimer section', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/sconto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/regime iva/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/causale/i)).toBeInTheDocument();
    expect(screen.getAllByText(/disclaimer/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders logo upload field', () => {
    render(<FormWrapper />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('starts with one line item row', () => {
    render(<FormWrapper />);

    const descInputs = screen.getAllByPlaceholderText(/descrizione voce/i);
    expect(descInputs).toHaveLength(1);
  });

  it('adds a line item row when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);

    const addButton = screen.getByRole('button', { name: /aggiungi voce/i });
    await user.click(addButton);

    const descInputs = screen.getAllByPlaceholderText(/descrizione voce/i);
    expect(descInputs).toHaveLength(2);
  });

  it('removes a line item row when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);

    const addButton = screen.getByRole('button', { name: /aggiungi voce/i });
    await user.click(addButton);

    const removeButtons = screen.getAllByRole('button', { name: /rimuovi voce/i });
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0]);

    const descInputs = screen.getAllByPlaceholderText(/descrizione voce/i);
    expect(descInputs).toHaveLength(1);
  });

  it('add and remove row buttons are keyboard-reachable', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);

    const addButton = screen.getByRole('button', { name: /aggiungi voce/i });
    addButton.focus();
    expect(addButton).toHaveFocus();

    await user.click(addButton);

    const removeButtons = screen.getAllByRole('button', { name: /rimuovi voce/i });
    expect(removeButtons.length).toBeGreaterThan(0);
    removeButtons[0].focus();
    expect(removeButtons[0]).toHaveFocus();
  });

  it('shows VAT exemption reason by default when vatMode is none', () => {
    render(<FormWrapper />);

    expect(screen.getByLabelText(/motivo esenzione/i)).toBeInTheDocument();
  });

  it('hides VAT exemption reason when a VAT rate is selected', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);

    expect(screen.getByLabelText(/motivo esenzione/i)).toBeInTheDocument();

    const vatTrigger = screen.getByLabelText(/regime iva/i);
    await user.click(vatTrigger);

    const vat10Option = screen.getByText(/10%/i);
    await user.click(vat10Option);

    await waitFor(() => {
      expect(screen.queryByLabelText(/motivo esenzione/i)).not.toBeInTheDocument();
    });
  });

  it('shows VAT exemption reason again when switching back to none', async () => {
    const user = userEvent.setup();
    render(<VatTestWrapper />);

    // Default is 'none' — exemption reason visible
    expect(screen.getByLabelText(/motivo esenzione/i)).toBeInTheDocument();

    // Switch to vat10 via controlled setValue
    await user.click(screen.getByTestId('set-vat10'));

    await waitFor(() => {
      expect(screen.queryByLabelText(/motivo esenzione/i)).not.toBeInTheDocument();
    });

    // Switch back to none
    await user.click(screen.getByTestId('set-vat-none'));

    await waitFor(() => {
      expect(screen.getByLabelText(/motivo esenzione/i)).toBeInTheDocument();
    });
  });

  it('handles non-finite numeric input for quantity without crashing', () => {
    render(<FormWrapper />);

    const quantityInput = screen.getAllByLabelText(/qta/i)[0];
    fireEvent.change(quantityInput, { target: { value: 'abc' } });

    expect(quantityInput).toBeInTheDocument();
  });

  it('handles non-finite numeric input for unit price without crashing', () => {
    render(<FormWrapper />);

    const priceInput = screen.getByLabelText(/prezzo unitario/i);
    fireEvent.change(priceInput, { target: { value: '---' } });

    expect(priceInput).toBeInTheDocument();
  });

  it('uses realistic placeholders from the quote placeholders module', () => {
    render(<FormWrapper />);

    expect(screen.getByPlaceholderText(quotePlaceholder.provider.name)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(quotePlaceholder.client.name)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(quotePlaceholder.quoteNumber)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(quotePlaceholder.title)).toBeInTheDocument();
  });

  it('handles logo upload and converts to data URL', async () => {
    render(<FormWrapper />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fake-image'], 'logo.png', { type: 'image/png' });

    const originalFileReader = globalThis.FileReader;
    const readAsDataURLMock = vi.fn();

    class MockFileReader {
      result: string | null = null;
      onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;

      readAsDataURL() {
        readAsDataURLMock();
        this.result = 'data:image/png;base64,ZmFrZS1pbWFnZQ==';
        this.onload?.({} as ProgressEvent<FileReader>);
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(readAsDataURLMock).toHaveBeenCalled();
    });

    globalThis.FileReader = originalFileReader;
  });

  it('does not break form assumptions when optional sections are empty', () => {
    const onSubmit = vi.fn();
    render(<PrefilledFormWrapper onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /esporta pdf/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('exposes export-progress UX contract via isExporting prop', () => {
    const onExportStateChange = vi.fn();
    render(<FormWrapper onExportStateChange={onExportStateChange} />);

    const submitButton = screen.getByRole('button', { name: /esporta pdf/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
});
