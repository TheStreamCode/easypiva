# 0001 - Assunzioni fiscali

## Stato

Accettato

## Contesto

EasyPIVA fornisce simulazioni fiscali indicative per utenti con Partita IVA italiana. L'app deve mantenere trasparenza sulle assunzioni alla base di ogni calcolo.

## Quadro normativo

- Dal 4 luglio 2026 il regime forfettario è disciplinato dal Testo unico delle imposte sui redditi (TUIR), D.Lgs. 19 giugno 2026, n. 117 (GU n. 152 del 3/7/2026), artt. 232-243 e Allegato D; i commi 54-89 dell'art. 1 della L. 190/2014 sono abrogati.
- Dal 31 gennaio 2026 l'IVA è disciplinata dal Testo unico in materia di imposta sul valore aggiunto (TU-IVA), D.Lgs. 19 gennaio 2026, n. 10 (GU n. 24 del 30/1/2026).
- I valori previdenziali 2026 sono nelle Circolari INPS n. 8/2026 (Gestione Separata) e n. 14/2026 (Artigiani e Commercianti).
- Le fonti vanno citate nei loro riferimenti vigenti: Normattiva per TUIR 2026 e TU-IVA 2026, inps.it per le circolari.

## Decisione

- Usare soglie e aliquote fisse 2026 in `src/lib/fiscal-data.ts`.
- Trattare i risultati come stime, non come consulenza professionale.
- Mantenere tutti i calcoli lato client.
- Persistire solo preferenze non sensibili, come il disclaimer e il tema.
- Il preventivo usa lo stesso principio local-first: bozza in `localStorage`, export PDF dal DOM renderizzato.

## Versioning delle assunzioni

- L'insieme di soglie, aliquote, coefficienti e formule usato dalle simulazioni è identificato da `FISCAL_PROFILE` in `src/lib/fiscal-data.ts`: anno d'imposta, versione (`ANNO.N`), data di inizio validità e fonti primarie.
- La versione va incrementata a ogni modifica fiscale (aliquote, soglie, coefficienti, formule, fonti), nello stesso cambio che aggiorna costanti, test, questa ADR e `CHANGELOG.md`.
- La versione è mostrata nella pagina `/informativa`, nei risultati del calcolatore e nel titolo del PDF esportato dal calcolatore, così ogni stima resta ricondotta all'insieme di regole che l'ha prodotta; il dettaglio puntuale delle modifiche resta nella storia Git e nel changelog.

## Aliquote IRPEF 2026 (art. 11 TUIR 2026)

- Fino a 28.000€: 23%
- Da 28.001€ a 50.000€: 33%
- Oltre 50.000€: 43%

## Contributi INPS (valori 2026)

- Gestione Separata: 26,07% (Circ. INPS 8/2026), entro il massimale di 122.295€.
- Artigiani: minimale reddito 18.808€, contributo fisso 4.521,36€, aliquota 24% oltre il minimale.
- Commercianti: minimale reddito 18.808€, contributo fisso 4.611,64€, aliquota 24,48% oltre il minimale.
- Aliquota aggiuntiva +1% sul reddito oltre 56.224€ (25% / 25,48%), fino al massimale applicabile (Circ. INPS 14/2026).
- Massimale Artigiani/Commercianti: 93.707€ per chi possiede anzianità contributiva al 31 dicembre 1995; 122.295€ per chi è privo di anzianità a tale data. L'interfaccia richiede questa informazione e usa il secondo caso come default compatibile con le simulazioni precedenti.
- Riduzione 35% per i forfettari con attività d'impresa (artigiani/commercianti), art. 241 TUIR 2026.

## Regime Ordinario (confronto)

- IRPEF a scaglioni 2026 (vedi sopra).
- Detrazione per redditi di lavoro autonomo (art. 13, commi 5 e 7, TUIR 2026), decrescente e azzerata oltre 50.000€.
- Addizionali regionali + comunali stimate con un'aliquota media rappresentativa del 2% (le aliquote reali variano per regione e comune).
- Il confronto è una stima semplificata: non considera detrazioni e deduzioni ulteriori, IRAP, ISA o la specifica residenza.

## Regime Forfettario

- Limite ricavi: 85.000€ (art. 232, comma 1, lett. a, TUIR 2026; ragguagliato ad anno per le nuove attività).
- Uscita immediata: 100.000€ sui ricavi effettivamente incassati, non ragguagliati (art. 238, comma 1, TUIR 2026).
- Limite reddito da lavoro dipendente/pensione anno precedente: 30.000€ (art. 233, comma 1, lett. f, TUIR 2026, D.Lgs. 117/2026).
- Imposta sostitutiva: 15%, oppure 5% per l'anno di avvio e i quattro successivi nei casi previsti (art. 235, commi 1-2, TUIR 2026).
- Il regime non applica la rivalsa IVA sulle operazioni nazionali (art. 234, comma 1, lett. a, TUIR 2026).

## Conseguenze

- La copia pubblica deve indicare che i risultati sono indicativi.
- La pagina delle fonti deve elencare le assunzioni correnti e il comportamento di storage.
- Ogni aggiornamento fiscale richiede un cambiamento coordinato tra costanti dati, copy UI e documentazione.
- Gli avvisi di soglia sono centralizzati in `public-copy.ts` per evitare duplicazioni nei calcolatori.
- Le fonti primarie da citare sono il TUIR 2026 (D.Lgs. 117/2026) e il TU-IVA 2026 (D.Lgs. 10/2026): la L. 190/2014, commi 54-89, è abrogata.
