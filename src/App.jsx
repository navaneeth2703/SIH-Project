import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import ReportProblem from './pages/ReportProblem';
import Challenges from './pages/Challenges';
import HowItWorks from './pages/HowItWorks';
import Impact from './pages/Impact';
import AiAnalysis from './pages/AiAnalysis';
import Project from './pages/Project';
import GovernmentDashboard from './pages/GovernmentDashboard';
import Login from './pages/Login';
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
          <Route path="challenges" element={<Challenges />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="impact" element={<Impact />} />
          <Route path="ai-analysis" element={<AiAnalysis />} />
          <Route path="analysis" element={<AiAnalysis />} />
          <Route path="project-lifecycle" element={<Project />} />
          <Route path="project" element={<Project />} />
          <Route path="government" element={<GovernmentDashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="report" element={<ReportProblem />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
