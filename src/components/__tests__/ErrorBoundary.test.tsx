import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from '../ErrorBoundary';

function ThrowingChild(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  test('renders the default fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/qualcosa è andato storto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ricarica la pagina/i })).toBeInTheDocument();

    consoleError.mockRestore();
  });

  test('renders a custom fallback and resets the boundary', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = vi.fn();

    render(
      <ErrorBoundary
        fallback={(reset) => (
          <button
            type="button"
            onClick={() => {
              onReset();
              reset();
            }}
          >
            riprova
          </button>
        )}
      >
        <ThrowingChild />
      </ErrorBoundary>,
    );

    const resetButton = screen.getByRole('button', { name: /riprova/i });
    resetButton.click();

    expect(onReset).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });
});
