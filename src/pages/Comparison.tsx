import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ATECO_CATEGORIES } from "@/lib/constants"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts"
import { Switch } from "@/components/ui/switch"
import { motion } from "motion/react"
import { compareRegimes } from "@/lib/calculations"
import { formatCurrency } from "@/lib/format"

export default function Comparison() {
  const [ricavi, setRicavi] = useState(50000)
  const [costiReali, setCostiReali] = useState(10000)
  const [atecoId, setAtecoId] = useState("8")
  const [nuovaAttivita, setNuovaAttivita] = useState(false)

  const result = compareRegimes({ ricavi, costiReali, atecoId, nuovaAttivita })
  const chartData = [
    {
      name: "Forfettario",
      Netto: Math.max(0, result.forfettario.netto),
      Tasse: result.forfettario.tasse,
      INPS: result.forfettario.inps,
      Costi: result.forfettario.costi,
    },
    {
      name: "Ordinario",
      Netto: Math.max(0, result.ordinario.netto),
      Tasse: result.ordinario.tasse,
      INPS: result.ordinario.inps,
      Costi: result.ordinario.costi,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-12 pb-16 pt-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Confronto Regimi 2026</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Scopri se ti conviene il regime forfettario o quello ordinario.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-8">
          <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Parametri</h2>
            <p className="text-sm text-zinc-500">Regola i valori per simulare il confronto.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Label htmlFor="ricavi" className="text-zinc-700 dark:text-zinc-300">Ricavi Annui Stimati (€)</Label>
              <Input id="ricavi" type="number" value={ricavi} onChange={(e) => setRicavi(Number(e.target.value))} className="text-lg" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="costiReali" className="text-zinc-700 dark:text-zinc-300">Costi Reali Annui (€)</Label>
                <p className="text-xs text-zinc-500">Spese deducibili nel regime ordinario</p>
              </div>
              <Input id="costiReali" type="number" value={costiReali} onChange={(e) => setCostiReali(Number(e.target.value))} className="text-lg" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="atecoId" className="text-zinc-700 dark:text-zinc-300">Categoria ATECO (per Forfettario)</Label>
              <Select value={atecoId} onValueChange={setAtecoId}>
                <SelectTrigger id="atecoId"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ATECO_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name} ({cat.coefficient}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-4 border-y border-zinc-200 dark:border-zinc-800">
              <Label htmlFor="nuovaAttivita" className="text-zinc-700 dark:text-zinc-300">Nuova Attività (5%)</Label>
              <Switch id="nuovaAttivita" checked={nuovaAttivita} onCheckedChange={setNuovaAttivita} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Conviene il {result.winner === 'forfettario' ? 'Forfettario' : 'Ordinario'}!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Differenza netta: <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(Math.abs(result.deltaNetto))}</span> all'anno.
              </p>
            </div>

            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `€${value / 1000}k`} tick={{ fill: '#71717a' }} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Bar dataKey="Netto" stackId="a" fill="var(--color-chart-1)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Tasse" stackId="a" fill="var(--color-chart-2)" />
                  <Bar dataKey="INPS" stackId="a" fill="var(--color-chart-3)" />
                  <Bar dataKey="Costi" stackId="a" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <div className={`flex flex-col gap-4 p-6 rounded-xl transition-colors ${result.winner === 'forfettario' ? "bg-zinc-50 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800" : ""}`}>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Regime Forfettario</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-zinc-600 dark:text-zinc-400">Ricavi:</span><span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(ricavi)}</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">Costi Forfettari:</span><span className="text-zinc-500">-{formatCurrency(result.forfettario.costi)}</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">INPS (Stima):</span><span className="text-zinc-500">-{formatCurrency(result.forfettario.inps)}</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">Imposta ({nuovaAttivita ? '5%' : '15%'}):</span><span className="text-zinc-500">-{formatCurrency(result.forfettario.tasse)}</span></div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                <div className="flex justify-between items-center text-base"><span className="font-medium text-zinc-900 dark:text-zinc-100">Netto:</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(result.forfettario.netto)}</span></div>
              </div>
            </div>

            <div className={`flex flex-col gap-4 p-6 rounded-xl transition-colors ${result.winner === 'ordinario' ? "bg-zinc-50 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800" : ""}`}>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Regime Ordinario</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-zinc-600 dark:text-zinc-400">Ricavi:</span><span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(ricavi)}</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">Costi Reali:</span><span className="text-zinc-500">-{formatCurrency(costiReali)}</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">INPS (Stima):</span><span className="text-zinc-500">-{formatCurrency(result.ordinario.inps)}</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">IRPEF + Addizionali:</span><span className="text-zinc-500">-{formatCurrency(result.ordinario.tasse)}</span></div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                <div className="flex justify-between items-center text-base"><span className="font-medium text-zinc-900 dark:text-zinc-100">Netto:</span><span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(result.ordinario.netto)}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
