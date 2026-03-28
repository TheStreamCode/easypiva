import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import Comparison from '@/pages/Comparison';
import Planning from '@/pages/Planning';

describe('Chart layout containers', () => {
  test('mantiene min-w-0 nella colonna del grafico di confronto', () => {
    const { container } = render(<Comparison />);

    const chartColumn = container.querySelector('div[class*="lg:col-span-2"]');

    expect(chartColumn).toHaveClass('min-w-0');
  });

  test('mantiene min-w-0 nella colonna del grafico di pianificazione', () => {
    const { container } = render(<Planning />);

    const chartColumn = container.querySelector('div[class*="lg:col-span-8"]');

    expect(chartColumn).toHaveClass('min-w-0');
  });
});
