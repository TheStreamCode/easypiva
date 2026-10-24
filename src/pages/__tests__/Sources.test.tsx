import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import Sources from '../Sources';

describe('Sources page', () => {
  test('links the primary sources in force for 2026', () => {
    render(<Sources />);

    expect(screen.getByRole('link', { name: /TUIR 2026/i })).toHaveAttribute(
      'href',
      'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2026;117',
    );
    expect(screen.getByRole('link', { name: /TU-IVA 2026/i })).toHaveAttribute(
      'href',
      'https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2026;10',
    );
    expect(screen.getByRole('link', { name: /Circolare INPS 14\/2026/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Circolare INPS 8\/2026/i })).toBeInTheDocument();
  });

  test('no longer links the repealed L. 190/2014', () => {
    render(<Sources />);

    expect(screen.queryByRole('link', { name: /190\/2014/i })).not.toBeInTheDocument();
  });
});
