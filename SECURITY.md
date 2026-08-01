# Security Policy

## Ambito

EasyPIVA accetta segnalazioni relative a:

- vulnerabilità del frontend o della supply chain;
- problemi di privacy o disclosure non corretta dei dati locali;
- comportamenti che possano esporre contenuti salvati nel browser;
- configurazioni di build o deploy che introducano un rischio concreto.

## Come segnalare

Usa preferibilmente il pulsante **Report a vulnerability** nella sezione Security del repository, che apre una segnalazione privata. In alternativa, invia una mail a `info@mikesoft.it` con oggetto `EasyPIVA Security Report`.

Non aprire issue pubbliche per vulnerabilità, proof of concept sfruttabili o problemi che possano esporre dati locali dell'utente.

Nel messaggio includi, se possibile:

- descrizione del problema;
- impatto atteso;
- passaggi per riprodurlo;
- versione, commit o branch coinvolto;
- screenshot, log o proof of concept minimali.

Per proteggere gli utenti e il progetto, evita la disclosure pubblica prima di un primo triage.

## Versioni supportate

Le segnalazioni vengono valutate con priorità sulla versione corrente del branch `main` e sull'ultima build pubblicata derivata da quel ramo.

## Tempi di risposta

L'obiettivo è confermare la ricezione entro 5 giorni lavorativi e fornire aggiornamenti quando il problema è riproducibile e classificato.

## Controlli automatizzati

Il repository usa:

- CI GitHub con `npm run ci`;
- Dependabot Alerts e pull request automatiche per gli aggiornamenti di sicurezza;
- Dependency Review sulle pull request che modificano dipendenze.
- CodeQL, secret scanning e push protection su GitHub.

Questi controlli riducono il rischio supply-chain, ma non sostituiscono la segnalazione privata di vulnerabilità reali.

## Fuori ambito

- richieste di supporto generiche non legate alla sicurezza;
- domande sulle regole fiscali senza impatto di sicurezza o privacy;
- problemi derivanti da modifiche fatte in fork di terze parti senza riproduzione sul codice upstream.
