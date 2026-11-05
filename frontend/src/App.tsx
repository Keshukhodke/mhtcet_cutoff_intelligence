import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { PreferenceProvider } from './context/PreferenceContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './features/landing/LandingPage';
import { StudentDashboard } from './features/dashboard/StudentDashboard';
import { CollegeExplorer } from './features/college-explorer/CollegeExplorer';
import { CutoffForecasts } from './features/cutoff-forecasts/CutoffForecasts';
import { ReachabilityAnalysis } from './features/reachability/ReachabilityAnalysis';
import { PreferenceBuilder } from './features/preference-builder/PreferenceBuilder';
import { PreferenceHealth } from './features/preference-health/PreferenceHealth';
import { HistoricalTrends } from './features/historical-trends/HistoricalTrends';
import { CollegePredictor } from './features/predictor/CollegePredictor';
import { CapAllotments } from './features/allotments/CapAllotments';
import { TopColleges } from './features/top-colleges/TopColleges';
import { SettingsPage } from './features/settings/SettingsPage';

function App() {
  return (
    <StudentProvider>
      <PreferenceProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Authenticated / Application Viewport */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/predictor" element={<CollegePredictor />} />
              <Route path="/preference-builder" element={<PreferenceBuilder />} />
              <Route path="/preference-list" element={<Navigate to="/preference-builder" replace />} />
              <Route path="/allotments" element={<CapAllotments />} />
              <Route path="/top-colleges" element={<TopColleges />} />
              <Route path="/profile" element={<Navigate to="/predictor" replace />} />
              <Route path="/explorer" element={<CollegeExplorer />} />
              <Route path="/forecasts" element={<CutoffForecasts />} />
              <Route path="/reachability" element={<ReachabilityAnalysis />} />
              <Route path="/preference-health" element={<PreferenceHealth />} />
              <Route path="/trends" element={<HistoricalTrends />} />
              <Route path="/historical-cutoff" element={<Navigate to="/trends" replace />} />
              <Route path="/cutoff-analyzer" element={<Navigate to="/trends" replace />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </PreferenceProvider>
    </StudentProvider>
  );
}

export default App;
