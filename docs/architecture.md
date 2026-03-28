# Architettura EasyPIVA

## Panoramica

- Applicazione single-page React basata su Vite, TypeScript e React Router.
- Tutti i calcoli fiscali vengono eseguiti localmente nel browser.
- Lo stato persistente è limitato alle preferenze utente in `localStorage`.

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

## Vincoli

- Nessuna persistenza lato server.
- Nessun sistema di account.
- La copia legale e fiscale deve restare allineata alle assunzioni di calcolo.
