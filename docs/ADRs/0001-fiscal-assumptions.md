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
- Il preventivo usa lo stesso principio local-first: bozza in `localStorage`, export PDF dal DOM renderizzato.

## Aliquote IRPEF 2026

- Fino a 28.000€: 23%
- Da 28.001€ a 50.000€: 33%
- Oltre 50.000€: 43%

## Contributi INPS (valori 2026)

- Gestione Separata: 26,07% (Circ. INPS 8/2026), entro il massimale di 122.295€.
- Artigiani: minimale reddito 18.808€, contributo fisso 4.521,36€, aliquota 24% oltre il minimale.
- Commercianti: minimale reddito 18.808€, contributo fisso 4.611,64€, aliquota 24,48% oltre il minimale.
- Aliquota aggiuntiva +1% sul reddito oltre 56.224€ (25% / 25,48%), fino al massimale applicabile (Circ. INPS 14/2026).
- Massimale Artigiani/Commercianti: 93.707€ per chi possiede anzianità contributiva al 31 dicembre 1995; 122.295€ per chi è privo di anzianità a tale data. L'interfaccia richiede questa informazione e usa il secondo caso come default compatibile con le simulazioni precedenti.
- Riduzione 35% per forfettari (artigiani/commercianti).

## Regime Ordinario (confronto)

- IRPEF a scaglioni 2026 (vedi sopra).
- Detrazione per redditi di lavoro autonomo (art. 13 c. 5-5bis TUIR), decrescente e azzerata oltre 50.000€.
- Addizionali regionali + comunali stimate con un'aliquota media rappresentativa del 2% (le aliquote reali variano per regione e comune).
- Il confronto è una stima semplificata: non considera detrazioni e deduzioni ulteriori, IRAP, ISA o la specifica residenza.

## Regime Forfettario

- Limite ricavi: 85.000€ (ragguagliato ad anno per le nuove attività).
- Uscita immediata: 100.000€ (sui ricavi effettivamente incassati, non ragguagliati).
- Limite reddito da lavoro dipendente/pensione anno precedente: 35.000€ (confermato per il 2026).
- Imposta sostitutiva: 15% (5% per startup primi 5 anni).

## Conseguenze

- La copia pubblica deve indicare che i risultati sono indicativi.
- La pagina delle fonti deve elencare le assunzioni correnti e il comportamento di storage.
- Ogni aggiornamento fiscale richiede un cambiamento coordinato tra costanti dati, copy UI e documentazione.
- Gli avvisi di soglia sono centralizzati in `public-copy.ts` per evitare duplicazioni nei calcolatori.
