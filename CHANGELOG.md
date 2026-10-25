# Changelog

Tutte le modifiche rilevanti a EasyPIVA vengono tracciate in questo file.

## [Unreleased]

- corretto il limite dei redditi da lavoro dipendente e assimilati per l'accesso al regime forfettario: 30.000€ (art. 233, comma 1, lett. f, TUIR 2026 — D.Lgs. 117/2026) invece di 35.000€, con test sui valori di soglia (29.999/30.000/30.001) e aggiornamento di copy pubblica e ADR fiscale.
- aggiornate le fonti normative pubbliche al quadro vigente: TUIR 2026 (D.Lgs. 117/2026, artt. 11, 13, 232-243 e Allegato D) e TU-IVA 2026 (D.Lgs. 10/2026) nella pagina Informativa, nell'ADR fiscale, nei README e nei commenti delle costanti, al posto della L. 190/2014 i cui commi 54-89 sono abrogati; aggiunto un test che verifica i link alle fonti primarie.
- reso recuperabile il preventivo: aggiunti un ErrorBoundary globale e uno dedicato alla pagina con azione di ripristino della bozza, paginazione protetta con messaggio accessibile al posto del crash, limiti di lunghezza su titolo, note, voci e campi anagrafici, e troncamento automatico delle bozze salvate non più impaginabili.
- rimosso l'inserimento di dati dimostrativi nel preventivo: i campi opzionali vuoti non vengono più sostituiti con P.IVA, codice fiscale, città e recapiti fittizi, che finivano nel documento esportato; aggiunto un test end-to-end che esporta un PDF compilando solo i campi obbligatori.
- corretto il budget verticale dell'impaginazione A4: il contenuto viene dimensionato sul box reale (257 mm) e tiene conto dei 4 mm tra i blocchi, evitando sezioni tagliate in anteprima e nel PDF; aggiunto un test end-to-end che verifica l'assenza di overflow.
- resi coerenti e trasparenti i numeri fiscali: la torta del calcolatore somma ai ricavi, il confronto regimi sottrae gli stessi costi effettivi a entrambi i regimi, il delta non è mostrato quando il forfettario non è applicabile e sono esplicitati IRAP/INAIL/cassa/acconti esclusi; chiarito che il "netto" mostrato non sottrae i costi effettivi.
- prorazionato il contributo fisso INPS per i mesi di attività inferiori all'anno e bloccate le simulazioni non eleggibili (spese per dipendenti oltre 20.000€, redditi da lavoro dipendente oltre 30.000€); allineate le etichette ATECO all'Allegato D del TUIR 2026.
- aggiunta nel preventivatore una nota sulle regole IVA del regime forfettario (nessuna rivalsa, motivazione dell'esenzione, fatturazione elettronica).
- migliorata l'esperienza mobile e l'accessibilità: anteprima A4 sempre interamente visibile con pinch-zoom e zoom rotella non passivo, barra CTA sotto l'header, target di tocco da 44 px, contrasto dei testi secondari in dark mode, palette dei grafici leggibile con legenda in colore di primo piano, menu mobile scorrevole, titoli che vanno a capo con testo ingrandito al 200% e input numerici con tastiera decimale.
- introdotto un input numerico che conserva il testo durante la digitazione: ora è possibile inserire importi con virgola o punto decimale in calcolatore, confronto, contributi, quanto fatturare e pianificazione, con normalizzazione al blur.
- migliorata l'accessibilità dei form: errori associati ai campi con `aria-invalid`/`aria-describedby`, focus sul primo campo non valido, wizard con progressbar annunciata, risultati del calcolatore annunciati, suggerimenti di compilazione automatica nel preventivo e bottone "Ingrandisci" visibile da tastiera.
- rifinita la copy italiana ("Città", "Validità", "Unità", "non è più disponibile", toggle tema e chiusura dialoghi in italiano) e completato `llms.txt` con le tre route mancanti (quanto fatturare, pianificazione, preventivo).
- aggiornate le dipendenze transitive con le correzioni non-breaking di `npm audit` (ora nessuna vulnerabilità nota) e aggiunto il controllo `npm audit` alla pipeline CI.
- l'export PDF del calcolatore carica `jsPDF` solo quando l'utente esporta, togliendo la libreria dal bundle iniziale della pagina.
- escluse da ESLint e Prettier le directory di lavoro locali (`.review`, `.tmp`, coverage, report di test) per evitare che artefatti non versionati facciano fallire i controlli.

## [1.1.1] - 2026-08-08

- corretto il calcolo INPS 2026 per Artigiani e Commercianti distinguendo il massimale di 93.707€ per chi possiede anzianità contributiva al 31 dicembre 1995 dal massimale di 122.295€ applicabile negli altri casi, con scelta esplicita nei tre simulatori e nel confronto regimi;
- documentate le due fasce di massimale nell'ADR fiscale e nella pagina informativa, ora collegata direttamente alle fonti normative primarie;
- corrette la data predefinita del preventivo affinché usi il giorno locale e la persistenza dell'ultima modifica ancora in debounce alla chiusura della pagina;
- limitato l'upload del logo a PNG, JPEG e WebP entro 1 MB, sanificando anche le bozze già archiviate e mostrando messaggi accessibili in caso di errore;
- aggiunto un messaggio accessibile quando la generazione PDF fallisce;
- migliorata l'accessibilità con skip link, titoli documento per route, menu mobile modale con gestione nativa di focus ed Escape, etichetta testuale del grafico del calcolatore e contrasto corretto nella hero;
- eliminato il layout shift del primo caricamento rendendo eager la piccola home e mantenendo il lazy loading per le route applicative più pesanti;
- aggiunti test axe end-to-end sulle otto route pubbliche e test unitari per massimali INPS, data locale, logo e gestione errori;
- aggiunti `robots.txt`, `sitemap.xml` e `llms.txt` statici per rendere esplicite le route pubbliche e la natura informativa del progetto;
- riorganizzato il README in modo product-first, chiarito l'ambito delle issue e aggiunta una social preview GitHub dedicata con provenienza documentata;
- aggiornate le dipendenze transitive interessate dagli advisory npm; `npm audit` non rileva vulnerabilità note.

## [1.1.0] - 2026-08-02

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
- risolte 12 vulnerabilità `npm audit` locali aggiornando le dipendenze nei range consentiti;
- aggiunti header HTTP di sicurezza al deployment Vercel (CSP, anti-framing, anti-MIME-sniffing, referrer e permissions policy), con test di regressione sulla configurazione;
- migliorata l'accessibilità della navigazione e dell'anteprima preventivo con nome accessibile del toggle tema mobile, `aria-current` sulle route attive e scope espliciti sulle intestazioni della tabella;
- rispettata la preferenza `prefers-reduced-motion` nelle animazioni Motion, nella transizione del tema e nel fallback CSS.

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
