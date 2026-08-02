import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, test } from 'vitest';

import Layout from '../Layout';

describe('Layout', () => {
  test('identifies the current page and labels the mobile theme control', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen
        .getAllByRole('link', { name: 'Dashboard' })
        .every((link) => link.getAttribute('aria-current') === 'page'),
    ).toBe(true);
    expect(screen.getByRole('button', { name: 'Attiva modalità scura' })).toBeInTheDocument();
  });

  test('links the footer GitHub icon to the repository', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const repositoryLink = screen.getByRole('link', { name: 'GitHub repository EasyPIVA' });

    expect(repositoryLink).toHaveAttribute('href', 'https://github.com/TheStreamCode/easypiva');
    expect(repositoryLink).toHaveAttribute('target', '_blank');
    expect(repositoryLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
