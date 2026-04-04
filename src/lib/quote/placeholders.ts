import type { Quote } from './types';

const placeholderLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="44" viewBox="0 0 160 44" fill="none"><rect width="160" height="44" rx="12" fill="#111827"/><path d="M22 13h7.4c4.3 0 7.1 2.2 7.1 5.9 0 3.8-2.8 6-7.1 6H26v6h-4V13Zm4 8.7h3.1c2.1 0 3.3-1 3.3-2.8s-1.2-2.7-3.3-2.7H26v5.5Z" fill="#F9FAFB"/><path d="M45.5 31c-3.8 0-6.2-2.5-6.2-6.5 0-4 2.4-6.5 6.2-6.5 3.7 0 6 2.4 6 6.2V25h-8.4c.2 1.8 1.3 2.8 3 2.8 1.2 0 2.2-.5 2.7-1.3h3.9c-.7 2.8-3.2 4.5-7.2 4.5Zm-2.3-8.5h4.5c-.2-1.5-1.1-2.4-2.2-2.4-1.3 0-2.1.9-2.3 2.4Z" fill="#F9FAFB"/><path d="M59.8 31c-2.8 0-4.8-1.6-4.8-4.1 0-2.5 1.8-3.8 5.1-4.3l3-.4v-.4c0-1.1-.8-1.7-2-1.7-1.3 0-2.1.5-2.3 1.4h-3.5c.3-2.6 2.6-4.4 6-4.4 3.8 0 5.8 1.8 5.8 5.1V31h-3.8v-1.7c-.8 1.1-2 1.7-3.5 1.7Zm1.4-2.8c1.4 0 2.4-.9 2.4-2.2v-.6l-2.2.3c-1.5.2-2.1.7-2.1 1.4 0 .7.7 1.1 1.9 1.1Z" fill="#F9FAFB"/><path d="M70.5 31V18.3h3.8v2c.7-1.4 2-2.2 3.8-2.2.4 0 .7 0 1 .1v3.6a6.8 6.8 0 0 0-1.4-.1c-2.1 0-3.2 1.1-3.2 3.2V31h-4Z" fill="#F9FAFB"/><path d="M85.2 31c-3.3 0-5.6-1.7-5.8-4.3h3.7c.2.9 1 1.4 2.2 1.4 1.1 0 1.8-.4 1.8-1 0-.5-.4-.8-1.5-1l-2.2-.4c-2.6-.5-3.9-1.8-3.9-3.7 0-2.7 2.3-4.5 5.8-4.5s5.6 1.7 5.8 4.2h-3.6c-.2-.9-.8-1.4-2-1.4-1 0-1.6.4-1.6 1 0 .5.4.8 1.4 1l2.2.4c2.9.5 4.1 1.7 4.1 3.8 0 2.8-2.4 4.5-6.4 4.5Z" fill="#F9FAFB"/><path d="M94.8 31V13h4v18h-4Z" fill="#34D399"/><path d="M105.6 31c-3.8 0-6.2-2.5-6.2-6.5 0-4 2.4-6.5 6.2-6.5 3.7 0 6 2.4 6 6.2V25h-8.4c.2 1.8 1.3 2.8 3 2.8 1.2 0 2.2-.5 2.7-1.3h3.9c-.7 2.8-3.2 4.5-7.2 4.5Zm-2.3-8.5h4.5c-.2-1.5-1.1-2.4-2.2-2.4-1.3 0-2.1.9-2.3 2.4Z" fill="#F9FAFB"/><path d="M118 31c-2.8 0-4.8-1.6-4.8-4.1 0-2.5 1.8-3.8 5.1-4.3l3-.4v-.4c0-1.1-.8-1.7-2-1.7-1.3 0-2.1.5-2.3 1.4h-3.5c.3-2.6 2.6-4.4 6-4.4 3.8 0 5.8 1.8 5.8 5.1V31h-3.8v-1.7c-.8 1.1-2 1.7-3.5 1.7Zm1.4-2.8c1.4 0 2.4-.9 2.4-2.2v-.6l-2.2.3c-1.5.2-2.1.7-2.1 1.4 0 .7.7 1.1 1.9 1.1Z" fill="#F9FAFB"/></svg>`;

export const quotePlaceholder: Quote = {
  id: 'quote-demo-001',
  quoteNumber: 'PREV-2026-014',
  title: 'Preventivo per restyling sito e supporto lancio',
  issueDate: '2026-04-04',
  provider: {
    name: 'EasyPIVA Studio Creativo',
    address: 'Via Torino 18',
    city: '20123 Milano MI',
    vatNumber: 'IT12345678901',
    taxCode: 'RSSMRA90A01F205X',
    email: 'ciao@easypiva.it',
    phone: '+39 02 1234 5678',
    website: 'easypiva.it',
  },
  client: {
    name: 'Atelier Luce Srl',
    address: 'Via Roma 42',
    city: '00186 Roma RM',
    vatNumber: 'IT10987654321',
    email: 'amministrazione@atelierluce.it',
  },
  items: [
    {
      id: 'analysis',
      description: 'Analisi iniziale, raccolta materiali e struttura contenuti',
      quantity: 1,
      unitPrice: 450,
    },
    {
      id: 'design',
      description: 'Design homepage e pagina servizi coerente con il brand',
      quantity: 1,
      unitPrice: 980,
    },
    {
      id: 'support',
      description: 'Supporto al lancio e micro-ottimizzazioni post consegna',
      quantity: 2,
      unitPrice: 180,
    },
  ],
  discount: 0.05,
  vatMode: 'none',
  notes:
    'Il preventivo include una revisione completa per ogni fase principale e consegna dei file finali pronti per la pubblicazione.',
  offerValidity: '30 giorni dalla data di emissione',
  deliveryTiming: '10 giorni lavorativi dalla conferma e ricezione materiali',
  paymentDetails: {
    beneficiary: 'Mario Rossi',
    iban: 'IT60X0542811101000000123456',
    bankName: 'Banca Intesa Sanpaolo',
    instructions: 'Acconto 40% alla conferma, saldo entro 7 giorni dalla consegna.',
  },
  causale: 'Acconto preventivo PREV-2026-014',
  vatExemptionReason: 'Operazione senza applicazione IVA ai sensi del regime forfettario.',
  logoDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(placeholderLogoSvg)}`,
};
