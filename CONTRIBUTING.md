# Contribution Policy

EasyPIVA è un repository pubblico con licenza MIT, ma il codice viene gestito con un workflow `maintainers-only`.

## Ambito della policy

- Le pull request esterne non fanno parte del processo di manutenzione ufficiale.
- Issue, discussion e richieste di supporto pubblico non sono il canale operativo del progetto.
- Fork e riuso del codice restano consentiti nei limiti della licenza MIT.

## Segnalazioni

- Per vulnerabilità o problemi di privacy, consulta [`SECURITY.md`](SECURITY.md).
- Per contatti operativi non legati alla sicurezza, scrivi a `info@mikesoft.it`.
- Le issue pubbliche, quando abilitate, devono usare i template in `.github/ISSUE_TEMPLATE/` e includere passaggi riproducibili o fonti primarie.
- Le pull request devono usare `.github/pull_request_template.md` e riportare i comandi di verifica eseguiti.

## Workflow interno dei maintainer

- Mantieni le modifiche piccole, focalizzate e coerenti con il comportamento reale del codice.
- Esegui `npm run ci` prima di aprire una review interna o creare un commit finale.
- Per modifiche al preventivo, alla navigazione o alla resa mobile, verifica anche i test Playwright in `tests/e2e/`.
- Per modifiche a dipendenze o lockfile, controlla il risultato del workflow `Dependency Review` sulle PR.
- Le automazioni GitHub sono parte del contratto di manutenzione: se cambi script o test, aggiorna anche `.github/workflows/ci.yml`, `README.md` e `AGENTS.md`.
- Se cambi logica fiscale o soglie normative, aggiorna anche `docs/ADRs/0001-fiscal-assumptions.md` e la copy pubblica correlata.
- Se cambi persistenza client-side o comportamento privacy, aggiorna in modo coordinato `docs/privacy-and-storage.md`, `docs/architecture.md` e `src/pages/Sources.tsx`.

## Package manager e ambiente

- Usa `npm` come package manager del repository.
- Per coerenza con la CI, lavora con Node.js 20.
- Installa dipendenze con `npm ci` quando vuoi riprodurre la CI.
- Se Playwright segnala browser mancanti dopo un aggiornamento, esegui `npx playwright install chromium` in locale; la CI installa Chromium automaticamente.
