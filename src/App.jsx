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
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
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
