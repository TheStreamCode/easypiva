# Repository Governance

EasyPIVA è pubblico, MIT e `maintainers-only`: il codice può essere riusato tramite fork, ma la manutenzione upstream resta gestita dai maintainer.

## File versionati

La governance applicabile tramite repository è definita da questi file:

- `.github/workflows/ci.yml`: verifica applicativa completa su push a `main` e pull request.
- `.github/workflows/dependency-review.yml`: controllo supply-chain sulle pull request.
- `.github/dependabot.yml`: aggiornamenti di sicurezza automatici, con version update ordinari disabilitati.
- `.github/CODEOWNERS`: ownership esplicita per codice, logica fiscale, ADR e automazioni.
- `.github/ISSUE_TEMPLATE/`: issue strutturate per bug riproducibili e assunzioni fiscali.
- `.github/pull_request_template.md`: checklist di review per maintainer.
- `CODE_OF_CONDUCT.md`: regole minime di interazione pubblica.
- `SECURITY.md`: canale privato per vulnerabilità e problemi privacy.
- `CONTRIBUTING.md`: policy di contribuzione e manutenzione.

## Impostazioni GitHub applicate

Le impostazioni non versionate vanno verificate periodicamente dalla UI GitHub o tramite API/CLI:

- `main` richiede pull request, un'approvazione, conversazioni risolte e branch aggiornato;
- i check `build` e `dependency-review` sono obbligatori;
- force push e cancellazione di `main` sono bloccati e la storia lineare è obbligatoria;
- l'eccezione amministratore resta disponibile per evitare il deadlock di approvazione nel workflow con singolo maintainer;
- Dependabot alerts e security updates, CodeQL, secret scanning, push protection e private vulnerability reporting sono abilitati;
- squash merge è l'unica strategia di merge abilitata e i branch vengono eliminati dopo il merge;
- usare topic GitHub coerenti, ad esempio `react`, `vite`, `typescript`, `partita-iva`, `forfettario`, `tax-calculator`, `italy`, `open-source`.

## Processo di aggiornamento

1. Aprire una pull request piccola e focalizzata.
2. Compilare il template PR con scopo, tipo modifica e verifiche.
3. Attendere CI e Dependency Review.
4. Aggiornare documentazione e changelog se cambia comportamento pubblico, workflow o assunzioni fiscali.
5. Eseguire merge solo quando la verifica automatica è verde.

## Processo di release

1. Aggiornare `package.json`, `package-lock.json`, `CITATION.cff`, README e changelog con la nuova versione.
2. Eseguire `npm run ci` in locale.
3. Pubblicare su `main` solo dopo verifica completa.
4. Attendere il workflow `CI / build` verde su GitHub.
5. Creare una GitHub Release taggata `vX.Y.Z` con note sintetiche e riferimento alle verifiche eseguite.

## Supply chain

- Dependabot apre pull request solo quando esiste un aggiornamento di sicurezza; gli update ordinari restano una manutenzione manuale pianificata.
- Le GitHub Actions sono referenziate tramite commit SHA completi, mantenendo il tag leggibile in commento.
- `allowScripts` in `package.json` autorizza solo gli install script necessari e nega quelli non richiesti dal runtime.
- Le major release vanno trattate come manutenzione pianificata, con test completi e nota changelog.
- Ogni modifica a `package-lock.json` deve passare `npm run ci` e Dependency Review.
