# EasyPIVA — Review completa: codice, fisco/IVA e UI/UX desktop-mobile

**Data:** 24 ottobre 2026 (Europe/Rome)
**Commit revisionato:** `61cfcf8` (stato del repository al momento della revisione)
**Modalità:** revisione read-only sul checkout locale, con build e test reali e verifica in browser.
**Ambito:** codice, regole IVA/imposte/contributi 2026, UI/UX desktop e mobile (mobile-first e responsive), accessibilità.
**Stato:** documento storico. I rilievi P0, P1 e i residui P2 sono stati corretti su `main` fino al commit `6f31e91` (25 ottobre 2026); il report resta come traccia delle verifiche e delle fonti usate. Le evidenze citate in `.review/` erano artefatti locali non versionati.

---

## 0. Esito sintetico

| Area                              | Giudizio   | Nota                                                                                                                                            |
| --------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Architettura e qualità del codice | **7,5/10** | Layer puliti, calcoli puri e testati, nessuna XSS/telemetria; problemi gravi concentrati nel preventivo                                         |
| Correttezza fiscale 2026          | **5/10**   | Valori INPS/IRPEF verificati corretti, ma soglia di accesso errata, citazioni normative abrogate, alcune grandezze chiamate "netto" non lo sono |
| UI/UX desktop                     | **8/10**   | Layout solido, density corretta, buona a11y di base; difetti a 1024 px e su grafici/contrasto                                                   |
| UI/UX mobile-first                | **7/10**   | Base responsive reale (zero overflow orizzontale su 8 route × 8 viewport), ma i flussi mobile chiave hanno bug concreti                         |

**Il verdetto in una riga:** il progetto è tecnicamente ben fatto, ma oggi (a) usa una soglia di legge sbagliata, (b) cita norme abrogate dal nuovo TUIR 2026, (c) mostra numeri etichettati "netto" che non sono un netto, e (d) il preventivo — il flusso più delicato perché produce un documento commerciale — ha un crash permanente, contenuti tagliati nel PDF e dati demo inventati nel documento esportato.

**Verifiche eseguite (tutte reali):** `typecheck` 0, `lint` 0, `format:check` 0, Vitest **25 file / 138 test passati**, build di produzione verde, Playwright E2E **14/14 passati**, verifica numerica indipendente **93/93 check**, riproduzione del crash bianco in browser, Lighthouse mobile su 3 pagine × 2 temi × 2 origini, 53 screenshot a 8 viewport. `npm audit`: 10 vulnerabilità (1 critica, 4 alte, 5 moderate) tutte con fix non-breaking disponibili.

---

## 1. Priorità operative

### P0 — da correggere prima della prossima release

1. **Soglia redditi lavoro dipendente: 30.000 €, non 35.000 €** (`src/lib/fiscal-data.ts:76`, `src/lib/public-copy.ts:25`, `src/pages/Calculator.tsx:404`, `docs/ADRs/0001-fiscal-assumptions.md:45`). Errore legale di eleggibilità al regime forfettario.
2. **Crash bianco permanente del preventivo**: la paginazione lancia in render e non esiste alcun ErrorBoundary; la bozza difettosa resta in `localStorage` e ricrasha a ogni reload (`src/lib/quote/pagination.ts:111-115,199-241`, `QuotePreview.tsx:16`, `QuoteExportPages.tsx:10`). Riprodotto in browser: titolo lungo 3.720 caratteri → `#root` con 0 figli, body vuoto, console `Uncaught Error: Block header exceeds the available page height.`
3. **Dati demo inventati nel documento esportato**: con i campi opzionali vuoti il PDF mostra P.IVA cliente `IT10987654321`, città `00186 Roma RM`, CF fornitore `RSSMRA90A01F205X`, telefono e sito finti (`QuoteBuilder.tsx:134-181` + `lib/quote/placeholders.ts`).
4. **Allineamento normativo**: L. 190/2014 commi 54-89 **abrogati** dal D.Lgs. 117/2026 (nuovo TUIR in vigore dal 4/7/2026); mancano i riferimenti a TUIR 2026 e TU-IVA 2026 (D.Lgs. 10/2026) in `Sources.tsx`, ADR, README, commenti.

### P1 — alta priorità (impatto su soldi, documenti o mobile)

