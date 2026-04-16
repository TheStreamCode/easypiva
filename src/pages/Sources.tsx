import { Info, ExternalLink, ShieldAlert, Lock, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Sources() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 pb-16 pt-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
          Informativa e Privacy
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Condizioni d'uso, privacy by design, storage locale e fonti normative.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-12"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20 md:p-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-medium text-blue-900 dark:text-blue-100">
              Condizioni di utilizzo e disclaimer
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed text-blue-900/80 dark:text-blue-200/80">
            <p>
              <strong className="font-semibold text-blue-900 dark:text-blue-100">EasyPIVA</strong> è
              uno strumento informativo per simulazioni fiscali indicative e per la creazione di
              preventivi locali.
            </p>
            <p>
              I risultati mostrati dall'app derivano da assunzioni fiscali documentate e da dati
              inseriti dall'utente, ma{' '}
              <strong className="font-semibold text-blue-900 dark:text-blue-100">
                non costituiscono consulenza fiscale, legale o contabile
              </strong>
              .
            </p>
            <p>
              Prima di prendere decisioni economiche o fiscali, è opportuno verificare i risultati
              con un commercialista o con un consulente del lavoro abilitato.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-12">
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <Lock className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Privacy by design
              </h2>
            </div>
            <div className="space-y-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                EasyPIVA adotta un modello{' '}
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  local-first
                </strong>
                : i calcoli e la generazione del preventivo avvengono nel browser, senza account
                utente e senza backend applicativo dedicato.
              </p>
              <ul className="ml-2 list-inside list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
                <li>L'app non richiede registrazione e non crea profili utente.</li>
                <li>
                  I dati inseriti nei calcolatori vengono elaborati localmente sul dispositivo in
                  uso.
                </li>
                <li>Il codice applicativo non implementa analytics o cookie di profilazione.</li>
                <li>
                  Eventuali link verso siti esterni vengono aperti solo su azione esplicita
                  dell'utente.
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <Database className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Storage locale nel browser
              </h2>
            </div>
            <div className="space-y-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                EasyPIVA usa il{' '}
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  localStorage
                </strong>{' '}
                del browser solo per finalità tecniche e di continuità d'uso.
              </p>
              <ul className="ml-2 list-inside list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
                <li>Memorizza l'accettazione del disclaimer iniziale.</li>
                <li>Memorizza la preferenza del tema chiaro o scuro.</li>
                <li>
                  Salva automaticamente la bozza del preventivo, inclusi i dati che l'utente decide
                  di inserire nel form.
                </li>
              </ul>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                La bozza del preventivo può contenere dati personali o aziendali, come nominativi,
                indirizzi, email, partita IVA, codice fiscale, dettagli di pagamento, note ed
                eventuale logo. Questi dati restano nel browser finché non vengono rimossi.
              </div>
              <p>
                Se utilizzi un dispositivo condiviso, è consigliabile cancellare i dati del sito al
                termine dell'uso.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <Info className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Fonti normative 2026
              </h2>
            </div>
            <div className="space-y-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                I calcoli si basano sulle assunzioni fiscali documentate nel progetto e sui
                principali riferimenti istituzionali aggiornati al 2026.
              </p>
              <ul className="ml-2 list-inside list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Regime forfettario:
                  </strong>{' '}
                  limite ricavi a 85.000 euro, uscita immediata a 100.000 euro, imposta sostitutiva
                  al 15% o al 5% nei casi agevolati previsti.
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Regime ordinario:
                  </strong>{' '}
                  scaglioni IRPEF 2026 e confronto netto fiscale contributivo.
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Contributi INPS:
                  </strong>{' '}
                  Gestione Separata, Artigiani e Commercianti secondo le ipotesi correnti del
                  progetto.
                </li>
              </ul>
              <div className="mt-4 flex gap-4">
                <a
                  href="https://www.agenziaentrate.gov.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Agenzia delle Entrate <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://www.inps.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  INPS <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
