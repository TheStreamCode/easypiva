import { formatCurrency } from '@/lib/format';

export type QuoteItemsTableRow = {
  id: string;
  description: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  lineTotal?: number;
  continuation?: boolean;
};

type QuoteItemsTableProps = {
  rows: QuoteItemsTableRow[];
  showHeader?: boolean;
  repeatedHeader?: boolean;
};

function formatQuantity(value?: number) {
  if (value === undefined) {
    return '';
  }

  return Number.isInteger(value) ? String(value) : value.toLocaleString('it-IT');
}

export function QuoteItemsTable({
  rows,
  showHeader = true,
  repeatedHeader = false,
}: QuoteItemsTableProps) {
  return (
    <div className="space-y-2">
      {repeatedHeader ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
          Dettaglio voci - continua
        </p>
      ) : null}

      <table className="w-full border-collapse text-left text-[11px] text-zinc-700">
        {showHeader ? (
          <thead>
            <tr className="border-y border-zinc-200 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              <th className="py-3 pr-3 font-medium">Descrizione</th>
              <th className="w-[10%] px-2 py-3 text-right font-medium">Qta</th>
              <th className="w-[12%] px-2 py-3 text-right font-medium">Unita</th>
              <th className="w-[18%] px-2 py-3 text-right font-medium">Prezzo</th>
              <th className="w-[18%] pl-2 py-3 text-right font-medium">Totale</th>
            </tr>
          </thead>
        ) : null}

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="align-top border-b border-zinc-100 last:border-b-zinc-200">
              <td className="py-3 pr-3 text-zinc-900">
                <div className="leading-relaxed whitespace-pre-wrap">
                  {row.description}
                  {row.continuation ? (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      continua
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-2 py-3 text-right tabular-nums">{formatQuantity(row.quantity)}</td>
              <td className="px-2 py-3 text-right uppercase text-zinc-500">{row.unit ?? ''}</td>
              <td className="px-2 py-3 text-right tabular-nums">
                {row.unitPrice === undefined ? '' : formatCurrency(row.unitPrice, 2)}
              </td>
              <td className="pl-2 py-3 text-right font-medium tabular-nums text-zinc-900">
                {row.lineTotal === undefined ? '' : formatCurrency(row.lineTotal, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuoteItemsTable;
