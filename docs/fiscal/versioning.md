# Versionamento delle assunzioni fiscali

EasyPIVA calcola le stime con un insieme di regole che cambia nel tempo: soglie, aliquote, coefficienti, massimali, formule di detrazione e regole di arrotondamento. Ogni insieme è un **profilo fiscale** identificato da un numero di versione e conservato in modo immutabile, così una stima può essere ricostruita anche dopo un aggiornamento normativo.

## Cosa contiene un profilo

Il tipo `FiscalProfile` in `src/lib/fiscal/types.ts` raccoglie:

- `year`, `version` (`<anno>.<progressivo>`, per esempio `2026.1`), `status` (`current` o `archived`), `validFrom`, `validTo`, `reviewedAt`;
- le fonti primarie (`sources`), con id stabile, etichetta e URL;
- le regole di arrotondamento (`rounding`);
- tutte le costanti usate dai calcoli (`constants`), comprese detrazioni, imposta sostitutiva, limiti e coefficienti ATECO;
- un `checksum` sha256 del contenuto canonico, usato come impronta del profilo.

Il profilo attivo è `CURRENT_PROFILE` in `src/lib/fiscal/index.ts`. I profili precedenti restano nello stesso registro e non vengono modificati.

## Regole di modifica

1. Una modifica a un'aliquota, una soglia, un coefficiente, una formula o una regola di arrotondamento richiede una **nuova versione**, per esempio `2026.2`.
2. Si crea un nuovo file in `src/lib/fiscal/profiles/<versione>.ts`; il profilo precedente viene marcato `status: 'archived'` e riceve `validTo` al giorno precedente all'efficacia della nuova versione. Non si modifica un profilo già rilasciato.
3. Si registra la modifica in `src/lib/fiscal/assumption-changes.ts` con data, release app, campi cambiati (`prima` → `dopo`) e id della fonte.
4. Si aggiornano l'ADR fiscale, il `CHANGELOG.md` e i test che citano la versione.
5. Si eseguono `npm run fiscal:checksum` e `npm run fiscal:write`, poi `npm run fiscal:check` e `npm run ci`. La CI esegue `fiscal:check`: se le costanti cambiano senza aggiornare checksum e artefatti, la pipeline fallisce.
6. La versione delle assunzioni è indipendente dalla versione dell'app. Una release può contenere solo modifiche tecniche; una modifica fiscale invece deve comparire in entrambe.

Le modifiche in corso d'anno seguono la data di efficacia della norma: il profilo precedente si chiude il giorno prima, quello nuovo inizia il giorno di entrata in vigore. Il calendario fiscale e le scadenze non sono versionati nel profilo.

## Checksum e JSON pubblico

`src/lib/fiscal/canonical.ts` produce una rappresentazione deterministica del profilo: chiavi in ordine fisso, `null` al posto di `Infinity` per l'ultimo scaglione IRPEF, nessun campo variabile come la data di generazione. Il checksum è lo sha256 di quella stringa e non include se stesso.

`public/fiscal-profile.json` è generato da `npm run fiscal:write` e contiene `schemaVersion`, la versione corrente e l'elenco completo dei profili con fonti, costanti, validità e checksum. Non va modificato a mano: `npm run fiscal:check` verifica che sia allineato al codice.

Per verificare l'integrità dopo un cambio intenzionale: `npm run fiscal:checksum -- --check`. Per rigenerare checksum e artefatti: `npm run fiscal:checksum` e `npm run fiscal:write`.

## Ricalcolare una stima passata

Il ricalcolo usa il profilo archiviato, non quello corrente:

```bash
npm run fiscal:recalc -- --list
npm run fiscal:recalc -- --profile 2026.1 --input '{"ricavi":50000,"atecoId":"8"}'
npm run fiscal:recalc -- --profile 2026.1 --input @input.json
```

L'output è JSON e contiene metadati del profilo (`version`, `validFrom`, `validTo`, `checksum`), input normalizzato e risultato. Per una riproduzione completa si parte dal tag della release che conteneva il profilo:

```bash
git checkout v1.2.0
npm ci
npm run fiscal:recalc -- --profile 2026.1 --input @input.json
```

Limite noto: il ricalcolo riproduce i numeri, non necessariamente il layout dei PDF o delle schermate di una versione precedente.

## Profili archiviati e accesso storico

La pagina `/informativa` elenca i profili disponibili, lo storico degli aggiornamenti e il link al JSON pubblico. I profili archiviati non sono selezionabili dall'interfaccia: il ricalcolo avviene da CLI o dal codice della release corrispondente. Le release Git sono la fonte di verità per ricostruire una versione dell'app; il JSON pubblico e il checksum permettono di verificare che le costanti siano quelle dichiarate.
