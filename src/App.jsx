import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import ReportProblem from './pages/ReportProblem';
import AiAnalysis from './pages/AiAnalysis';
import Project from './pages/Project';
import GovernmentDashboard from './pages/GovernmentDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-bleed layout for Landing (hero needs edge-to-edge) */}
        <Route element={<Layout variant="fullBleed" />}>
          <Route index element={<Landing />} />
        </Route>

        {/* Standard constrained layout for all other routes */}
        <Route element={<Layout />}>
          <Route path="report" element={<ReportProblem />} />
          <Route path="analysis" element={<AiAnalysis />} />
          <Route path="project" element={<Project />} />
          <Route path="government" element={<GovernmentDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

