# Privacy e Storage Locale

## Principi operativi

EasyPIVA è progettata con un approccio `local-first`.

- I calcoli fiscali vengono eseguiti nel browser.
- La generazione del preventivo e l'export PDF avvengono localmente.
- Il progetto non richiede account utente.
- Il codice del repository non invia automaticamente i dati dei calcolatori o del preventivo a backend applicativi.

## Dati elaborati localmente

L'app può elaborare nel browser:

- dati economici inseriti nei calcolatori;
- ipotesi su regime fiscale, contributi e obiettivi di netto;
- contenuti del preventivo, inclusi dati fornitore, dati cliente, righe economiche, note e dettagli di pagamento;
- eventuale logo caricato nel preventivo per la resa in anteprima ed export.

## Dati persistiti nel browser

EasyPIVA usa `localStorage` per un set limitato di informazioni.

| Chiave                        | Finalità                                         | Dati salvati                                                               |
| ----------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `easypiva-disclaimer-storage` | Ricordare l'accettazione del disclaimer iniziale | Stato booleano di accettazione                                             |
| `easypiva-theme-mode`         | Ricordare il tema scelto                         | Valore `light` o `dark`                                                    |
| `easypiva.quote-draft`        | Autosalvare la bozza del preventivo              | Dati fornitore, cliente, righe, importi, pagamenti, note ed eventuale logo |
| `easypiva-storage`            | Compatibilità legacy                             | Vecchia chiave del disclaimer, letta solo in migrazione                    |

La bozza del preventivo puo contenere dati personali o aziendali immessi volontariamente dall'utente. Questi dati restano sul dispositivo e nel profilo browser in uso finché non vengono rimossi.

Se `localStorage` non e disponibile o non ha spazio sufficiente, l'app continua a funzionare ma mostra un avviso visibile che indica il fallimento dell'autosalvataggio della bozza.

Per ridurre il rischio di errori di persistenza, il logo caricato nel preventivo viene accettato solo entro un limite dimensionale definito nel frontend prima della conversione in data URL.

## Cosa non fa il codice dell'app

- Non crea account o sessioni utente.
- Non implementa analytics o cookie di profilazione.
- Non sincronizza automaticamente i dati verso API o database del progetto.

Se l'utente apre link esterni verso siti terzi, la navigazione successiva ricade nelle policy del sito di destinazione.

## Come cancellare i dati locali

- Rimuovere i dati del sito dalle impostazioni del browser.
- Eliminare le singole chiavi da `localStorage` tramite DevTools, se serve un reset selettivo.
- Su dispositivi condivisi, cancellare la bozza del preventivo dopo l'uso è la scelta più prudente.

## Note di manutenzione

Se cambia il comportamento di persistenza o il perimetro dei dati trattati, aggiorna in modo coordinato:

- `docs/privacy-and-storage.md`
- `docs/architecture.md`
- `src/pages/Sources.tsx`
- eventuale copy pubblica o documentazione legale correlata
