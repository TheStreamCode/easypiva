# AGENTS.md - EasyPIVA

Guida operativa per agenti AI e maintainer che lavorano su questo repository. Le regole qui descritte prevalgono sulle abitudini generiche: EasyPIVA è uno strumento fiscale usato da persone reali e un errore su una soglia o su un'aliquota ha conseguenze concrete.

## Panoramica e finalità

EasyPIVA è una single-page application client-side che fornisce **simulazioni fiscali indicative** per la Partita IVA italiana (regime forfettario, contributi INPS, confronto con il regime ordinario, calcolo inverso del fatturato, pianificazione ricavi) e un generatore di preventivi con export PDF.

- Repository **pubblico**, licenza MIT, workflow `maintainers-only` (vedi `CONTRIBUTING.md`).
- Nessun backend applicativo, nessun account utente, nessuna telemetria: tutto viene eseguito nel browser.
- Distribuzione: build statica Vite pubblicata su Vercel (<https://easypiva.vercel.app>).
- Non è un pacchetto npm (`"private": true`) e non è una VS Code extension: nessun `npm publish`, nessun `.vsix`.

## Stack e runtime

- React 19, React Router 8, TypeScript 6, Vite 6.
- Tailwind CSS v4 tramite `@tailwindcss/vite` (nessuna pipeline PostCSS: non aggiungere `postcss.config.*` né `autoprefixer`).
- Primitivi UI Base UI / shadcn in `components/ui/`; `src/index.css` importa `shadcn/tailwind.css`, quindi `shadcn` è una dipendenza di build reale e non solo una CLI.
- Zustand per lo stato client, React Hook Form + Zod per i form.
- Recharts, motion, jsPDF e html2canvas per grafici, animazioni ed export PDF.
- Vitest (jsdom) per unit/UI, Playwright (chromium) per gli E2E.
- **Runtime richiesto:** Node.js 24 LTS (`.nvmrc`, `engines.node >= 24`) e npm 11 (`packageManager`).
- **Package manager obbligatorio:** npm. Non introdurre pnpm, yarn o bun e non aggiungere un secondo lockfile.

## Struttura del repository

```text
src/
  App.tsx                  # Router e lazy loading delle pagine
  pages/                   # Route pubbliche
  components/              # Layout, disclaimer, componenti del preventivo
  lib/
    calculations/          # Logica fiscale pura (forfettario, inps, comparison, targetNet, planning)
    quote/                 # Modello preventivo, paginazione, export PDF
    fiscal-data.ts         # Soglie, aliquote, coefficienti ATECO 2026
    number-input.ts        # Normalizzazione input numerici non negativi
    public-copy.ts         # Copy centralizzata dei warning fiscali
    browser-storage.ts     # Unico accesso consentito a localStorage
    theme.ts               # Inizializzazione e persistenza del tema
  store/                   # Store Zustand (disclaimer, tema)
  test/                    # Setup Vitest e mock di storage
components/ui/             # Primitivi UI condivisi (alias @/components/)
tests/e2e/                 # Playwright
docs/                      # architecture.md, privacy-and-storage.md, ADRs/, repository-governance.md
.github/                   # CI, dependency review, Dependabot, CODEOWNERS, template
```

## Comandi (verificati)

```bash
npm ci                # Install riproducibile (usa sempre questo, non npm install ad hoc)
npm run dev           # Dev server su http://127.0.0.1:3000
npm run dev:e2e       # Dev server dedicato agli E2E su http://127.0.0.1:4173
npm run build         # Build di produzione in dist/
npm run preview       # Anteprima della build
npm run clean         # Rimuove dist/
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm run format        # prettier . --write
npm run format:check  # prettier . --check
npm run test          # vitest run
npm run test:watch    # vitest in watch
npm run test:e2e      # playwright test (richiede chromium installato)
npm run ci            # format:check + typecheck + lint + test + build + test:e2e
```

Se Playwright segnala browser mancanti: `npx playwright install chromium`.
Non esiste uno script di deploy nel repository: il deployment è gestito da Vercel a partire da `main`.

## Regole fiscali (area critica)

- **Non modificare aliquote, coefficienti, soglie o formule senza una fonte primaria verificabile** (Agenzia delle Entrate, Circolari INPS, legge di bilancio). Cita la fonte nel commit e nell'ADR.
- Tutte le costanti fiscali vivono in `src/lib/fiscal-data.ts`. Non duplicarle nelle pagine né nei componenti.
- Ogni cambiamento fiscale richiede un aggiornamento **coordinato** di: costante in `fiscal-data.ts`, logica in `src/lib/calculations/`, test corrispondenti, `docs/ADRs/0001-fiscal-assumptions.md`, copy pubblica (`src/lib/public-copy.ts`, `src/pages/Sources.tsx`) e `CHANGELOG.md`.
- La logica in `src/lib/calculations/` deve restare **pura**: nessun accesso a `window`, storage, rete o data corrente.
- I warning verso l'utente passano dal pattern `DomainWarning` + `warningCopy`; non scrivere messaggi fiscali inline nelle pagine.
- Il disclaimer ("stime indicative, non consulenza fiscale") è parte del prodotto: è presente nel modale iniziale, in `/informativa` e nel README. **Non rimuoverlo né attenuarlo.**
- Se emergono incoerenze tra codice, test e documentazione fiscale, **segnalale** invece di correggerle a intuito.

## Convenzioni di codice

- La copy UI è in italiano; il codice, i nomi e i commenti tecnici in inglese o italiano tecnico, coerentemente con il file.
- Import: `@/` per `src/`, `@/components/` per i primitivi UI. Usa `import type` per i tipi.
- Usa `cn()` per il merge delle classi Tailwind.
- Normalizza gli input numerici con `parseNonNegativeNumber` invece di `Number(...)` ad hoc.
- Ogni accesso a `localStorage` passa da `src/lib/browser-storage.ts` (gestisce SSR, quota esaurita e storage disabilitato).
- Prettier è la fonte di verità sulla formattazione: non riformattare a mano, esegui `npm run format`.
- Commenti sparsi e utili; niente commenti che ripetono il codice.

## Testing

- Aggiungi o aggiorna test Vitest per **ogni** cambiamento di comportamento fiscale.
- Aggiungi test UI quando cambiano validazione dei form o copy visibile all'utente.
- Mantieni Playwright sulla porta dedicata 4173 (`npm run dev:e2e`); non riusare la 3000.
- `npm run ci` deve essere verde prima di considerare il lavoro concluso.

## File generati e da non modificare a mano

- `package-lock.json`: aggiornalo solo tramite npm.
- `dist/`, `test-results/`, `playwright-report/`, `tsconfig.tsbuildinfo`, `node_modules/`: generati, ignorati da Git.
- `docs/assets/easypiva-dashboard.png`: asset di prodotto. Non sostituirlo, ridimensionarlo o ricomprimerlo (provenienza in `docs/asset-provenance.md`).
- `components/ui/`: primitivi generati da shadcn. Preferisci l'estensione a monte invece della modifica invasiva.
- Il commento su `DISABLE_HMR` in `vite.config.ts` è intenzionale: non rimuoverlo.

## Sicurezza e variabili d'ambiente

- Il progetto **non usa variabili d'ambiente applicative** e non ha `.env.example`: non introdurne senza una necessità reale. Qualsiasi valore inserito in un bundle Vite (`VITE_*`) è pubblico.
- `.env*` è già in `.gitignore`. Non committare mai token, chiavi o dati di clienti.
- Le GitHub Actions sono fissate a commit SHA completi con il tag in commento: mantieni questa convenzione.
- `allowScripts` in `package.json` è l'allowlist npm 11 degli install script: aggiungi voci solo dopo aver revisionato lo script (`npm approve-scripts --allow-scripts-pending` elenca i pendenti).
- Dependabot apre solo aggiornamenti di sicurezza (`open-pull-requests-limit: 0` sui version update): non riattivare i version update senza una decisione esplicita del maintainer.
- Le vulnerabilità si segnalano privatamente secondo `SECURITY.md`, mai via issue pubbliche.

## Anti-breaking-change e compatibilità

- Non cambiare le chiavi di `localStorage` (`easypiva-disclaimer-storage`, `easypiva-theme-mode`, `easypiva.quote-draft`) senza una migrazione: gli utenti perderebbero bozze di preventivo reali.
- Non cambiare i path delle route (`/calcolatore`, `/confronto`, `/contributi`, `/quanto-fatturare`, `/pianificazione`, `/preventivo`, `/informativa`): sono link pubblici.
- Preserva l'architettura local-first: niente backend, niente analytics, niente richieste di rete a runtime.
- Non modificare la firma dei risultati esportati da `src/lib/calculations/` senza aggiornare tutti i consumatori e i test.

## Versioning, release e pubblicazione

- SemVer. La versione è replicata in `package.json`, `package-lock.json`, `README.md` e `CITATION.cff`: **vanno aggiornati insieme**.
- Il branch `main` è protetto: pull request obbligatoria, 1 approvazione, conversazioni risolte, branch aggiornato, storia lineare, check `build` e `dependency-review` obbligatori. Niente push diretti, niente force push, niente riscrittura della storia.
- Flusso di release: branch dedicato → `npm run ci` verde → PR con template compilato → merge squash → tag `vX.Y.Z` → GitHub Release. Il dettaglio è in `docs/repository-governance.md`.
- Non esiste pubblicazione su registry: il pacchetto è `private` e la distribuzione avviene solo tramite il deploy Vercel di `main`.

## Criteri di validazione obbligatori

Prima di dichiarare completato un lavoro:

1. `npm ci` (o `npm install` se hai cambiato dipendenze, così il lockfile resta coerente);
2. `npm run ci` completamente verde;
3. `npm audit` senza vulnerabilità nuove;
4. documentazione, changelog e versione allineati alle modifiche reali;
5. nessun segreto, artefatto o file locale nel diff.

## Istruzioni per agenti AI

- Trattandosi di repository pubblico, presumi che ogni riga di codice, commit e documento sia leggibile da chiunque.
- Non inventare fonti normative, badge, statistiche o risultati di comandi: riporta l'output reale.
- Non disabilitare test, lint o controlli per farli passare.
- Preferisci diff piccoli e motivati; evita refactoring estetici che non portano beneficio.
- Se un'informazione fiscale non è verificabile con una fonte primaria, segnalala nel riepilogo invece di modificarla.
