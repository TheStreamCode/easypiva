import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INPS_RATES } from "@/lib/constants"
import { Switch } from "@/components/ui/switch"
import { motion } from "motion/react"

export default function Contributions() {
  const [redditoLordo, setRedditoLordo] = useState(30000)
  const [tipoInps, setTipoInps] = useState("gestioneSeparata")
  const [riduzioneInps, setRiduzioneInps] = useState(false)

  const formatCurrency = (val: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val)

  let fisso = 0
  let variabile = 0
  let totale = 0

  if (tipoInps === "gestioneSeparata") {
    totale = redditoLordo * INPS_RATES.gestioneSeparata.rate
    variabile = totale
  } else if (tipoInps === "artigiani" || tipoInps === "commercianti") {
    const rates = INPS_RATES[tipoInps]
    const riduzione = riduzioneInps ? 0.65 : 1

    fisso = rates.minimalContribution * riduzione
    
    if (redditoLordo > rates.minimalIncome) {
      variabile = (redditoLordo - rates.minimalIncome) * rates.rateOverMinimal * riduzione
    }
    
    totale = fisso + variabile
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12 pb-16 pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Contributi INPS 2026
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Simula i contributi previdenziali in base alla tua cassa.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16"
      >
        {/* Dati (Sidebar) */}
        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Dati</h2>
            <p className="text-sm text-zinc-500">Inserisci il reddito e seleziona la cassa.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="redditoLordo" className="text-zinc-700 dark:text-zinc-300">Reddito Lordo Imponibile (€)</Label>
                <p className="text-xs text-zinc-500">Ricavi × Coefficiente (se forfettario)</p>
              </div>
              <Input
                id="redditoLordo"
                type="number"
                value={redditoLordo}
                onChange={(e) => setRedditoLordo(Number(e.target.value))}
                className="text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="tipoInps" className="text-zinc-700 dark:text-zinc-300">Gestione INPS</Label>
              <Select value={tipoInps} onValueChange={setTipoInps}>
                <SelectTrigger id="tipoInps">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestioneSeparata">Gestione Separata (26,07%)</SelectItem>
                  <SelectItem value="artigiani">Artigiani</SelectItem>
                  <SelectItem value="commercianti">Commercianti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(tipoInps === "artigiani" || tipoInps === "commercianti") && (
              <div className="flex items-center justify-between py-4 border-y border-zinc-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <Label htmlFor="riduzioneInps" className="text-zinc-700 dark:text-zinc-300">Riduzione 35% Forfettari</Label>
                  <p className="text-xs text-zinc-500">Solo per regime forfettario</p>
                </div>
                <Switch
                  id="riduzioneInps"
                  checked={riduzioneInps}
                  onCheckedChange={setRiduzioneInps}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Riepilogo (Main Content) */}
        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Riepilogo Contributi
            </h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Contributo Fisso (Minimale)</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(fisso)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Contributo Variabile (Eccedenza)</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(variabile)}</span>
              </div>
              
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
              
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Totale Annuo</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(totale)}</span>
              </div>
            </div>

            {(tipoInps === "artigiani" || tipoInps === "commercianti") && (
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Scadenze Rate Fisse (Stima)</h4>
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex justify-between items-center">
                    <span>16 Maggio 2026</span> 
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(fisso / 4)}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>20 Agosto 2026</span> 
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(fisso / 4)}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>16 Novembre 2026</span> 
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(fisso / 4)}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>16 Febbraio 2027</span> 
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(fisso / 4)}</span>
                  </li>
                </ul>
                <p className="text-xs text-zinc-500 mt-6 leading-relaxed">
                  * I contributi variabili si pagano con il saldo e gli acconti delle imposte (Giugno/Novembre).
                </p>
              </div>
            )}
            
            {tipoInps === "gestioneSeparata" && (
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  La Gestione Separata non ha rate fisse. Si paga in percentuale sul reddito effettivo tramite saldo e acconti (Giugno/Novembre).
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
