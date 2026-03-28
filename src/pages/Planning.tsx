import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LIMITS } from "@/lib/constants"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "motion/react"
import { buildPlanningProjection } from "@/lib/calculations"
import { formatCurrency } from "@/lib/format"

const warningCopy = {
  'revenue-over-85000': {
    title: 'Attenzione',
    message: "Hai superato la soglia degli 85.000€. L'anno prossimo uscirai dal regime forfettario e passerai al regime ordinario, ma per l'anno in corso mantieni i benefici fiscali.",
  },
  'revenue-over-100000': {
    title: 'CRITICO',
    message: "Hai superato la soglia dei 100.000€. Esci IMMEDIATAMENTE dal regime forfettario nell'anno in corso. Dovrai applicare l'IVA sulle fatture successive all'incasso che ha causato il superamento.",
  },
} as const

const mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]

export default function Planning() {
  const [ricaviMensili, setRicaviMensili] = useState<number[]>(Array(12).fill(0))
  const result = buildPlanningProjection(ricaviMensili)

  const handleRicavoChange = (index: number, value: string) => {
    const newRicavi = [...ricaviMensili]
    newRicavi[index] = Number(value) || 0
    setRicaviMensili(newRicavi)
  }

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-12 pb-16 pt-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Pianificazione Previsionale</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Inserisci i ricavi previsti mese per mese per monitorare il limite degli 85.000€.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-8">
          <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Ricavi Mensili (€)</h2>
            <p className="text-sm text-zinc-500">Stima il fatturato per ogni mese.</p>
          </div>

          <div className="flex flex-col gap-4">
            {mesi.map((mese, index) => (
              <div key={mese} className="flex items-center gap-4">
                <Label htmlFor={`mese-${index}`} className="w-12 text-zinc-600 dark:text-zinc-400 font-medium">{mese}</Label>
                <Input id={`mese-${index}`} type="number" value={ricaviMensili[index] || ""} onChange={(e) => handleRicavoChange(index, e.target.value)} placeholder="0" className="text-right" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Proiezione Annuale</h3>

            <div className={`p-8 rounded-2xl border transition-colors duration-300 ${result.uscitaImmediata ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50" : result.limiteSuperato ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"}`}>
              <div className="flex flex-col items-center text-center gap-2">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Totale Ricavi Previsti</p>
                <p className={`text-5xl md:text-6xl font-semibold tracking-tight ${result.uscitaImmediata ? 'text-red-600 dark:text-red-400' : result.limiteSuperato ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-50'}`}>{formatCurrency(result.totaleAnnuo)}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Limite Forfettario: {formatCurrency(LIMITS.ricavi)}</p>
              </div>

              {result.warnings.map((warning) => (
                <motion.div key={warning.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-8 p-4 rounded-xl border text-sm leading-relaxed ${warning.severity === "critical" ? "bg-red-100/50 text-red-900 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800/50" : "bg-amber-100/50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800/50"}`}>
                  <strong className="font-semibold">{warningCopy[warning.code as keyof typeof warningCopy]?.title ?? 'Attenzione'}:</strong> {warningCopy[warning.code as keyof typeof warningCopy]?.message ?? warning.code}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Andamento Cumulato</h3>

            <div className="h-[400px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.projection} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                  <YAxis tickFormatter={(value) => `€${value / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dx={-10} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={LIMITS.ricavi} label={{ position: 'top', value: 'Limite 85k', fill: '#f59e0b', fontSize: 12 }} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
                  <ReferenceLine y={LIMITS.uscitaImmediata} label={{ position: 'top', value: 'Uscita 100k', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
                  <Line type="monotone" dataKey="cumulativeRevenue" name="Fatturato Cumulato" stroke="var(--color-chart-1)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-chart-1)', strokeWidth: 2, stroke: 'var(--color-background)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
