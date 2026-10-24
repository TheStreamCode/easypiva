import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (reset: () => void) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

function DefaultErrorFallback({ onReset }: { onReset: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-6 dark:border-red-900/60 dark:bg-red-950/20"
    >
      <h1 className="text-xl font-semibold text-red-900 dark:text-red-100">
        Qualcosa è andato storto
      </h1>
      <p className="text-sm leading-relaxed text-red-900/80 dark:text-red-200/80">
        Si è verificato un errore imprevisto nell&apos;interfaccia. I dati inseriti restano nel
        browser: puoi riprovare oppure ricaricare la pagina.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onReset}>
          Riprova
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.reload()}>
          Ricarica la pagina
        </Button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return this.props.fallback ? (
      this.props.fallback(this.reset)
    ) : (
      <DefaultErrorFallback onReset={this.reset} />
    );
  }
}
