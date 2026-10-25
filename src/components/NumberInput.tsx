import { useState, type ComponentProps } from 'react';

import { Input } from '@/components/ui/input';
import { parseNonNegativeNumber } from '@/lib/number-input';

type NumberInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  value: number;
  onValueChange: (value: number) => void;
};

function parseDecimalInput(raw: string) {
  return parseNonNegativeNumber(raw.trim().replace(',', '.'));
}

/**
 * Numeric input that keeps the raw text while the user types, so decimal
 * separators ("," or ".") are not swallowed by a numeric re-render.
 */
export function NumberInput({ value, onValueChange, onBlur, ...props }: NumberInputProps) {
  const [raw, setRaw] = useState(() => (value > 0 ? String(value) : ''));
  const parsedRaw = parseDecimalInput(raw);
  // Show the raw text while it matches the numeric value; otherwise show the
  // canonical value (e.g. after an external reset).
  const displayValue = parsedRaw === value ? raw : value > 0 ? String(value) : '';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextRaw = event.target.value;
    setRaw(nextRaw);
    onValueChange(parseDecimalInput(nextRaw));
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      onBlur={(event) => {
        // Normalize partial or invalid text (e.g. "-100" or "12,") to the
        // numeric value actually used by the simulation.
        setRaw(value > 0 ? String(value) : '');
        onBlur?.(event);
      }}
    />
  );
}
