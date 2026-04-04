import type { ReactNode } from 'react';

type QuotePageProps = {
  children: ReactNode;
  pageNumber: number;
  totalPages: number;
};

export function QuotePage({ children, pageNumber, totalPages }: QuotePageProps) {
  return (
    <article className="quote-a4-page relative overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white text-zinc-900 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="absolute right-[16mm] top-[10mm] text-[10px] font-medium tracking-[0.24em] text-zinc-400 uppercase">
        Pagina {pageNumber} / {totalPages}
      </div>

      <div className="quote-a4-content absolute inset-x-[16mm] top-[16mm] bottom-[24mm] overflow-hidden">
        {children}
      </div>

      <footer className="quote-a4-footer pointer-events-none absolute inset-x-[16mm] bottom-[10mm] flex items-center justify-between border-t border-zinc-200 pt-3 text-[10px] text-zinc-500">
        <span>Documento generato con EasyPIVA by Mikesoft.it</span>
        <span className="tracking-[0.24em] uppercase text-zinc-400">EasyPIVA</span>
      </footer>
    </article>
  );
}

export default QuotePage;
