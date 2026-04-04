import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ATECO_CATEGORIES } from '@/lib/fiscal-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { calculateForfettario } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { warningCopy } from '@/lib/public-copy';
const formSchema = z.object({
  atecoId: z.string().min(1, 'Seleziona una categoria ATECO'),
  ricavi: z.number().min(0, 'I ricavi non possono essere negativi'),
  mesiAttivita: z.number().min(1).max(12),
  nuovaAttivita: z.boolean(),
  contributiVersati: z.number().min(0),
  speseDipendenti: z.number().min(0),
  redditoDipendente: z.number().min(0),
  tipoInps: z.enum(['gestioneSeparata', 'artigiani', 'commercianti', 'nessuno']),
  riduzioneInps: z.boolean().optional(),
});
type FormValues = z.infer<typeof formSchema>;
export default function Calculator() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      atecoId: '',
      ricavi: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      contributiVersati: 0,
      speseDipendenti: 0,
      redditoDipendente: 0,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
    },
  });
  const { watch, setValue, trigger } = form;
  const values = watch();
  const nextStep = async () => {
    let valid = false;
    if (step === 1) {
      valid = await trigger(['atecoId', 'ricavi', 'mesiAttivita', 'nuovaAttivita']);
    } else if (step === 2) {
      valid = await trigger(['tipoInps', 'riduzioneInps', 'contributiVersati']);
    } else if (step === 3) {
      valid = await trigger(['speseDipendenti', 'redditoDipendente']);
    }
    if (valid) {
      setStep((prev) => Math.min(prev + 1, totalSteps + 1));
    }
  };
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const result = calculateForfettario({ ...values, riduzioneInps: values.riduzioneInps ?? false });
  const {
    coefficiente,
    redditoLordo,
    redditoNettoImponibile,
    aliquotaImposta,
    impostaSostitutiva,
    inps: stimaInps,
    nettoStimato,
    warnings,
  } = result;
  const chartData = [
    { name: 'Netto Stimato', value: Math.max(0, nettoStimato), color: 'var(--color-chart-1)' },
    { name: 'Imposta Sostitutiva', value: impostaSostitutiva, color: 'var(--color-chart-2)' },
    { name: 'Contributi INPS', value: stimaInps.totale, color: 'var(--color-chart-3)' },
    {
      name: 'Costi Forfettari',
      value: values.ricavi - redditoLordo,
      color: 'var(--color-chart-4)',
    },
  ];
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Report EasyPIVA - Calcolo Forfettario 2026', 20, 20);
    doc.setFontSize(12);
    doc.text(`Ricavi: ${formatCurrency(values.ricavi)}`, 20, 40);
    doc.text(`Coefficiente Redditività: ${coefficiente * 100}%`, 20, 50);
    doc.text(`Reddito Lordo: ${formatCurrency(redditoLordo)}`, 20, 60);
    doc.text(`Contributi Dedotti: ${formatCurrency(values.contributiVersati)}`, 20, 70);
    doc.text(`Reddito Imponibile: ${formatCurrency(redditoNettoImponibile)}`, 20, 80);
    doc.text(
      `Imposta Sostitutiva (${aliquotaImposta * 100}%): ${formatCurrency(impostaSostitutiva)}`,
      20,
      90,
    );
    doc.text(`Stima INPS: ${formatCurrency(stimaInps.totale)}`, 20, 100);
    doc.text(`Netto Stimato: ${formatCurrency(nettoStimato)}`, 20, 110);
    doc.save('easypiva-report.pdf');
  };
  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-12 pb-16 pt-8">
      {' '}
      {/* Header */}{' '}
      <div className="flex flex-col gap-4">
        {' '}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {' '}
          Calcolatore Forfettario{' '}
        </h1>{' '}
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {' '}
          Stima imposte, contributi e netto in tasca per il 2026.{' '}
        </p>{' '}
      </div>{' '}
      {/* Progress Indicator */}{' '}
      {step <= totalSteps && (
        <div className="flex gap-2">
          {' '}
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'}`}
            />
          ))}{' '}
        </div>
      )}{' '}
      {/* Form Area */}{' '}
      <div className="relative min-h-[400px]">
        {' '}
        <AnimatePresence mode="wait">
          {' '}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-8"
            >
              {' '}
              <div className="flex flex-col gap-2">
                {' '}
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                  Dati Base
                </h2>{' '}
                <p className="text-sm text-zinc-500">
                  {' '}
                  Inserisci i dati principali della tua attività.{' '}
                </p>{' '}
              </div>{' '}
              <div className="space-y-4">
                {' '}
                <Label htmlFor="atecoId">Categoria ATECO</Label>{' '}
                <Select value={values.atecoId} onValueChange={(val) => setValue('atecoId', val)}>
                  {' '}
                  <SelectTrigger id="atecoId" className="w-full">
                    {' '}
                    <SelectValue placeholder="Seleziona la tua categoria..." />{' '}
                  </SelectTrigger>{' '}
                  <SelectContent>
                    {' '}
                    {ATECO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {' '}
                        {cat.name} ({cat.coefficient}%){' '}
                      </SelectItem>
                    ))}{' '}
                  </SelectContent>{' '}
                </Select>{' '}
                {form.formState.errors.atecoId && (
                  <p className="text-sm text-red-500">{form.formState.errors.atecoId.message}</p>
                )}{' '}
              </div>{' '}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {' '}
                <div className="space-y-4">
                  {' '}
                  <Label htmlFor="ricavi">Ricavi/Compensi Annui (€)</Label>{' '}
                  <Input
                    id="ricavi"
                    type="number"
                    placeholder="es. 45000"
                    value={values.ricavi || ''}
                    onChange={(e) => setValue('ricavi', Number(e.target.value))}
                    className="text-lg"
                  />{' '}
                </div>{' '}
                <div className="space-y-4">
                  {' '}
                  <Label htmlFor="mesiAttivita">Mesi di attività nell'anno</Label>{' '}
                  <Input
                    id="mesiAttivita"
                    type="number"
                    min="1"
                    max="12"
                    value={values.mesiAttivita}
                    onChange={(e) => setValue('mesiAttivita', Number(e.target.value))}
                    className="text-lg"
                  />{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex items-center justify-between py-4 border-y border-zinc-200 dark:border-zinc-800">
                {' '}
                <div className="space-y-1">
                  {' '}
                  <Label htmlFor="nuovaAttivita" className="text-base">
                    {' '}
                    Nuova Attività (Startup){' '}
                  </Label>{' '}
                  <p className="text-sm text-zinc-500">
                    {' '}
                    Aliquota agevolata al 5% per i primi 5 anni{' '}
                  </p>{' '}
                </div>{' '}
                <Switch
                  id="nuovaAttivita"
                  checked={values.nuovaAttivita}
                  onCheckedChange={(checked) => setValue('nuovaAttivita', checked)}
                />{' '}
              </div>{' '}
            </motion.div>
          )}{' '}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-8"
            >
              {' '}
              <div className="flex flex-col gap-2">
                {' '}
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                  {' '}
                  Contributi INPS{' '}
                </h2>{' '}
                <p className="text-sm text-zinc-500">Configura la tua cassa previdenziale.</p>{' '}
              </div>{' '}
              <div className="space-y-4">
                {' '}
                <Label htmlFor="tipoInps">Cassa Previdenziale</Label>{' '}
                <Select
                  value={values.tipoInps}
                  onValueChange={(val: FormValues['tipoInps']) => setValue('tipoInps', val)}
                >
                  {' '}
                  <SelectTrigger id="tipoInps">
                    {' '}
                    <SelectValue placeholder="Seleziona cassa..." />{' '}
                  </SelectTrigger>{' '}
                  <SelectContent>
                    {' '}
                    <SelectItem value="gestioneSeparata">Gestione Separata INPS</SelectItem>{' '}
                    <SelectItem value="artigiani">Gestione Artigiani INPS</SelectItem>{' '}
                    <SelectItem value="commercianti">Gestione Commercianti INPS</SelectItem>{' '}
                    <SelectItem value="nessuno">Cassa Privata / Altro</SelectItem>{' '}
                  </SelectContent>{' '}
                </Select>{' '}
              </div>{' '}
              {(values.tipoInps === 'artigiani' || values.tipoInps === 'commercianti') && (
                <div className="flex items-center justify-between py-4 border-y border-zinc-200 dark:border-zinc-800">
                  {' '}
                  <div className="space-y-1">
                    {' '}
                    <Label htmlFor="riduzioneInps" className="text-base">
                      {' '}
                      Riduzione INPS 35%{' '}
                    </Label>{' '}
                    <p className="text-sm text-zinc-500">
                      {' '}
                      Hai richiesto la riduzione per forfettari?{' '}
                    </p>{' '}
                  </div>{' '}
                  <Switch
                    id="riduzioneInps"
                    checked={values.riduzioneInps}
                    onCheckedChange={(checked) => setValue('riduzioneInps', checked)}
                  />{' '}
                </div>
              )}{' '}
              <div className="space-y-4">
                {' '}
                <div className="space-y-1">
                  {' '}
                  <Label htmlFor="contributiVersati">Contributi Versati (€)</Label>{' '}
                  <p className="text-sm text-zinc-500">Deducibili dal reddito lordo.</p>{' '}
                </div>{' '}
                <Input
                  id="contributiVersati"
                  type="number"
                  placeholder="es. 3500"
                  value={values.contributiVersati || ''}
                  onChange={(e) => setValue('contributiVersati', Number(e.target.value))}
                  className="text-lg"
                />{' '}
              </div>{' '}
            </motion.div>
          )}{' '}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-8"
            >
              {' '}
              <div className="flex flex-col gap-2">
                {' '}
                <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
                  {' '}
                  Verifica Limiti{' '}
                </h2>{' '}
                <p className="text-sm text-zinc-500">
                  {' '}
                  Assicurati di rispettare i requisiti del regime.{' '}
                </p>{' '}
              </div>{' '}
              <div className="space-y-4">
                {' '}
                <div className="space-y-1">
                  {' '}
                  <Label htmlFor="speseDipendenti">Spese per dipendenti (€)</Label>{' '}
                  <p className="text-sm text-zinc-500">Limite massimo 20.000€.</p>{' '}
                </div>{' '}
                <Input
                  id="speseDipendenti"
                  type="number"
                  value={values.speseDipendenti || ''}
                  onChange={(e) => setValue('speseDipendenti', Number(e.target.value))}
                  className="text-lg"
                />{' '}
              </div>{' '}
              <div className="space-y-4">
                {' '}
                <div className="space-y-1">
                  {' '}
                  <Label htmlFor="redditoDipendente">
                    {' '}
                    Reddito da lavoro dipendente anno precedente (€){' '}
                  </Label>{' '}
                  <p className="text-sm text-zinc-500">Limite massimo 35.000€.</p>{' '}
                </div>{' '}
                <Input
                  id="redditoDipendente"
                  type="number"
                  value={values.redditoDipendente || ''}
                  onChange={(e) => setValue('redditoDipendente', Number(e.target.value))}
                  className="text-lg"
                />{' '}
              </div>{' '}
            </motion.div>
          )}{' '}
          {step > totalSteps && (
            <motion.div
              key="results"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-12"
            >
              {' '}
              {warnings.length > 0 && (
                <div className="flex flex-col gap-3">
                  {' '}
                  {warnings.map((w, i) => (
                    <Alert
                      key={i}
                      variant={w.severity === 'critical' ? 'destructive' : 'default'}
                      className={
                        w.severity !== 'critical'
                          ? 'border-zinc-300 text-zinc-700 dark:text-zinc-300'
                          : ''
                      }
                    >
                      {' '}
                      <AlertCircle className="h-4 w-4" />{' '}
                      <AlertTitle>
                        {' '}
                        {warningCopy[w.code as keyof typeof warningCopy]?.title ??
                          'Attenzione'}{' '}
                      </AlertTitle>{' '}
                      <AlertDescription>
                        {' '}
                        {warningCopy[w.code as keyof typeof warningCopy]?.message ?? w.code}{' '}
                      </AlertDescription>{' '}
                    </Alert>
                  ))}{' '}
                </div>
              )}{' '}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {' '}
                {/* Riepilogo */}{' '}
                <div className="flex flex-col gap-6">
                  {' '}
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    {' '}
                    Riepilogo Fiscale{' '}
                  </h3>{' '}
                  <div className="flex flex-col gap-4 text-sm">
                    {' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="text-zinc-500">Ricavi Lordi</span>{' '}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {' '}
                        {formatCurrency(values.ricavi)}{' '}
                      </span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="text-zinc-500">
                        Reddito Lordo ({coefficiente * 100}%)
                      </span>{' '}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {' '}
                        {formatCurrency(redditoLordo)}{' '}
                      </span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center">
                      {' '}
                      <span className="text-zinc-500">Imponibile Netto</span>{' '}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {' '}
                        {formatCurrency(redditoNettoImponibile)}{' '}
                      </span>{' '}
                    </div>{' '}
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />{' '}
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                      {' '}
                      <span>Imposta Sostitutiva ({aliquotaImposta * 100}%)</span>{' '}
                      <span>-{formatCurrency(impostaSostitutiva)}</span>{' '}
                    </div>{' '}
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                      {' '}
                      <span>Stima INPS Anno</span>{' '}
                      <span>-{formatCurrency(stimaInps.totale)}</span>{' '}
                    </div>{' '}
                    <div className="h-px bg-zinc-900 dark:bg-zinc-100 my-2" />{' '}
                    <div className="flex justify-between items-center text-lg">
                      {' '}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {' '}
                        Netto Stimato{' '}
                      </span>{' '}
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {' '}
                        {formatCurrency(nettoStimato)}{' '}
                      </span>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                {/* Grafico */}{' '}
                <div className="flex flex-col gap-6">
                  {' '}
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    {' '}
                    Ripartizione{' '}
                  </h3>{' '}
                  <div className="h-[250px] w-full min-w-0">
                    {' '}
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                      minHeight={250}
                      initialDimension={{ width: 520, height: 250 }}
                    >
                      {' '}
                      <PieChart>
                        {' '}
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {' '}
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}{' '}
                        </Pie>{' '}
                        <RechartsTooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e4e4e7',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />{' '}
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />{' '}
                      </PieChart>{' '}
                    </ResponsiveContainer>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              {/* Azioni */}{' '}
              <div className="flex flex-wrap gap-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                {' '}
                <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                  {' '}
                  <Download className="w-4 h-4" /> Esporta PDF{' '}
                </Button>{' '}
                <Button onClick={() => setStep(1)} variant="ghost" className="ml-auto">
                  {' '}
                  Ricalcola{' '}
                </Button>{' '}
              </div>{' '}
            </motion.div>
          )}{' '}
        </AnimatePresence>{' '}
      </div>{' '}
      {/* Navigation */}{' '}
      {step <= totalSteps && (
        <div className="flex justify-between items-center pt-8 border-t border-zinc-200 dark:border-zinc-800">
          {' '}
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
            className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {' '}
            <ArrowLeft className="w-4 h-4" /> Indietro{' '}
          </Button>{' '}
          <Button
            onClick={nextStep}
            className="gap-2 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {' '}
            {step === totalSteps ? 'Calcola Risultati' : 'Avanti'}{' '}
            {step !== totalSteps && <ArrowRight className="w-4 h-4" />}{' '}
          </Button>{' '}
        </div>
      )}{' '}
    </div>
  );
}
