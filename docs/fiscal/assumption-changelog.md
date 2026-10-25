# Storico delle assunzioni fiscali

Generato da `src/lib/fiscal/assumption-changes.ts`. Non modificare a mano.

## 2026.1 - 2026-10-25

Release app: 1.2.0

Introduzione del profilo versionato: assunzioni 2026 consolidate e allineate a TUIR 2026 e TU-IVA 2026.

- `limits.redditoDipendente`: 35.000 € -> 30.000 € (fonte: tuir-2026)
- `sources.forfettario`: L. 190/2014, commi 54-89 -> D.Lgs. 117/2026, artt. 232-243 e Allegato D (fonte: tuir-2026)
- `constants.ateco`: etichette per macro-categorie 45-47 -> Allegato D (45, 46.2-46.9, 47.1-47.7, 47.9 e 46.1 separati) (fonte: tuir-2026)
- `constants.detrazioneLavoroAutonomo`: valori fissi nel codice -> art. 13, commi 5 e 7, TUIR 2026 (fonte: tuir-2026)
- `rounding`: valori impliciti nel codice -> valuta 0 decimali; scala preventivo 6 decimali
