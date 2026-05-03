# Repository Governance

EasyPIVA è pubblico, MIT e `maintainers-only`: il codice può essere riusato tramite fork, ma la manutenzione upstream resta gestita dai maintainer.

## File versionati

La governance applicabile tramite repository è definita da questi file:

- `.github/workflows/ci.yml`: verifica applicativa completa su push a `main` e pull request.
- `.github/workflows/dependency-review.yml`: controllo supply-chain sulle pull request.
- `.github/dependabot.yml`: aggiornamenti schedulati per npm e GitHub Actions.
- `.github/ISSUE_TEMPLATE/`: issue strutturate per bug riproducibili e assunzioni fiscali.
- `.github/pull_request_template.md`: checklist di review per maintainer.
- `CODE_OF_CONDUCT.md`: regole minime di interazione pubblica.
- `SECURITY.md`: canale privato per vulnerabilità e problemi privacy.
- `CONTRIBUTING.md`: policy di contribuzione e manutenzione.

## Regole raccomandate su GitHub

Queste impostazioni non sono versionate nel repository e vanno configurate dalla UI GitHub o tramite API/CLI da un maintainer con permessi adeguati:

- proteggere `main` richiedendo pull request prima del merge;
- richiedere i check `CI` e `Dependency Review` prima del merge;
- richiedere branch aggiornato prima del merge quando il branch è divergente;
- bloccare force push e cancellazione di `main`;
- abilitare Dependabot alerts, Dependabot security updates e dependency graph;
- abilitare secret scanning per repository pubblico;
- mantenere squash merge come strategia preferita per storia lineare;
- usare topic GitHub coerenti, ad esempio `react`, `vite`, `typescript`, `partita-iva`, `forfettario`, `tax-calculator`, `italy`, `open-source`.

## Processo di aggiornamento

1. Aprire una pull request piccola e focalizzata.
2. Compilare il template PR con scopo, tipo modifica e verifiche.
3. Attendere CI e Dependency Review.
4. Aggiornare documentazione e changelog se cambia comportamento pubblico, workflow o assunzioni fiscali.
5. Eseguire merge solo quando la verifica automatica è verde.

## Supply chain

- Le dipendenze npm vengono aggiornate settimanalmente da Dependabot.
- Gli aggiornamenti patch/minor possono essere raggruppati.
- Le major release vanno trattate come manutenzione pianificata, con test completi e nota changelog.
- Ogni modifica a `package-lock.json` deve passare `npm run ci` e Dependency Review.
