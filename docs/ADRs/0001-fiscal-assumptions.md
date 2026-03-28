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

## Conseguenze

- La copia pubblica deve indicare che i risultati sono indicativi.
- La pagina delle fonti deve elencare le assunzioni correnti e il comportamento di storage.
- Ogni aggiornamento fiscale richiede un cambiamento coordinato tra costanti dati, copy UI e documentazione.
