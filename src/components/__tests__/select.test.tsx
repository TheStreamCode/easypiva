import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

describe('Select', () => {
  test('non forza il positioner a tutta larghezza del viewport', async () => {
    render(
      <Select defaultOpen defaultValue="artigiani">
        <SelectTrigger aria-label="Tipo INPS" className="w-full">
          <SelectValue placeholder="Seleziona una voce" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="artigiani">Gestione Artigiani INPS</SelectItem>
          <SelectItem value="commercianti">Gestione Commercianti INPS</SelectItem>
        </SelectContent>
      </Select>,
    );

    const popup = await screen.findByText('Gestione Artigiani INPS');

    expect(popup).not.toBeNull();
    expect(popup.closest('[data-slot="select-content"]')?.parentElement).not.toHaveClass('w-full');
  });

  test('permette al valore selezionato di restringersi senza rompere il trigger', () => {
    render(
      <Select defaultValue="artigiani">
        <SelectTrigger aria-label="Tipo INPS" className="w-full">
          <SelectValue placeholder="Seleziona una voce" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="artigiani">Gestione Artigiani INPS</SelectItem>
        </SelectContent>
      </Select>,
    );

    const value = document.querySelector('[data-slot="select-value"]');

    expect(value).toHaveClass('min-w-0');
    expect(value).toHaveClass('truncate');
  });

  test('manda a capo le voci lunghe senza mantenerle rigidamente su una sola riga', async () => {
    render(
      <Select defaultOpen defaultValue="ateco">
        <SelectTrigger aria-label="Categoria ATECO" className="w-full">
          <SelectValue placeholder="Seleziona una voce" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ateco">
            Fabbricazione di apparecchi per istituti di bellezza e centri benessere molto lunghi
          </SelectItem>
        </SelectContent>
      </Select>,
    );

    await screen.findByText(/Fabbricazione di apparecchi/i);

    const itemText = document.querySelector(
      '[data-slot="select-item"] [class*="whitespace-normal"]',
    );

    expect(itemText).toHaveClass('whitespace-normal');
    expect(itemText).toHaveClass('break-words');
    expect(itemText).not.toHaveClass('shrink-0');
  });

  test('apre il popup sotto il trigger invece di allineare la voce selezionata sopra il campo', async () => {
    render(
      <Select defaultOpen defaultValue="ateco-8">
        <SelectTrigger aria-label="Categoria ATECO" className="w-full">
          <SelectValue placeholder="Seleziona una voce" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ateco-1">Voce 1</SelectItem>
          <SelectItem value="ateco-2">Voce 2</SelectItem>
          <SelectItem value="ateco-3">Voce 3</SelectItem>
          <SelectItem value="ateco-4">Voce 4</SelectItem>
          <SelectItem value="ateco-5">Voce 5</SelectItem>
          <SelectItem value="ateco-6">Voce 6</SelectItem>
          <SelectItem value="ateco-7">Voce 7</SelectItem>
          <SelectItem value="ateco-8">Voce 8</SelectItem>
        </SelectContent>
      </Select>,
    );

    const popup = (await screen.findByText('Voce 8')).closest('[data-slot="select-content"]');

    expect(popup).toHaveAttribute('data-align-trigger', 'false');
  });
});
