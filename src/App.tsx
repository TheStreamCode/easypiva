import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import { DisclaimerModal } from './components/DisclaimerModal';

const Home = lazy(() => import('./pages/Home'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Comparison = lazy(() => import('./pages/Comparison'));
const Contributions = lazy(() => import('./pages/Contributions'));
const TargetNet = lazy(() => import('./pages/TargetNet'));
const Planning = lazy(() => import('./pages/Planning'));
const Sources = lazy(() => import('./pages/Sources'));
const QuoteBuilder = lazy(() => import('./pages/QuoteBuilder'));

function RouteFallback() {
  return <div className="p-6 text-sm text-zinc-500">Caricamento...</div>;
}

export default function App() {
  return (
    <Router>
      <DisclaimerModal />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="calcolatore"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Calculator />
              </Suspense>
            }
          />
          <Route
            path="confronto"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Comparison />
              </Suspense>
            }
          />
          <Route
            path="contributi"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Contributions />
              </Suspense>
            }
          />
          <Route
            path="quanto-fatturare"
            element={
              <Suspense fallback={<RouteFallback />}>
                <TargetNet />
              </Suspense>
            }
          />
          <Route
            path="pianificazione"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Planning />
              </Suspense>
            }
          />
          <Route
            path="preventivo"
            element={
              <Suspense
                fallback={
                  <div className="p-6 text-sm text-zinc-500">Caricamento preventivo...</div>
                }
              >
                <QuoteBuilder />
              </Suspense>
            }
          />
          <Route
            path="informativa"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Sources />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
