# Architettura EasyPIVA

## Panoramica

- Applicazione single-page React basata su Vite, TypeScript e React Router.
- Tutti i calcoli fiscali vengono eseguiti localmente nel browser.
- Lo stato persistente è limitato alle preferenze utente in `localStorage`.

## Struttura progetto

```
src/
├── pages/          # Pagina calcolatori e informativa
├── components/     # Layout, DisclaimerModal
├── lib/
│   ├── calculations/   # Logica fiscale (forfettario, INPS, comparison, targetNet, planning)
│   ├── fiscal-data.ts  # Costanti fiscali 2026 (IRPEF, INPS, ATECO, limiti)
│   ├── public-copy.ts  # Copy centralizzata per gli avvisi di soglia
│   ├── format.ts       # Formattazione numeri/currency
│   └── theme.ts        # Gestione tema light/dark
├── store/          # Zustand stores (disclaimer, tema)
├── test/           # Setup test
components/ui/      # Componenti shadcn/ui (7 utilizzati)
```

## Aree principali

- `src/pages/` ospita i calcolatori pubblici e le pagine informative.
- `src/lib/calculations/` contiene formule e soglie fiscali.
- `src/store/` conserva le preferenze di disclaimer e tema.
- `components/ui/` fornisce i primitivi UI condivisi.

## Flusso dati

1. L'utente inserisce i dati in un componente di pagina.
2. La pagina richiama un helper di calcolo da `src/lib/calculations/`.
3. L'helper restituisce un risultato tipizzato e gli eventuali avvisi di soglia.
4. La pagina renderizza localmente il risultato, i grafici e i messaggi.

## Routing

- `/` - Home (dashboard)
- `/calcolatore` - Forfettario 2026 (3-step wizard)
- `/confronto` - Forfettario vs Ordinario
- `/contributi` - Simulatore INPS
- `/quanto-fatturare` - Calcolo inverso fatturato
- `/pianificazione` - Proiezione mensile ricavi
- `/informativa` - Privacy, disclaimer, fonti normative
- `/*` - 404 (NotFound)

## Copy centralizzata

Gli avvisi di soglia fiscali sono centralizzati in `src/lib/public-copy.ts`. Il resto della copy pubblica principale resta definito nei componenti e nelle pagine che la espongono.

## Vincoli

- Nessuna persistenza lato server.
- Nessun sistema di account.
- La copia legale e fiscale deve restare allineata alle assunzioni di calcolo.
