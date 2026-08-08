import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContributionHistory } from '@/lib/fiscal-data';

export function ContributionHistorySelect({
  id = 'contributionHistory',
  value,
  onValueChange,
}: {
  id?: string;
  value: ContributionHistory;
  onValueChange: (value: ContributionHistory) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-zinc-700 dark:text-zinc-300">
          Anzianità contributiva
        </Label>
        <p className="text-xs text-zinc-500">
          Determina il massimale annuo per Artigiani e Commercianti.
        </p>
      </div>
      <Select value={value} onValueChange={(next) => onValueChange(next as ContributionHistory)}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="post1995">Prima iscrizione dal 1° gennaio 1996</SelectItem>
          <SelectItem value="pre1996">Anzianità contributiva al 31 dicembre 1995</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
