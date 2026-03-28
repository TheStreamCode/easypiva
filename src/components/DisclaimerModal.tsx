import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

export function DisclaimerModal() {
  const { hasAcceptedDisclaimer, acceptDisclaimer } = useStore();

  return (
    <Dialog
      open={!hasAcceptedDisclaimer}
      onOpenChange={(open) => {
        if (!open) acceptDisclaimer();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            ATTENZIONE: Disclaimer Importante
          </DialogTitle>
          <DialogDescription className="text-base pt-4 space-y-4 text-slate-700 dark:text-slate-300">
            <p>
              <strong>EasyPIVA</strong> è un progetto portfolio open-source gratuito creato e
              mantenuto internamente da Michael Gasperini / Mikesoft.
            </p>
            <p>
              I calcoli sono basati sulle norme vigenti (Agenzia delle Entrate 2026) ma{' '}
              <strong>
                NON sostituiscono in alcun modo la consulenza di un commercialista o di un
                consulente del lavoro
              </strong>
              .
            </p>
            <p>
              Le simulazioni fornite hanno scopo puramente indicativo. L'autore non assume alcuna
              responsabilità per eventuali errori, omissioni o per l'uso che verrà fatto dei
              risultati ottenuti.
            </p>
            <p className="font-semibold">
              Consulta sempre un professionista abilitato prima di prendere decisioni fiscali o
              finanziarie.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={acceptDisclaimer}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ho letto e accetto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
