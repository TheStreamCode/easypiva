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
import { Info } from 'lucide-react';
import { fiscalDisclaimer, projectAttribution } from '@/lib/public-copy';

export function DisclaimerModal() {
  const { hasAcceptedDisclaimer, acceptDisclaimer } = useStore();

  return (
    <Dialog
      open={!hasAcceptedDisclaimer}
      onOpenChange={(open) => {
        if (!open) acceptDisclaimer();
      }}
    >
      <DialogContent className="sm:max-w-[480px] p-6 sm:p-8 gap-6 border-border/40 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto bg-primary/5 p-3 rounded-2xl w-fit mb-2 ring-1 ring-primary/10">
            <Info className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-xl font-medium text-center text-foreground tracking-tight">
            Benvenuto in EasyPIVA
          </DialogTitle>
          <DialogDescription className="text-[15px] space-y-4 text-center text-muted-foreground leading-relaxed">
            <p>{projectAttribution}</p>
            <p>{fiscalDisclaimer}</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button
            onClick={acceptDisclaimer}
            className="w-full sm:w-2/3 rounded-full h-11 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Ho compreso, inizia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
