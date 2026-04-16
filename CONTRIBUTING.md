# Contribution Policy

EasyPIVA è un repository pubblico con licenza MIT, ma il codice viene gestito con un workflow `maintainers-only`.

## Ambito della policy

- Le pull request esterne non fanno parte del processo di manutenzione ufficiale.
- Issue, discussion e richieste di supporto pubblico non sono il canale operativo del progetto.
- Fork e riuso del codice restano consentiti nei limiti della licenza MIT.

## Segnalazioni

- Per vulnerabilità o problemi di privacy, consulta [`SECURITY.md`](SECURITY.md).
- Per contatti operativi non legati alla sicurezza, scrivi a `info@mikesoft.it`.

## Workflow interno dei maintainer

- Mantieni le modifiche piccole, focalizzate e coerenti con il comportamento reale del codice.
- Esegui `npm run ci` prima di aprire una review interna o creare un commit finale.
- Se cambi logica fiscale o soglie normative, aggiorna anche `docs/ADRs/0001-fiscal-assumptions.md` e la copy pubblica correlata.
- Se cambi persistenza client-side o comportamento privacy, aggiorna in modo coordinato `docs/privacy-and-storage.md`, `docs/architecture.md` e `src/pages/Sources.tsx`.

## Package manager e ambiente

- Usa `npm` come package manager del repository.
- Per coerenza con la CI, lavora con Node.js 20.
