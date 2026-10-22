import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { TOPICS } from '../constants/topics.js';

const LearningPage = lazy(() => import('../pages/LearningPage.jsx'));
const AuthMasterclassPage = lazy(() => import('../pages/AuthMasterclassPage.jsx'));
const ChecklistPage = lazy(() => import('../pages/ChecklistPage.jsx'));
const InterviewQAPage = lazy(() => import('../pages/InterviewQAPage.jsx'));
const TopicPage = lazy(() => import('../pages/topics/TopicPage.jsx'));
const GamePage = lazy(() => import('../pages/GamePage.jsx'));

function RouteFallback() {
  return <div className="route-loading">Loading experience…</div>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Hub / home */}
        <Route path="/" element={<LearningPage />} />

        {/* One route per subject, generated from constants/topics.js */}
        {TOPICS.map((topic) => (
          <Route key={topic.key} path={topic.route} element={<TopicPage key={topic.key} topic={topic} />} />
        ))}

        {/* Other pages */}
        <Route path="/interview-qa" element={<InterviewQAPage />} />
        <Route path="/qa" element={<InterviewQAPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/auth-masterclass" element={<AuthMasterclassPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/:levelId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
