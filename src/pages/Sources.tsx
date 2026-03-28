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
    <div className="max-w-3xl mx-auto flex flex-col gap-12 pb-16 pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Informativa e Privacy
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Termini di utilizzo, trattamento dei dati (GDPR) e fonti normative.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-12"
      >
        {/* Disclaimer */}
        <motion.div
          variants={itemVariants}
          className="p-6 md:p-8 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-medium text-blue-900 dark:text-blue-100">
              Termini di Servizio e Disclaimer
            </h2>
          </div>
          <div className="space-y-4 text-blue-900/80 dark:text-blue-200/80 leading-relaxed">
            <p>
              <strong className="font-semibold text-blue-900 dark:text-blue-100">EasyPIVA</strong> è
              un'applicazione web fornita a scopo puramente informativo e divulgativo.
            </p>
            <p>
              I calcoli, le stime e le simulazioni generati da questo strumento sono basati
              sull'interpretazione delle norme fiscali vigenti (inclusa la Legge di Bilancio 2026)
              ma{' '}
              <strong className="font-semibold text-blue-900 dark:text-blue-100">
                NON costituiscono parere professionale, legale o fiscale
              </strong>
              , né sostituiscono in alcun modo la consulenza di un commercialista o di un consulente
              del lavoro iscritto all'albo.
            </p>
            <p>
              L'utente utilizza l'applicazione a proprio rischio. Il progetto è mantenuto
              internamente da Michael Gasperini / Mikesoft e non prevede collaboratori esterni; il
              progetto non assume alcuna responsabilità per eventuali errori, inesattezze, omissioni
              o per decisioni finanziarie e fiscali prese sulla base dei risultati forniti da
              EasyPIVA.
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-12">
          {/* Privacy Policy & GDPR */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Lock className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Privacy Policy (GDPR)
              </h2>
            </div>
            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Nel rispetto del Regolamento (UE) 2016/679 (GDPR), ti informiamo che{' '}
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  EasyPIVA è progettata per garantire la massima privacy "by design"
                </strong>
                .
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-zinc-700 dark:text-zinc-300">
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Nessun dato personale:
                  </strong>{' '}
                  L'applicazione non richiede registrazione, non raccoglie dati anagrafici (nome,
                  email, ecc.) e non profila gli utenti.
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Elaborazione locale:
                  </strong>{' '}
                  Tutti i dati finanziari inseriti nei calcolatori (ricavi, costi, ecc.) vengono
                  elaborati esclusivamente in locale sul tuo dispositivo (browser).
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Nessun trasferimento:
                  </strong>{' '}
                  Nessun dato finanziario o personale viene inviato, salvato o elaborato su server
                  esterni o database di terze parti.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Cookie Policy & Local Storage */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Database className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Cookie Policy e Local Storage
              </h2>
            </div>
            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                EasyPIVA{' '}
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  non utilizza cookie di profilazione o tracciamento
                </strong>{' '}
                (es. Google Analytics, Meta Pixel).
              </p>
              <p>
                L'applicazione fa uso esclusivamente della tecnologia{' '}
                <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                  Local Storage
                </strong>{' '}
                del tuo browser per finalità strettamente tecniche e di funzionamento:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-zinc-700 dark:text-zinc-300">
                <li>
                  Memorizzare l'accettazione del disclaimer iniziale per non riproporlo ad ogni
                  visita.
                </li>
              </ul>
              <p>
                Puoi cancellare questi dati in qualsiasi momento svuotando la cache e i dati dei
                siti web dalle impostazioni del tuo browser.
              </p>
            </div>
          </motion.div>

          {/* Fonti Normative */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Info className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Fonti Normative 2026
              </h2>
            </div>
            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>I calcoli si basano sui seguenti riferimenti normativi (aggiornati al 2026):</p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-zinc-700 dark:text-zinc-300">
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Regime Forfettario:
                  </strong>{' '}
                  Limite ricavi confermato a 85.000€ (uscita immediata a 100.000€). Imposta
                  sostitutiva al 15% (5% per le startup nei primi 5 anni).
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    Scaglioni IRPEF (Regime Ordinario):
                  </strong>{' '}
                  Fino a 28.000€ (23%), da 28.001€ a 50.000€ (35%), oltre 50.000€ (43%).
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    INPS Gestione Separata:
                  </strong>{' '}
                  Aliquota stimata al 26,07%.
                </li>
                <li>
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    INPS Artigiani e Commercianti:
                  </strong>{' '}
                  Contributo fisso minimale stimato su un reddito di ~18.415€. Riduzione del 35%
                  applicabile su richiesta per i forfettari.
                </li>
              </ul>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://www.agenziaentrate.gov.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Agenzia delle Entrate <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://www.inps.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  INPS <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
