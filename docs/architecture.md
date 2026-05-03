# Architettura EasyPIVA

## Panoramica

EasyPIVA è una single-page application React basata su Vite e TypeScript. L'app è progettata per eseguire simulazioni fiscali e generazione di preventivi direttamente nel browser, senza backend applicativo, account utente o persistenza lato server.

L'architettura separa in modo netto UI, logica fiscale pura, stato client-side e generazione del preventivo. Le assunzioni fiscali restano centralizzate nel codice e documentate tramite ADR dedicato.

## Runtime applicativo

- Il routing è gestito con `react-router-dom` in `src/App.tsx`.
- Le pagine principali sono lazy-loaded per ridurre il carico iniziale.
- La build di produzione viene generata in `dist/` tramite `npm run build`.
- `vercel.json` applica la rewrite verso `index.html` per supportare il routing client-side su hosting statico.
- La CI GitHub usa Node.js 20 ed esegue `npm run ci` definito in `package.json`.

## Mappa delle route

| Route               | Pagina                        | Responsabilità                                                        |
| ------------------- | ----------------------------- | --------------------------------------------------------------------- |
| `/`                 | `src/pages/Home.tsx`          | Dashboard e navigazione verso i calcolatori                           |
| `/calcolatore`      | `src/pages/Calculator.tsx`    | Simulazione regime forfettario                                        |
| `/confronto`        | `src/pages/Comparison.tsx`    | Confronto forfettario vs ordinario                                    |
| `/contributi`       | `src/pages/Contributions.tsx` | Simulatore contributi INPS                                            |
| `/quanto-fatturare` | `src/pages/TargetNet.tsx`     | Calcolo inverso fatturato per netto obiettivo                         |
| `/pianificazione`   | `src/pages/Planning.tsx`      | Pianificazione ricavi mensili                                         |
| `/preventivo`       | `src/pages/QuoteBuilder.tsx`  | Editor preventivo, anteprima A4, autosalvataggio locale ed export PDF |
| `/informativa`      | `src/pages/Sources.tsx`       | Disclaimer, privacy e fonti normative                                 |
| `*`                 | `src/pages/NotFound.tsx`      | Fallback 404                                                          |

## Struttura del codice

```text
src/
  App.tsx                  # Router e lazy loading delle pagine
  pages/                   # Route pubbliche
  components/              # Layout e componenti applicativi condivisi
  lib/
    calculations/          # Logica fiscale pura e testata
    quote/                 # Modello preventivo, paginazione ed export PDF
    fiscal-data.ts         # Costanti fiscali 2026
    number-input.ts        # Normalizzazione input numerici non negativi
    public-copy.ts         # Copy centralizzata per warning e messaggi pubblici
    theme.ts               # Inizializzazione e persistenza del tema
  store/                   # Zustand store per disclaimer e tema
  test/                    # Setup Vitest
components/ui/             # Primitivi UI condivisi
tests/e2e/                 # Test end-to-end Playwright
```

## Flusso dati

### Calcolatori fiscali

1. La pagina raccoglie gli input dell'utente.
2. I dati vengono passati agli helper in `src/lib/calculations/`.
3. La logica restituisce risultati tipizzati, disponibilita del regime ed eventuali warning.
4. La UI renderizza risultati, grafici e copy senza round-trip verso server.

Note operative:

- Nel calcolatore forfettario, `contributiVersati` funziona come override opzionale; se vale `0`, il dominio usa la stima INPS della cassa selezionata come contributo dedotto e mostrato in UI.
- Le viste `Calculator`, `Comparison` e `TargetNet` usano lo stato `available` per distinguere tra simulazione valida e caso oltre soglia di uscita immediata.

### Preventivo

1. `src/pages/QuoteBuilder.tsx` gestisce il form tramite React Hook Form e `zodResolver`.
2. La bozza viene salvata automaticamente in `localStorage` con debounce.
3. L'anteprima A4 deriva dallo stato corrente del form.
4. L'export PDF usa il DOM renderizzato come fonte di verità, ma passa sempre dalla validazione del form.

Note operative:

- Se lo storage locale non e disponibile o esaurisce lo spazio, la UI mostra un warning esplicito invece di fallire in silenzio.
- Il logo del preventivo viene salvato nella bozza solo entro un limite dimensionale conservativo per ridurre errori di persistenza.
- Il disclaimer iniziale e modellato come dialog non dismissibile: si chiude solo dopo conferma esplicita.

## Persistenza client-side

L'app non salva dati su server, ma usa `localStorage` per tre casi precisi.

| Chiave                        | Modulo responsabile                              | Contenuto                                                                           |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `easypiva-disclaimer-storage` | `src/store/useStore.ts`                          | Stato di accettazione del disclaimer                                                |
| `easypiva-theme-mode`         | `src/store/useThemeStore.ts`, `src/lib/theme.ts` | Preferenza tema `light` o `dark`                                                    |
| `easypiva.quote-draft`        | `src/pages/QuoteBuilder.tsx`                     | Bozza del preventivo, incluse anagrafiche, righe, pagamenti, note ed eventuale logo |

La chiave legacy `easypiva-storage` viene letta solo per migrare vecchi dati del disclaimer e non viene più usata come storage principale.

## Qualità e test

- I test unitari e di integrazione UI sono eseguiti con Vitest.
- I test end-to-end sono raccolti in `tests/e2e/` con Playwright e girano su `http://127.0.0.1:4173` tramite `npm run dev:e2e`.
- Il comando di riferimento per la verifica locale completa è `npm run ci`, che include format check, TypeScript, ESLint, Vitest, build e Playwright.
- GitHub Actions installa Chromium prima della CI, così gli E2E sono parte della verifica automatica su push e pull request.

## Automazioni GitHub

- `.github/workflows/ci.yml` esegue la pipeline applicativa con permessi minimi.
- `.github/workflows/dependency-review.yml` controlla le pull request che modificano dipendenze.
- `.github/dependabot.yml` mantiene aggiornati npm e GitHub Actions con pull request schedulate.
- `.github/ISSUE_TEMPLATE/` e `.github/pull_request_template.md` standardizzano triage e review mantenendo il workflow `maintainers-only`.

## Vincoli architetturali

- Nessun backend applicativo o sistema di autenticazione.
- Tutte le formule fiscali devono restare pure e verificabili.
- La documentazione su privacy e storage deve riflettere il comportamento reale di `localStorage`.
- Ogni modifica alle assunzioni fiscali richiede aggiornamento coordinato tra codice, ADR e copy pubblica.