5. **Paginazione preventivo incoerente con il DOM**: budget verticale 281 mm vs box reale 257 mm e gap di 4 mm non contati → contenuto tagliato in anteprima e PDF (misurato: 15,9 mm di overflow sulla pagina 1; "CONDIZIONI E PAGAMENTO" fuori area). Fix: metrica unica condivisa CSS/TS.
6. **"Netto stimato" fuorviante** nel Calcolatore: non sottrae i costi (né reali né le spese per dipendenti) e il grafico somma componenti su basi diverse. Con 60.000 € di ricavi e coefficiente 40% mostra **Netto 51.082 € > Reddito lordo 24.000 €** e una torta da 96.000 € su 60.000 € di ricavi. Coerente con il calcolo di legge ma **etichettato male**: rinominare o sottrarre i costi.
7. **Confronto regimi sbilanciato**: i costi reali sono sottratti solo al regime ordinario (`comparison.ts:66-77`) → vantaggio forfettario gonfiato di circa l'intero importo dei costi (default: delta app 13.021,73 € vs ≈3.021,73 € corretto; con IRAP ≈1.461 €). Mancano inoltre IRAP, INAIL, cassa professionale, acconti.
8. **Calcolo inverso "netto in tasca"** (`targetNet.ts:17-24`): ignora i costi d'impresa; va aggiunto l'input o va corretta l'etichetta.
9. **Requisiti di accesso non bloccanti**: superare 20.000 € di spese personale o la soglia redditi dipendente produce solo un warning; simulazione ed export restano disponibili e il confronto regimi non riceve quei campi (`forfettario.ts:62`, `ComparisonInput`).
10. **Contributo fisso INPS non prorazionato** per mesi di attività < 12 (Circ. INPS 14/2026: 376,78 €/mese artigiani, 384,31 €/mese commercianti) → sovrastima fino a ~50% per chi apre a metà anno.
11. **Preventivatore e IVA**: un forfettario non esercita la rivalsa (art. 234 TUIR 2026) ma l'app consente 10%/22% senza avviso; "Operazione non soggetta a IVA" è esportata senza base normativa (campo motivo vuoto al default); mancano 4%/5%, reverse charge, IVA per cassa, split payment/beni significativi; l'obbligo di fatturazione elettronica non è menzionato.
12. **UI mobile critica**: anteprima A4 tagliata a 320 px (35 px per lato) e a 1024 px (19 px/lato) senza pinch-zoom; barra sticky "Esporta PDF" coperta dall'header; tap target 28–40 px; contrasto dark 4,10:1; palette grafici fino a 1,48:1; reflow rotto a testo 200%.
13. **Input numerici**: `value={number}` + parse a ogni keystroke impedisce i decimali (e la virgola italiana) in Calcolatore/Confronto/Contributi/Quanto fatturare/Pianificazione.
14. **Etichette ATECO ambigue** ("Commercio all'ingrosso e al dettaglio (45-47)" include codici che appartengono ad altre categorie): rischio di coefficiente sbagliato (40% invece di 54/62%) e quindi imposta sottostimata.

### P2 — media priorità

