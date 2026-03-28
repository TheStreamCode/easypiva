import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Comparison from './pages/Comparison';
import Contributions from './pages/Contributions';
import TargetNet from './pages/TargetNet';
import Planning from './pages/Planning';
import Sources from './pages/Sources';
import { DisclaimerModal } from './components/DisclaimerModal';

export default function App() {
  return (
    <Router>
      <DisclaimerModal />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="calcolatore" element={<Calculator />} />
          <Route path="confronto" element={<Comparison />} />
          <Route path="contributi" element={<Contributions />} />
          <Route path="quanto-fatturare" element={<TargetNet />} />
          <Route path="pianificazione" element={<Planning />} />
          <Route path="informativa" element={<Sources />} />
        </Route>
      </Routes>
    </Router>
  );
}
