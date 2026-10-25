import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { NumberInput } from '../NumberInput';

function Harness({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div>
      <NumberInput aria-label="Importo" value={value} onValueChange={setValue} />
      <div data-testid="numeric-value">{value}</div>
    </div>
  );
}

describe('NumberInput', () => {
  test('keeps a trailing decimal separator while typing', () => {
    render(<Harness />);

    const input = screen.getByLabelText('Importo');
    fireEvent.change(input, { target: { value: '1,' } });

    expect(input).toHaveValue('1,');
    expect(screen.getByTestId('numeric-value')).toHaveTextContent('1');
  });

  test('parses both decimal separators', () => {
    render(<Harness />);

    const input = screen.getByLabelText('Importo');
    fireEvent.change(input, { target: { value: '1,5' } });
    expect(screen.getByTestId('numeric-value')).toHaveTextContent('1.5');

    fireEvent.change(input, { target: { value: '2.75' } });
    expect(screen.getByTestId('numeric-value')).toHaveTextContent('2.75');
  });

  test('rejects negative and non-numeric text as zero', () => {
    render(<Harness />);

    const input = screen.getByLabelText('Importo');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.getByTestId('numeric-value')).toHaveTextContent('0');
  });

  test('re-syncs the displayed text when the value changes from outside', () => {
    const { rerender } = render(
      <NumberInput aria-label="Importo" value={12} onValueChange={() => {}} />,
    );
    const input = screen.getByLabelText('Importo');
    expect(input).toHaveValue('12');

    rerender(<NumberInput aria-label="Importo" value={0} onValueChange={() => {}} />);
    expect(input).toHaveValue('');
  });
});
