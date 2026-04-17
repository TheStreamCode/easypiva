import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DisclaimerModal } from '../DisclaimerModal';
import { useStore } from '@/store/useStore';

describe('DisclaimerModal', () => {
  beforeEach(() => {
    useStore.setState({ hasAcceptedDisclaimer: false });
  });

  test('requires explicit confirmation to accept the disclaimer', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<DisclaimerModal />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(useStore.getState().hasAcceptedDisclaimer).toBe(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ho compreso, inizia/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(useStore.getState().hasAcceptedDisclaimer).toBe(true);
    await waitFor(() => {
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