15. `npm audit`: 10 vulnerabilità (fisso con `npm audit fix`, 32 aggiornamenti non-breaking); 1 critica è `dompurify` via dipendenza opzionale di jsPDF (non usata dall'app, ma va chiusa).
16. Bundle: entry 492,57 kB (gzip 158,49), jsPDF 390,17 kB importato staticamente da `Calculator.tsx` (scaricato su `/calcolatore` anche se non si esporta), CategoricalChart 332,92 kB, html2canvas 202,38 kB. jsPDF va reso lazy.
17. `QuoteBuilder`: ricalcolo a ogni keystroke (`watch()` completo + `loadDraft()` a ogni render + doppia paginazione + DOM offscreen per l'export + `JSON.stringify` da ~1,3 MB ogni 400 ms).
18. Toolchain/documentazione: `packageManager: npm@11.16.0` ignorato dal CLI npm (solo Corepack), CI usa npm 11.19.0, shell locale 12.2.0; `allowScripts` è solo advisory; CI senza `npm audit`, coverage o budget di bundle; incoerenze in CHANGELOG/`repository-governance.md`/ADR; valori fiscali ripetuti nella copy delle pagine invece di derivare da `fiscal-data.ts` (es. "26,07%" in `Contributions.tsx:86`, "85.000€" in Home/Planning/Sources).
19. A11y/form: errori non associati ai campi (`aria-describedby`/`aria-invalid`), wizard senza progressbar annunciata, `autocomplete` assente, "Ingrandisci" invisibile ma focalizzabile, grafici senza alternativa testuale dei valori.
20. Copy: refusi senza accento ("Citta", "Validita", "Unita", "non e"), toggle tema in inglese, tema "Sistema" non riselezionabile.

---

## 2. Fisco, IVA e normativa 2026

### 2.1 Contesto normativo decisivo (verificato su fonti primarie)

- **Nuovo TUIR**: **D.Lgs. 19 giugno 2026, n. 117**, GU n. 152 del 3/7/2026 (Suppl. Ord. n. 26), in vigore **4/7/2026**. Ha **abrogato i commi 54-89 dell'art. 1 L. 190/2014** e trasfuso il regime forfettario negli **artt. 232-243 + Allegato D**. Riferimento vigente per: requisiti (art. 232), esclusioni (art. 233), IVA (art. 234), determinazione del reddito e imposta (art. 235), cessazione (art. 238), previdenza agevolata (art. 241).
- **Nuovo TU-IVA**: **D.Lgs. 19 gennaio 2026, n. 10**, GU n. 24 del 30/1/2026, in vigore **31/1/2026** (aliquote art. 34, rivalsa art. 55, reverse charge art. 64, fatturazione elettronica art. 77, IVA per cassa art. 132).
- Il repo continua a citare la L. 190/2014 come fonte primaria (e le sue pagine Normattiva riportano ora "COMMA ABROGATO DAL D.LGS. 19 GIUGNO 2026, N. 117").

### 2.2 Errore critico confermato: soglia 30.000 € (non 35.000 €)

**Testo di legge** (art. 233, comma 1, lett. f, TUIR 2026): _"i soggetti che nell'anno precedente hanno percepito redditi di lavoro dipendente e redditi assimilati a quelli di lavoro dipendente ... eccedenti l'importo di euro 30.000; la verifica di tale soglia è irrilevante se il rapporto di lavoro è cessato"_. Verificato in doppio modo dal Lead: Normattiva (D.Lgs. 117/2026) e **testo della Gazzetta Ufficiale** (GU n. 152/2026, pag. 201-202).

Il repo usa **35.000** in cinque punti coordinati: `fiscal-data.ts:76` (`LIMITS.redditoDipendente`), `forfettario.ts:44-49`, `public-copy.ts:22-26`, `Calculator.tsx:400-404`, ADR `0001-fiscal-assumptions.md:45` ("confermato per il 2026" — affermazione non vera).
**Impatto:** chi ha 30.000-35.000 € di reddito dipendente viene considerato eleggibile e riceve una simulazione completa; il regime non gli spetta. **Fix:** costante a 30.000, test ai valori 29.999/30.000/30.001, aggiornamento copy/ADR/fonti.

### 2.3 Il "netto" non è un netto (problema n. 2 per impatto)

Nel regime forfettario il reddito imponibile è `ricavi × coefficiente` (art. 235 c.1 TUIR); il coefficiente rappresenta i costi. Il codice invece calcola `nettoStimato = ricavi − contributi − imposta` (`forfettario.ts:19`), quindi:

- **non sottrae i costi reali** (né le spese per dipendenti, che pure sono un input raccolto solo per il warning);
- **non sottrae i costi impliciti** nel coefficiente;
- il grafico "Ripartizione" somma Netto + Imposta + Contributi + Costi forfettari → totale **maggiore dei ricavi** (es. 96.000 € su 60.000 €; 61.000 € su 50.000 € con coefficiente 78%).

Lo stesso difetto di omogeneità rende **sbilanciato il confronto** (`comparison.ts:66-77`: costi reali sottratti solo all'ordinario) e **ottimistico il calcolo inverso** (`targetNet.ts`: "netto in tasca" al lordo dei costi d'impresa). Sono semplificazioni difendibili solo se dichiarate nel punto in cui l'utente legge il numero, cosa che oggi non accade: un utente vede "Netto stimato" 51.082 € con "Reddito lordo" 24.000 € (stessa schermata).

**Fix minimo:** o (a) sottrarre un input "costi annui" / "spese personale" e usare basi coerenti in numeri e grafici, o (b) rinominare in "Disponibile prima dei costi dell'attività" e togliere la torta; per il confronto, sottrarre gli stessi costi a entrambi i regimi e dichiarare IRAP/INAIL/cassa/acconti esclusi accanto al "vincitore".

### 2.4 Eleggibilità, requisiti e aliquota 5%

- Il superamento delle soglie produce **solo warning**: `available = !hasImmediateExit` (`forfettario.ts:62`), quindi >20.000 € spese personale o >30.000 € reddito dipendente restano simulabili ed esportabili. Il confronto regimi non riceve affatto `speseDipendenti`/`redditoDipendente` (`ComparisonInput`).
- **Cause ostative non modellate** (art. 233): regimi speciali IVA, non residenza, cessioni prevalenti immobili/terreni/mezzi nuovi, partecipazioni/controllo s.r.l., attività prevalente verso ex datori. L'app può dire "forfettario ok" a chi non può accedervi.
- **Aliquota 5%**: è solo uno switch; mancano le condizioni di legge (nessuna attività nei 3 anni precedenti, non mera prosecuzione, anno di avvio + 4 successivi — art. 235 c.2) e il limite temporale.
- **Limite 20.000 €**: il campo UI chiede solo "spese per dipendenti" mentre la norma include lavoro accessorio, collaboratori, utili da partecipazione e prestazioni di lavoro (art. 232 c.1 lett. b); il messaggio non spiega la conseguenza (perdita del regime dall'anno successivo).
- **Raggiuglio ad anno**: il calcolo è aritmeticamente corretto, ma l'ADR lo descrive come specifico delle nuove attività mentre la norma lo prevede in generale.

### 2.5 Contributi INPS: cosa è corretto e cosa no

**Verificato corretto** (valori letti sulle Circ. INPS 8/2026 e 14/2026 dal revisore fiscale; matematica del codice ricontrollata dal Lead con ricalcolo indipendente, 93/93 check): Gestione Separata **26,07%** e massimale **122.295 €**; minimale **18.808 €**; contributo fisso artigiani **4.521,36 €** (4.513,92 IVS + 7,44 maternità), commercianti **4.611,64 €**; aliquote **24% / 24,48%**; **+1%** oltre **56.224 €** (25% / 25,48%); massimali **93.707 €** (anzianità al 31/12/1995) e **122.295 €**; riduzione **35%** riservata ai forfettari con attività d'impresa (art. 241 TUIR) e quindi asimmetria corretta nel confronto. I contributi massimi risultano coerenti con quelli pubblicati dalla circolare (22.864,51 / 23.314,31 / 30.011,51 / 30.598,53 €).

**Manca / errato:**

- contributo fisso **non prorazionato** per periodi < 12 mesi (sovrastima fino a ~50%);
- manca l'aliquota Gestione Separata **24%** per pensionati/assicurati presso altre forme (Circ. 8/2026);
- la riduzione 35% è applicata anche alla quota maternità (7,44 €) e alla variabile: dettaglio **da confermare** con circolare applicativa;
- la deduzione usa la **stima** INPS quando l'utente lascia 0, mentre la norma deduce i contributi **versati** (art. 235 c.1): semplificazione da documentare o correggere;
- "Cassa privata/altro" = contributi zero: per le casse obbligatorie (INARCASSA, ENPAM, Cassa Forense…) i contributi sono dovuti e deducibili, quindi il netto è sovrastimato e la detrazione manca.

### 2.6 IVA e preventivi

- Un forfettario **non esercita la rivalsa IVA** sulle operazioni nazionali (art. 234 c.1 lett. a TUIR 2026) e non detrae l'IVA; assolve quella degli acquisti in reverse charge. Il preventivatore consente `none` / `vat10` / `vat22` senza alcun collegamento col regime: un forfettario può generare un preventivo con IVA al 22% senza avviso.
- Il default `none` stampa **"Operazione non soggetta a IVA"** senza base normativa: il campo "Motivo Esenzione IVA" è vuoto al default e facoltativo; nel codice esiste già un testo corretto (`placeholders.ts:60`) usato solo come placeholder dell'input, mai esportato.
- Mancano le aliquote **4% e 5%** (art. 34 TU-IVA), **reverse charge** (art. 64), **IVA per cassa** (art. 132), **split payment/beni significativi** (non rintracciati nel nuovo TU-IVA: da confermare), la **rivalsa cassa previdenziale** (es. 4%) e l'informazione sull'obbligo di **fatturazione elettronica** (art. 77 TU-IVA).
- Il preventivo **non è una fattura** e il disclaimer in pagina è corretto ("natura di preventivo economico e non costituisce fattura"), quindi il rischio è di uso improprio, non di nullità del documento.

### 2.7 Documentazione e fonti

- `Sources.tsx` cita **solo** L. 190/2014 (commi abrogati) e le due circolari INPS; non cita TUIR 2026, TU-IVA 2026 né alcuna fonte AdE.
- ADR: "valori 2026", "35.000 confermato", "ragguaglio per le nuove attività", "coefficienti ATECO 2026" (la norma rinvia ancora ai coefficienti **ATECO 2007** dell'Allegato D).
- README e README.en.md ripetono le assunzioni (incluse le circolari INPS corrette).
- Il disclaimer "stime indicative, non consulenza fiscale" è corretto e va mantenuto, ma **non copre** i casi in cui un'etichetta è fuorviante o una soglia è errata: le correzioni vanno fatte nei numeri e nelle etichette, non nel disclaimer.

### 2.8 Da confermare (una riga per punto)

Base applicativa della riduzione INPS 35% su fissa/variabile/maternità; split payment e beni significativi nel nuovo TU-IVA; dicitura legale esatta della fattura forfettaria (circolare AdE); INAIL artigiani/commercianti; range addizionali regionali/comunali (1,23%-3,33% / 0%-0,9%); rivalsa delle singole casse professionali; transizione storica degli obblighi di fatturazione elettronica; novità 2027 (legge di bilancio non ancora pubblicata al 24/10/2026); eventuale approvazione dei nuovi coefficienti ATECO 2025.

### 2.9 Fonti primarie usate

- D.Lgs. 117/2026 (TUIR 2026): <https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2026;117> — artt. 11, 13, 232-243, Allegato D; testo integrale GU n. 152/2026 verificato dal Lead.
- D.Lgs. 10/2026 (TU-IVA 2026): <https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2026;10> — artt. 34, 55, 64, 72-73, 77, 132.
- L. 190/2014 (per verifica abrogazione commi 54-89): <https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2014;190>.
- Circolare INPS 14/2026: <https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-messaggi.2026.02.circolare-numero-14-del-09-02-2026_15162.html>.
- Circolare INPS 8/2026: <https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-messaggi.2026.02.circolare-numero-8-del-03-02-2026_15153.html>.

---

## 3. Codice

### 3.1 Bug confermati (preventivo: area fragile)

| ID         | Gravità     | Problema                                                                                                                                        | Evidenza                                                                                                                                                               |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BUG-01     | **Critica** | Paginazione lancia in render, nessun ErrorBoundary, bozza persistita → app bianca permanente all'apertura di `/preventivo`                      | Riprodotto dal Lead in browser: titolo 3.720 char → `#root` 0 figli, body vuoto, `Uncaught Error: Block header exceeds the available page height.`; il reload ricrasha |
| BUG-02     | Alta        | Budget verticale 281 mm vs box reale 257 mm + gap 4 mm non contati → contenuto tagliato in anteprima e PDF (condizioni di pagamento/disclaimer) | Misure DOM: content box 256,9 mm, overflow 15,9 mm sulla pagina 1; nel PDF il testo resta nel layer invisibile (`export-pdf.ts` usa `innerText`)                       |
| BUG-03     | Alta        | Placeholder demo al posto dei campi opzionali vuoti → P.IVA/CF/città inventati nel PDF                                                          | Verificato in DOM: `00186 Roma RM P. IVA IT10987654321`, `RSSMRA90A01F205X` con form vuoto                                                                             |
| BUG-04     | Media       | Zoom rotella: listener React `wheel` passivo, `preventDefault()` ignorato → la pagina scrolla                                                   | Errore console "Unable to preventDefault inside passive event listener"                                                                                                |
| BUG-05     | Media       | Voci con descrizione più alta di una pagina: tutte le parti marcate continuation → quantità/prezzo/totale nascosti in tutte le parti successive | Codice `pagination.ts:333`, `renderPageContent.tsx:114-127`                                                                                                            |
| BUG-06     | Media       | Cambio route: nessuno scroll-to-top/focus; `AnimatePresence` + `Outlet` può animare la route nuova dentro il wrapper vecchio                    | Codice                                                                                                                                                                 |
| BUG-07     | Media       | L'ultima modifica in debounce (400 ms) si perde se si chiude il tab; il CHANGELOG dichiara il contrario                                         | Codice + CHANGELOG                                                                                                                                                     |
| BUG-08     | Media       | Bozza da `localStorage`: `discount` non clampato, `issueDate` non validata, messaggi Zod in inglese                                             | Codice                                                                                                                                                                 |
| BUG-09..15 | Bassa       | Dettagli (label PDF "Stima INPS"/"Contributi Dedotti" coincidenti, `sizes`, microcopy, ecc.)                                                    | `.review/code.md`                                                                                                                                                      |

### 3.2 Punti di forza verificati

- Logica fiscale **pura** in `src/lib/calculations/` (nessun accesso a window/storage/data corrente), firme tipizzate e test unitari dedicati.
- Nessun `any`, nessun `dangerouslySetInnerHTML`/`innerHTML`, nessuna richiesta di rete a runtime, nessuna telemetria; `localStorage` incapsulato in `browser-storage.ts` con gestione quota/storage disabilitato; logo preventivo con allowlist PNG/JPEG/WebP, limite 1 MB e ri-sanitizzazione.
- Header di sicurezza in `vercel.json` coerenti (CSP solida, niente `unsafe-eval`); test `deployment-security.test.ts`.
- Routing con lazy loading per tutte le pagine, `Suspense` con fallback, router unico; split dei chunk corretto.
- `prefers-reduced-motion` rispettato su tre livelli (MotionConfig, CSS globale, controllo prima di `startViewTransition`); A4 sempre bianca anche in dark.
- Versioni allineate (`package.json`/`package-lock.json`/`CITATION.cff` = 1.1.1, CHANGELOG 1.1.1); asset hash verificati; `npm ci` coerente col lockfile.

### 3.3 Architettura, TypeScript/React, performance

- Buoni confini tra pagine (`pages/`), dominio (`lib/calculations/`), documento (`lib/quote/`), primitive UI (`components/ui/`). Debolezza: alcuni valori fiscali sono ripetuti nella copy delle pagine invece di derivare da `fiscal-data.ts` (es. "26,07%" in `Contributions.tsx:86`, "85.000€" in Home/Planning/Sources), contro la regola dichiarata in AGENTS.md; rischio di disallineamento al prossimo cambio normativo.
- TS 6 ha `strict` attivo di default, ma non è dichiarato in `tsconfig.json`; `noUnusedLocals`/`noUncheckedIndexedAccess` restano off.
- React: `watch()` dell'intero form in pagine di calcolo, `QuoteBuilder` ricalcola a ogni keystroke e rigenera la paginazione due volte; `Calculator.tsx` importa **staticamente** jsPDF (390 kB) su una pagina che non esporta quasi mai.
- Build: entry 492,57 kB (158,49 gz), jsPDF 390,17, CategoricalChart 332,92, html2canvas 202,38 (48,04), CSS 76,24 (13,53). Nessun budget di bundle in CI.
- Dipendenze: `npm audit` 10 vulnerabilità (1 critica `dompurify`→3.4.17 via jspdf optional dep, 4 alte `zod`/`shadcn`/`undici`/`body-parser`, 5 moderate); `npm audit fix --dry-run` = 32 aggiornamenti non-breaking. jsPDF è già all'ultima versione.
- Toolchain: `packageManager` non applicato dal CLI npm (solo Corepack), quindi la versione npm effettiva varia tra locale (12.2.0), CI (11.19.0) e dichiarato (11.16.0); `allowScripts` è advisory, non un blocco. Non è un bug dell'app ma una regola del repo non applicata.
- CI: `format:check + typecheck + lint + test + build + e2e`; mancano `npm audit`, coverage e verifica asset/bundle. ESLint 10 non ignora directory non versionate (`.review/`) — consigliato aggiungere `ignores: ['dist','node_modules','.review','coverage','test-results','playwright-report']`.
- Incoerenze documentali minori: CHANGELOG dichiara audit pulito e flush su chiusura tab non implementato; `repository-governance.md` descrive Dependabot in modo diverso dal file reale; AGENTS.md dice che le costanti fiscali vivono solo in `fiscal-data.ts` (non è vero); `llms.txt` non elenca 3 route.

### 3.4 Verifiche (output reali)

| Comando                | Esito                                                      |
| ---------------------- | ---------------------------------------------------------- |
| `npm run typecheck`    | 0 (nessun errore)                                          |
| `npm run lint`         | 0                                                          |
| `npm run format:check` | 0 ("All matched files use Prettier code style!")           |
| `npm run test`         | 25 file, **138 test passati**                              |
| `npm run build`        | verde, 2.209,8 KiB in `dist/`                              |
| `npm run test:e2e`     | **14/14 passati** (dopo `npx playwright install chromium`) |
| `npm ci`               | 604 pacchetti, lockfile coerente                           |
| `npm audit`            | 10 vulnerabilità (1 critica, 4 alte, 5 moderate)           |

---

## 4. UI/UX desktop e mobile

**Giudizio mobile-first: 7/10.** Base responsive reale e ben fatta; i difetti sono concentrati nei tre flussi che contano su telefono: anteprima A4, CTA mobile del preventivo, riepilogo numerico.

### 4.1 Cosa funziona

- Mobile-first reale: tutte le griglie partono da `grid-cols-1` e aprono a `md/lg`; **zero overflow orizzontale** su 8 route × 8 viewport (320→1920), escluso il 200% text zoom.
- Header mobile e drawer: target 44 px, `h-dvh`, scroll lock, focus trap, chiusura con Esc, `aria-current`, skip link, 8 route raggiungibili.
- Label sempre associate; font input 16 px su mobile (niente zoom iOS); `Intl.NumberFormat('it-IT')`; disclaimer bloccante e non dismissibile; errori storage/PDF con `role="alert"`.
- Tema dark completo (non semplice inversione), `theme-color`, A4 sempre chiara, scelta iniziale dal sistema; reduced motion verificato.
- Lighthouse mobile: Home **100**, Calcolatore 100 light / 96 dark, Preventivo 95 light / 98 dark (le violazioni sono contrasto e heading-order, non strutturali).

### 4.2 Problemi critici

- **C1 — Anteprima A4 tagliata e non ingrandibile**: a 320 px il contenitore è 247 px e il foglio 317 px → **35 px tagliati per lato** (testo e colonna TOT troncati); a 375 px 8 px/lato; a 390/414 px entra; a 1024 px (griglia a 2 colonne) il difetto ritorna (19 px/lato). Causa: `QuoteViewport` calcola il fit ma lo clampa a `minScale = 0.4` (`QuotePreview.tsx:89`), il contenitore ha `overflow-hidden`; `touch-action: none` e soli handler wheel/drag → **nessun pinch-zoom**. Fix: `minScale` responsivo (0.25 sotto 400 px), pinch/controlli +/–, verifica 320/375/1024.
- **C2 — CTA "Esporta PDF" mobile coperta dall'header**: barra `sticky top-0 z-30` (`QuoteBuilder.tsx:284`) dietro l'header `z-40` alto 64 px (`Layout.tsx:174`); a scroll `elementFromPoint` restituisce `<HEADER>`. Fix: `sticky top-16` (+ safe-area).
- **C3 — Riepilogo incoerente**: "Netto stimato" 51.082 € con "Reddito lordo" 24.000 € e torta da 96.000 € su 60.000 € di ricavi (vedi §2.3). È sia correttezza fiscale sia fiducia nell'interfaccia.

### 4.3 Problemi alti

- **Tap target 28–40 px**: input 32 px (`components/ui/input.tsx` `h-8`), CTA mobile 120×28, pulsanti wizard 32 px, select 40 px, switch ~34 px. WCAG 2.5.8 (24 px) è rispettata, il requisito del PO (≥44 px) no. Fix: `min-h-11` sotto `md`, CTA `size="lg"`.
- **Contrasto dark**: `text-zinc-500` (#71717b) su #0a0a0a = **4,10:1** (soglia 4,5) su Calcolatore/Pianificazione; Lighthouse color-contrast FAIL. Fix meccanico: `dark:text-zinc-400` o `text-muted-foreground`.
- **Palette grafici**: `chart-1` `oklch(0.87)` = **1,48:1** su bianco (linea "Fatturato Cumulato" e legenda "Netto Stimato" quasi invisibili); in dark chart-4 1,91:1 e chart-3 2,53:1; token identici in light/dark e legenda colorata col colore serie. Fix: palette con varianti light/dark e contrasto ≥3:1, testo legenda = foreground.
- **Testo 200%**: drawer menu `scrollHeight` 1080 vs 568 senza `overflow-y` (voci "Preventivo"/"Informativa" irraggiungibili); Home `scrollWidth` 541 vs 320; Preventivo 445 vs 375. Fix: `overflow-y-auto max-h-dvh`, `hyphens-auto`/`clamp()` sui titoli.

### 4.4 Problemi medi/bassi principali

`inputMode` assente nel Calcolatore e nelle voci preventivo (tastiera non ottimizzata, virgola decimale rifiutata); `autocomplete` assente sui dati personali; errori form non associati (`aria-invalid`/`aria-describedby`); wizard senza `role="progressbar"` e risultati non annunciati; "Ingrandisci" invisibile ma focalizzabile da tastiera (`opacity-0` senza `focus-visible`); grafici senza alternativa testuale dei valori; microcopy senza accenti; toggle tema in inglese; tema "Sistema" non riselezionabile; dialoghi senza `max-height`/scroll; safe-area/dvh da verificare su iOS; CSP blocca `eval` solo sul deploy (Best Practices 96, probabile JIT di Zod: non aggiungere `unsafe-eval`).

### 4.5 Limiti dichiarati

Export PDF reale su mobile non eseguito (download), Safari/iOS e tastiere reali non testati, pinch non emulabile (verificato per codice), screen reader reali non usati. Questi punti non sono coperti dalle conclusioni.

---

## 5. Piano di remediation suggerito (PR piccole e indipendenti)

1. **PR "soglia forfettario"**: 35.000 → 30.000 + test 29.999/30.000/30.001 + copy/ADR/Sources. (1 file dominio + test + doc)
2. **PR "preventivo stabile"**: ErrorBoundary per route e per preventivo; `try/catch` su `buildPaginationData` con fallback recuperabile; limiti di lunghezza nello schema; test con titolo enorme e bozza difettosa.
3. **PR "metrica paginazione"**: una sola fonte per top/bottom/footer/gap condivisa CSS/TS (contentHeight 257 mm, gap 4 mm), oppure misura DOM reale; e2e che verifichi che l'ultimo blocco di ogni pagina sia dentro `.quote-a4-content`.
4. **PR "dati reali nel documento"**: nessun fallback placeholder in `formValuesToDraft`; e2e con soli campi obbligatori che asserisce l'assenza dei valori demo nel PDF.
5. **PR "mobile quick wins"**: `sticky top-16`; `minScale` responsivo + pinch/controlli zoom; `min-h-11` sotto `md`; `overflow-y-auto` drawer; tap target CTA.
6. **PR "contrasto e grafici"**: sweep `dark:text-zinc-400`/`text-muted-foreground`; palette `--chart-*` per tema; legenda con colore foreground; aria-label con i valori.
7. **PR "netto e confronto"**: decidere la semantica di "netto" (costi reali in input oppure rinomina + torta coerente); sottrarre gli stessi costi a entrambi i regimi; aggiungere nota/IRAP nel confronto; prorazione fisso INPS; GS 24%.
8. **PR "IVA e preventivi"**: avviso se il forfettario sceglie 10/22%; motivo esenzione precompilato con base normativa aggiornata (art. 234 TUIR 2026); 4%/5% o dichiarazione esplicita di non supporto; nota su fatturazione elettronica.
9. **PR "fonti 2026"**: ADR, `Sources.tsx`, README, commenti a TUIR D.Lgs. 117/2026 e TU-IVA D.Lgs. 10/2026; link Normattiva; data di validità dei valori.
10. **PR "qualità e deps"**: `npm audit fix` (32 aggiornamenti non-breaking), `npm audit` in CI, jsPDF lazy, ignores ESLint/Prettier per directory di lavoro, allineamento `packageManager`/docs CI.
11. **PR "a11y form"**: `aria-describedby`/`aria-invalid` + focus sul primo errore; progressbar wizard; `inputMode`/`autocomplete`.

---

## 6. Evidenze e riproducibilità

- Numeri e formule: verifica indipendente del Lead (script in `.review/verify/run.ts`, 93/93 check: INPS GS/artigiani/commercianti, forfettario, 5%, ragguaglio, confronto con ricalcolo indipendente IRPEF/detrazione, targetNet round-trip, planning, edge case).
- Crash bianco: riprodotto in browser con bozza `title` da 3.720 caratteri su preview locale del HEAD; `#root` vuoto, body vuoto, bozza persistita.
- Paginazione: misure DOM (content box 256,9 mm, overflow 15,9 mm, blocchi header 65,9/cliente 44,4/meta 38,7/voci 58,6/note 25,0/pagamento 252,6→272,9 mm).
- UI: 53 screenshot in `.review/shots/` (8 viewport × route principali, light/dark), 24 file Lighthouse in `.review/lighthouse/` (12 report JSON + 12 HTML), menu e anteprima a testo 200%.
- Report dettagliati: `.review/fiscal.md` (246 righe, fonti primarie), `.review/code.md` (329 righe), `.review/uiux.md` (196 righe).
- Build/test log: `.review/build.log`, `.review/vitest.log`, `.review/e2e.log`.

> Nota: `.review/` è esclusa da git tramite `.git/info/exclude` (solo locale, non tocca il repository). Se serve condividere le evidenze, copiare i file desiderati in una posizione versionata.

---

## 7. Cosa non è stato verificato

- Split payment e beni significativi nel nuovo TU-IVA; dicitura legale esatta della fattura forfettaria (circolare AdE); dettaglio della riduzione INPS 35%; INAIL; range addizionali; rivalsa delle singole casse; date storiche della fatturazione elettronica; novità 2027.
- Export PDF reale su device mobile, Safari/iOS, tastiere reali, pinch su device fisico, screen reader reali.
- Eventuali nuovi coefficienti ATECO approvati dopo l'ultimo aggiornamento del TUIR (25/9/2026): il testo vigente rinvia ancora ai coefficienti ATECO 2007.

---

_Revisione condotta con tre analisi parallele (fiscale/legale, codice, UI/UX) più verifica indipendente del Lead su build, test, numeri e riproduzione bug. Nessuna modifica al codice o ai file tracciati._
