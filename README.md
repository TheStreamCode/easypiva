# EasyPIVA 2026

Simulazioni fiscali indicative per la Partita IVA italiana

[![CI](https://github.com/TheStreamCode/easypiva/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/easypiva/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/TheStreamCode/easypiva)](https://github.com/TheStreamCode/easypiva/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

![EasyPIVA — dashboard del simulatore fiscale per la Partita IVA italiana](docs/assets/easypiva-social-preview.png)

**Italiano** · [English](README.en.md)

EasyPIVA è una web app open source per simulazioni fiscali indicative dedicate alla Partita IVA italiana. Riunisce calcolo del regime forfettario, contributi INPS, confronto con il regime ordinario, pianificazione dei ricavi e generazione di preventivi con export PDF.

Progetto indipendente: non è affiliato all'INPS, all'Agenzia delle Entrate o ad altri enti pubblici.

> I risultati sono stime indicative e non costituiscono consulenza fiscale, legale o contabile. Per decisioni professionali è necessario rivolgersi a un consulente abilitato.

## Installazione

EasyPIVA non richiede installazione: apri [easypiva.vercel.app](https://easypiva.vercel.app) in un browser moderno. Non servono account, backend applicativo o configurazione lato server.

Per eseguire una copia locale dell'app, vedi la sezione [Sviluppo](#sviluppo).

## Avvio rapido

1. Apri [EasyPIVA](https://easypiva.vercel.app).
2. Apri il calcolatore del regime forfettario e inserisci ricavi, coefficiente ATECO e gestione INPS.
3. Leggi il netto stimato e confronta il risultato con il regime ordinario.
4. Compila un preventivo, salvalo nel browser oppure esportalo in PDF.

## Funzionalità

- Calcolo del regime forfettario 2026.
- Confronto indicativo tra regime forfettario e ordinario.
- Simulazione dei contributi INPS per Gestione Separata, Artigiani e Commercianti.
- Calcolo inverso del fatturato necessario per raggiungere un netto obiettivo.
- Pianificazione mensile dei ricavi rispetto alle soglie del regime.
- Preventivo locale con anteprima A4, autosalvataggio nel browser ed export PDF.

### Attendibilità e limiti

- soglie, aliquote e coefficienti sono centralizzati in `src/lib/fiscal-data.ts`;
- la logica fiscale è isolata in funzioni pure sotto `src/lib/calculations/`;
- il regime forfettario e l'IRPEF fanno riferimento al TUIR 2026 (D.Lgs. 117/2026, artt. 11, 13, 232-243 e Allegato D), l'IVA al TU-IVA 2026 (D.Lgs. 10/2026) e i valori previdenziali alle circolari INPS 8/2026 e 14/2026;
- le assunzioni e le fonti normative sono documentate nell'[ADR fiscale](docs/ADRs/0001-fiscal-assumptions.md) e nell'[informativa pubblica](https://easypiva.vercel.app/informativa);
- test unitari, UI ed end-to-end proteggono i principali casi di regressione;
- ogni cambiamento fiscale richiede aggiornamenti coordinati di codice, test, documentazione e copy pubblica.

## Requisiti

- Un browser moderno con JavaScript abilitato, in una versione aggiornata di Chrome, Edge o Firefox.
- L'app pubblicata non richiede account, backend applicativo o variabili d'ambiente.
- Per lo sviluppo: Node.js 24 LTS e npm 11.

## Configurazione

EasyPIVA non espone impostazioni lato server. Le preferenze salvate nel browser sono:

| Impostazione           | Scopo                                                   | Predefinito     |
| ---------------------- | ------------------------------------------------------- | --------------- |
| Tema                   | Alterna interfaccia chiara e scura e conserva la scelta | Tema di sistema |
| Consenso al disclaimer | Memorizza l'accettazione del disclaimer informativo     | Non memorizzato |
| Bozza del preventivo   | Autosalva i dati del preventivo in corso nel browser    | Nessuna bozza   |
| Logo del preventivo    | Inserisce un logo PNG, JPEG o WebP fino a 1 MB          | Nessun logo     |

Le preferenze sono salvate solo nel `localStorage` del browser. L'app non invia i valori inseriti a un server e non usa account o telemetria.

## Privacy e sicurezza

Il progetto segue un'architettura local-first: i valori inseriti nei simulatori e nel preventivo non vengono inviati a un server. Tema, consenso al disclaimer e bozza del preventivo possono essere salvati nel `localStorage` del browser; il dettaglio è in [Privacy e storage locale](docs/privacy-and-storage.md).

Tutti i calcoli vengono eseguiti localmente nel browser e le assunzioni fiscali 2026 sono centralizzate e testate. Il repository usa CI con permessi minimi, GitHub Actions fissate a commit SHA e Dependency Review sulle pull request che modificano dipendenze. Per comunicare privatamente una vulnerabilità segui [SECURITY.md](SECURITY.md); non aprire issue pubbliche.

## Risoluzione dei problemi

### I risultati differiscono da quelli del mio commercialista. Perché?

EasyPIVA produce stime indicative basate sulle assunzioni fiscali 2026 documentate nell'[ADR fiscale](docs/ADRs/0001-fiscal-assumptions.md) e nell'[informativa pubblica](https://easypiva.vercel.app/informativa), con soglie, aliquote e coefficienti centralizzati in `src/lib/fiscal-data.ts`. Un professionista può applicare deduzioni, detrazioni o situazioni personali (altri redditi, agevolazioni, acconti versati) che il simulatore non conosce. In caso di scostamento, confronta i valori inseriti con le assunzioni pubblicate e, per decisioni professionali, affidati sempre a un consulente abilitato.

### Quale gestione INPS si applica al mio caso?

L'app simula tre gestioni: Gestione Separata, Artigiani e Commercianti, secondo i valori 2026 (Circolare INPS 8/2026 per la Gestione Separata, 14/2026 per Artigiani e Commercianti). Per Artigiani e Commercianti il massimale annuo dipende dall'anzianità contributiva al 31/12/1995: 93.707 € per chi era già iscritto, 122.295 € per gli altri. La gestione corretta dipende dalla tua attività e dall'iscrizione alla Camera di Commercio o agli albi: in caso di dubbio, verifica la tua posizione con l'INPS o con un consulente.

### L'export PDF del preventivo non funziona. Cosa posso fare?

L'export avviene interamente nel browser (jsPDF con rendering via html2canvas): assicurati di usare una versione aggiornata di Chrome, Edge o Firefox, di non aver bloccato i download per il sito e di avere spazio disponibile per il salvataggio. Se hai caricato un logo personalizzato, prova con un file più leggero (formato PNG o JPEG di piccole dimensioni). Se il problema persiste, ricarica la pagina — la bozza del preventivo è autosalvata nel `localStorage` — e riprova; per segnalazioni riproducibili apri una issue seguendo [CONTRIBUTING.md](CONTRIBUTING.md).

## Sviluppo

Richiede Node.js 24 LTS e npm 11; npm è il package manager canonico e `.nvmrc` e `package.json` sono le fonti di verità delle versioni.

```bash
git clone https://github.com/TheStreamCode/easypiva.git
cd easypiva
npm ci
npm run dev
```

L'app viene servita su `http://127.0.0.1:3000`.

```bash
npm run ci
npm audit
```

`npm run ci` esegue formattazione, typecheck, lint, test Vitest, build di produzione e test Playwright. Se Chromium non è ancora installato, esegui una volta `npx playwright install chromium`. Gli script disponibili sono documentati in `package.json`; i principali sono `dev`, `dev:e2e`, `typecheck`, `lint`, `test`, `test:e2e`, `build` e `ci`.

Stack: React 19, React Router 8, TypeScript 6 e Vite 6; Tailwind CSS v4 e componenti shadcn/ui; Zustand, React Hook Form e Zod; Recharts, motion e jsPDF; Vitest con jsdom e Playwright con Chromium.

La build statica prodotta in `dist/` viene pubblicata su [Vercel](https://easypiva.vercel.app) dal branch `main`. `vercel.json` gestisce il routing client-side e gli header HTTP di sicurezza; il progetto non utilizza un backend applicativo né variabili d'ambiente runtime.

Documentazione del repository:

- [Architettura](docs/architecture.md)
- [Privacy e storage locale](docs/privacy-and-storage.md)
- [Assunzioni fiscali](docs/ADRs/0001-fiscal-assumptions.md)
- [Governance repository](docs/repository-governance.md)
- [Provenienza degli asset](docs/asset-provenance.md)
- [Review completa 2026-10-24](docs/reviews/2026-10-24-full-review.md)
- [Changelog](CHANGELOG.md)

## Supporto

- Segnalazioni riproducibili e problemi di accessibilità o privacy: issue GitHub con il template bug report.
- Segnalazioni sulle assunzioni fiscali: issue corredate da fonti primarie verificabili.
- Vulnerabilità: [SECURITY.md](SECURITY.md), mai una issue pubblica.
- Contatti operativi: [info@mikesoft.it](mailto:info@mikesoft.it).
- Il repository non fornisce consulenza fiscale, assistenza personalizzata o supporto operativo.

## Contribuire

Il repository è pubblico con licenza MIT, ma la manutenzione segue un workflow maintainers-only: consulta [CONTRIBUTING.md](CONTRIBUTING.md) e il [Codice di condotta](CODE_OF_CONDUCT.md) prima di aprire una segnalazione. Le pull request esterne non fanno parte del processo di manutenzione ufficiale.

## Licenza

Questo progetto è distribuito con [licenza MIT](LICENSE).

---

Maintained by [Michael Gasperini (Mikesoft)](https://mikesoft.it). Se il progetto ti è utile, valuta di [sostenere la manutenzione](https://github.com/sponsors/TheStreamCode).
