import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import Layout from '../Layout';

describe('Layout', () => {
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
