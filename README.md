# EasyPIVA 2026

[![CI](https://github.com/TheStreamCode/easypiva/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/easypiva/actions/workflows/ci.yml)

Versione corrente del repository: `0.1.0`.

EasyPIVA è una web app client-side per simulazioni fiscali indicative dedicate alla Partita IVA italiana. Copre regime forfettario, contributi INPS, confronto tra regimi, pianificazione dei ricavi e generazione di preventivi con export PDF.

Tutti i calcoli vengono eseguiti localmente nel browser. Il progetto non richiede account e non usa un backend applicativo.

## Branding e packaging

- Brand prodotto: `EasyPIVA`.
- Maintainer e autore del repository: `Mikesoft`.
- Packaging supportato: applicazione web statica buildata con Vite.
- Questo repository non è una VS Code extension: non usa `vsce`, non genera `.vsix` e non richiede icone separate per Activity Bar, sidebar o Marketplace.

## Release 0.1.0

- Formalizza la prima release documentata del repository.
- Allinea versione, changelog e README allo stato reale del progetto.
- Conferma che il branch `main` è l'unico ramo remoto attivo e che non risultano PR aperte o branch Dependabot da integrare al momento della release.

## Funzionalità principali

- Calcolatore del regime forfettario 2026.
- Confronto tra regime forfettario e ordinario.
- Simulatore contributi INPS per Gestione Separata, Artigiani e Commercianti.
- Calcolo inverso del fatturato necessario per raggiungere un netto obiettivo.
- Pianificazione mensile dei ricavi rispetto alle soglie del regime.
- Preventivo locale con anteprima A4, autosalvataggio della bozza nel browser ed export PDF.

## Stack

- React 19, TypeScript 5, Vite 6.
- Tailwind CSS v4 e componenti shadcn/ui.
- Zustand per lo stato client-side.
- React Hook Form e Zod per i form.
- Recharts, motion e jsPDF per visualizzazione ed export.

## Requisiti locali

- Node.js 20, in linea con la CI del repository.
- npm come package manager canonico.

## Avvio locale

```bash
git clone https://github.com/TheStreamCode/easypiva.git
cd easypiva
npm ci
npm run dev
```

L'app viene servita in sviluppo su `http://127.0.0.1:3000`.

## Script principali

- `npm run dev` avvia il server di sviluppo.
- `npm run typecheck` esegue il controllo TypeScript.
- `npm run lint` esegue ESLint.
- `npm run test` esegue la suite Vitest.
- `npm run build` genera la build di produzione in `dist/`.
- `npm run ci` esegue il flusso locale completo usato dalla CI.

## Documentazione

- [Architettura](docs/architecture.md)
- [Privacy e storage locale](docs/privacy-and-storage.md)
- [Assunzioni fiscali](docs/ADRs/0001-fiscal-assumptions.md)
- [Changelog](CHANGELOG.md)
- [Contribution policy](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Workflow del repository

Il repository è pubblico e rilasciato con licenza MIT, ma la manutenzione del codice segue un workflow `maintainers-only`. La policy completa è documentata in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Disclaimer

I risultati sono stime indicative basate sulle assunzioni fiscali documentate nel repository. Non costituiscono consulenza fiscale, legale o contabile e non sostituiscono il parere di un professionista abilitato.

## Licenza

Distribuito sotto licenza [MIT](LICENSE).
