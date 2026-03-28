# EasyPIVA 2026

[![CI](https://github.com/TheStreamCode/easypiva/actions/workflows/ci.yml/badge.svg)](https://github.com/TheStreamCode/easypiva/actions/workflows/ci.yml)

**La tua Partita IVA, facile e trasparente.**

EasyPIVA è un progetto portfolio open source per simulare regime forfettario, contributi INPS, confronto tra regimi fiscali italiani e pianificazione delle entrate.
È ideato e sviluppato interamente da **Michael Gasperini** per **Mikesoft**.

## Stato del progetto

- Progetto personale e amatoriale.
- Mantenuto internamente da Michael Gasperini / Mikesoft.
- **Non sono accettati contributi esterni, pull request o issue della community.**

## Funzionalità

- Calcolo forfettario 2026 con imposta sostitutiva al 5% o 15%.
- Confronto tra regime forfettario e ordinario.
- Simulazione contributi INPS per Gestione Separata, Artigiani e Commercianti.
- Calcolo inverso per trovare il fatturato necessario a un netto desiderato.
- Pianificazione mensile per monitorare i limiti di ricavi.
- Export PDF dei risultati.
- Salvataggio scenari nel browser con `localStorage`.
- Modalità dark/light con circular reveal ottimizzata per mobile.

## Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, shadcn/ui
- **State Management:** Zustand
- **Data & Form:** React Hook Form + Zod, Recharts
- **Utility:** jsPDF, React Router
- **Code Quality:** ESLint, Prettier, Vitest

## Verifica locale

Prima di aprire un commit, esegui sempre la suite CI locale:

```bash
npm run ci
```

Se vuoi controllare i singoli passaggi:

- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Avvio locale

1. Clona il repository:

   ```bash
   git clone https://github.com/TheStreamCode/easypiva.git
   cd easypiva
   ```

2. Installa le dipendenze:

   ```bash
   npm install
   ```

3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

## Note GitHub

- Repository pubblico pensato come portfolio.
- Nessun contributo esterno viene accettato.
- Issue/discussion possono restare disabilitati lato GitHub.

## Pubblicazione

- Il progetto è pensato per GitHub come vetrina portfolio.
- Il deploy client-side è già supportato da `vercel.json`.
- La manutenzione resta interna e non prevede collaboratori esterni.

## Disclaimer

I calcoli sono basati sulle norme vigenti (Agenzia delle Entrate 2026) ma **non sostituiscono in alcun modo** la consulenza di un commercialista o di un consulente del lavoro.
Le simulazioni hanno scopo puramente indicativo. L'autore non assume alcuna responsabilità per eventuali errori o l'uso dei risultati.

## Licenza

Rilasciato sotto licenza [MIT](LICENSE).
