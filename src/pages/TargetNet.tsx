import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ATECO_CATEGORIES } from "@/lib/constants"
import { Switch } from "@/components/ui/switch"
import { Target } from "lucide-react"
import { motion } from "motion/react"
import { calculateTargetNet } from "@/lib/calculations"
import { formatCurrency } from "@/lib/format"
import type { InpsType } from "@/lib/fiscal-data"

export default function TargetNet() {
  const [nettoMensile, setNettoMensile] = useState(2000)
  const [atecoId, setAtecoId] = useState("8")
  const [nuovaAttivita, setNuovaAttivita] = useState(false)
  const [tipoInps, setTipoInps] = useState<InpsType>("gestioneSeparata")
  const [riduzioneInps, setRiduzioneInps] = useState(false)

  const result = calculateTargetNet({ nettoMensile, atecoId, nuovaAttivita, tipoInps, riduzioneInps })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12 pb-16 pt-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Quanto Fatturare per Netto</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Scopri quanto devi fatturare per ottenere il netto mensile desiderato.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Obiettivo e Parametri</h2>
            <p className="text-sm text-zinc-500">Imposta il tuo obiettivo e i dati fiscali.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Label htmlFor="nettoMensile" className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Netto Mensile Desiderato (€)</Label>
              <Input id="nettoMensile" type="number" className="text-xl font-semibold h-12" value={nettoMensile} onChange={(e) => setNettoMensile(Number(e.target.value))} />
              <p className="text-sm text-zinc-500">Netto annuo: <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatCurrency(result.nettoAnnuo)}</span></p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="atecoId" className="text-zinc-700 dark:text-zinc-300">Categoria ATECO</Label>
              <Select value={atecoId} onValueChange={setAtecoId}>
                <SelectTrigger id="atecoId"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ATECO_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name} ({cat.coefficient}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="tipoInps" className="text-zinc-700 dark:text-zinc-300">Gestione INPS</Label>
              <Select value={tipoInps} onValueChange={(value) => setTipoInps(value as InpsType)}>
                <SelectTrigger id="tipoInps"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gestioneSeparata">Gestione Separata</SelectItem>
                  <SelectItem value="artigiani">Artigiani</SelectItem>
                  <SelectItem value="commercianti">Commercianti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="nuovaAttivita" className="text-zinc-700 dark:text-zinc-300">Nuova Attività (5%)</Label>
                <Switch id="nuovaAttivita" checked={nuovaAttivita} onCheckedChange={setNuovaAttivita} />
              </div>

              {(tipoInps === "artigiani" || tipoInps === "commercianti") && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="riduzioneInps" className="text-zinc-700 dark:text-zinc-300">Riduzione INPS 35%</Label>
                  <Switch id="riduzioneInps" checked={riduzioneInps} onCheckedChange={setRiduzioneInps} />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Target className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Ricavi Necessari</h3>
            </div>

            <div className="text-center py-8">
              <p className="text-sm text-zinc-500 mb-2">Devi fatturare circa</p>
              <p className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{formatCurrency(result.ricaviNecessari)}</p>
              <p className="text-sm text-zinc-500 mt-2">all'anno</p>
            </div>

            <div className="space-y-4 text-sm pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Ripartizione Stimata</h4>

              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Netto in tasca</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(result.nettoAnnuo)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Tasse ({nuovaAttivita ? '5%' : '15%'})</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(result.tasseStimate)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>INPS</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(result.inpsStimato)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Costi Forfettari</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(result.costiForfettari)}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-6 leading-relaxed">* I calcoli sono approssimati e non tengono conto di eventuali contributi pregressi o deduzioni extra.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
