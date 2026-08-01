# Changelog

Tutte le modifiche rilevanti a EasyPIVA vengono tracciate in questo file.

## [Unreleased]

Nessuna modifica in attesa di rilascio.

## [1.1.0] - 2026-08-01

- rimosse le devDependencies inutilizzate `@types/express` (nessun uso di Express nel progetto) e `autoprefixer` (il progetto non ha una pipeline PostCSS: Tailwind CSS v4 passa da `@tailwindcss/vite`), per un totale di 14 pacchetti in meno nell'albero di installazione;
- aggiunti i metadata `bugs` e `keywords` in `package.json`, allineati ai topic GitHub del repository;
- aggiunti `repository-code` e `date-released` a `CITATION.cff` e allineata la versione citabile;
- ignorati `.playwright-mcp/` e `.vercel/` per evitare che artefatti locali di tooling finiscano nel branch principale;
- README esteso con link alla web app pubblicata, sezione di deployment su Vercel e struttura del repository;
- `AGENTS.md` riscritto come guida operativa completa per agenti e maintainer (architettura, comandi verificati, file generati, aree fiscali delicate, versioning, release e deployment);
- aggiunto `CITATION.cff` alla checklist di release in `docs/repository-governance.md`;
- aggiornato il runtime di sviluppo e CI da Node.js 20 EOL a Node.js 24 LTS, con `.nvmrc`, vincoli `engines`, npm dichiarato e tipi Node allineati;
- migrato il routing dichiarativo da `react-router-dom` 7 a `react-router` 8, eliminando l'alert di sicurezza relativo ai percorsi RSC non usati dall'app;
- corretto il calcolo inverso del fatturato affinché rispetti il massimale INPS anche per obiettivi elevati;
- corretto l'avviso per nuove attività con ricavi annualizzati oltre 85.000 euro ma ricavi effettivi sotto la soglia di uscita immediata;
- aggiunti `.gitattributes`, CODEOWNERS, pin SHA delle Actions e allowlist degli install script npm; riallineata la policy Dependabot agli aggiornamenti di sola sicurezza;
- rimossa la richiesta runtime a Google Fonts self-hostando Newsreader nel bundle, in coerenza con l'architettura local-first;
- ripristinata la type safety dopo gli aggiornamenti delle dipendenze e di TypeScript 6 (tipizzazione esplicita delle varianti Motion, gestione nullable dei callback Base UI Select, formatter Recharts tolleranti ai valori undefined, narrowing corretto nella paginazione preventivi, dichiarazione tipo per import CSS side-effect e generics Zustand persist allineati allo stato parzializzato);
- aggiornati TypeScript 5.8 → 6.0, ESLint 9 → 10 e `@eslint/js` 9 → 10; migrato `eslint-plugin-import` → `eslint-plugin-import-x` (supporto ESLint 10), con adeguamento di `eslint.config.js`;
- aggiornati i contributi INPS artigiani e commercianti ai valori 2026 (minimale 18.808 €, contributo fisso 4.521,36 € / 4.611,64 €) secondo la Circolare INPS 14/2026;
- introdotte l'aliquota IVS aggiuntiva del +1% sul reddito oltre 56.224 € e l'applicazione del massimale contributivo annuo;
- migliorato il confronto con il regime ordinario aggiungendo la detrazione per redditi di lavoro autonomo (art. 13 TUIR) e documentando l'aliquota media delle addizionali;
- corretta l'incoerenza del grafico del calcolatore quando si inseriscono manualmente i contributi versati;
- corretta la data della terza rata fissa INPS nella pagina contributi (16 novembre 2026);
- reso deterministico lo smoke test E2E restringendo i link alla navigazione, rimuovendo l'ambiguità con le card della home;
- allineate documentazione (ADR assunzioni fiscali) e pagina informativa ai dati 2026;
- uniformata la formattazione del codice sorgente con Prettier;
- risolte 12 vulnerabilità `npm audit` locali aggiornando le dipendenze nei range consentiti.

## [1.0.0] - 2026-05-03

- aggiunta governance GitHub con Dependabot, Dependency Review, template issue, template pull request e Code of Conduct;
- irrigidita la CI con permessi minimi, concurrency e test Playwright inclusi nel flusso `npm run ci`;
- aggiornate le GitHub Actions ufficiali a major compatibili con runtime Node 24;
- aggiornate README, CONTRIBUTING, SECURITY, architettura e AGENTS per documentare workflow npm, E2E e manutenzione supply-chain;
- corrette le scadenze INPS 2026 mostrate nella pagina contributi;
- centralizzata la normalizzazione degli input numerici non negativi nei calcolatori;
- aggiornate dipendenze npm entro i range patch/minor consentiti dal progetto.

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
