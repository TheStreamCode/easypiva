# 0001 - Assunzioni fiscali

## Stato

Accettato

## Contesto

EasyPIVA fornisce simulazioni fiscali indicative per utenti con Partita IVA italiana. L'app deve mantenere trasparenza sulle assunzioni alla base di ogni calcolo.

## Decisione

- Usare soglie e aliquote fisse 2026 in `src/lib/fiscal-data.ts`.
- Trattare i risultati come stime, non come consulenza professionale.
- Mantenere tutti i calcoli lato client.
- Persistire solo preferenze non sensibili, come il disclaimer e il tema.

## Aliquote IRPEF 2026

- Fino a 28.000€: 23%
- Da 28.001€ a 50.000€: 33%
- Oltre 50.000€: 43%

## Contributi INPS

- Gestione Separata: 26,07%
- Artigiani: minimale 18.415€, aliquota 24% oltre il minimale
- Commercianti: minimale 18.415€, aliquota 24,48% oltre il minimale
- Riduzione 35% per forfettari (artigiani/commercianti)

## Regime Forfettario

- Limite ricavi: 85.000€
- Uscita immediata: 100.000€
- Imposta sostitutiva: 15% (5% per startup primi 5 anni)

## Conseguenze

- La copia pubblica deve indicare che i risultati sono indicativi.
- La pagina delle fonti deve elencare le assunzioni correnti e il comportamento di storage.
- Ogni aggiornamento fiscale richiede un cambiamento coordinato tra costanti dati, copy UI e documentazione.
- Gli avvisi di soglia sono centralizzati in `public-copy.ts` per evitare duplicazioni nei calcolatori.
