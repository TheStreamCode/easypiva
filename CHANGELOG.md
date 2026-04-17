# Changelog

Tutte le modifiche rilevanti a EasyPIVA vengono tracciate in questo file.

## [0.1.0] - 2026-04-17

Prima release documentata del repository su `main`.

- allineati metadata di release e versionamento del pacchetto a `0.1.0`;
- verificato il packaging del progetto: EasyPIVA è una web app Vite/React client-side, non una VS Code extension, quindi non prevede icone Marketplace o artefatti `.vsix`;
- aggiornate README e note di repository per chiarire branding, stato del progetto, processo di verifica e assenza di branch/PR aperte da integrare;
- ignorato `tsconfig.tsbuildinfo` per evitare rumore nel branch principale dovuto agli artefatti locali di TypeScript.
- corretta la semantica dei contributi nel calcolo forfettario, con risultati coerenti tra calcolatore, confronto tra regimi e target netto;
- reso esplicito quando il forfettario non è più disponibile oltre soglia, bloccando l'export PDF della simulazione non valida;
- irrigidito il flusso del preventivo: validazione obbligatoria prima dell'export, warning visibile in caso di autosalvataggio fallito e dipendenza `html2canvas` dichiarata esplicitamente;
- migliorata la resa del preventivo esportato con etichette leggibili per data e regime IVA, aggiungendo copertura test per regressioni fiscali, preview e disclaimer iniziale.
