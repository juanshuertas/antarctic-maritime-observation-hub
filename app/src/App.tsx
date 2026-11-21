// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Juan Sebastián Huertas Olea. All rights reserved.
// Antarctic Maritime Observation Hub (AMOH)

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './pages/MapPage';

// =========================================================================
// ROUTE LAZY LOADING: MINIMAL INITIAL CHUNK, INSTANT LOAD (APPLE STANDARD)
// =========================================================================
const Explore = lazy(() => import('./pages/Explore'));
const Observations = lazy(() => import('./pages/Observations'));
const ReviewMatch = lazy(() => import('./pages/ReviewMatch'));
const Governance = lazy(() => import('./pages/Governance'));
const MobileContribute = lazy(() => import('./pages/MobileContribute'));
const DesignSystem = lazy(() => import('./pages/DesignSystem'));
const Credits = lazy(() => import('./pages/Credits'));
const SourcesPage = lazy(() => import('./pages/SourcesPage'));
const ScienceLabPage = lazy(() => import('./pages/ScienceLabPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const ContextPage = lazy(() => import('./pages/ContextPage'));
const BriefingPage = lazy(() => import('./pages/BriefingPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));
const DeviceTestPage = lazy(() => import('./pages/DeviceTestPage'));
const CameraWall = lazy(() => import('./pages/CameraWall'));
const FieldAtlas = lazy(() => import('./pages/FieldAtlas'));
const ScenarioLab = lazy(() => import('./pages/ScenarioLab'));
const IntelligencePortal = lazy(() => import('./pages/IntelligencePortal'));
const Overview = lazy(() => import('./pages/Overview'));
const FieldLoggerPage = lazy(() => import('./pages/FieldLoggerPage'));
const OnboardAppPage = lazy(() => import('./pages/OnboardAppPage'));
const ScienceHubWallPage = lazy(() => import('./pages/ScienceHubWallPage'));

// =========================================================================
// ROUTE LAZY LOADING: PASSPORT MODULE
// =========================================================================
const PassportLayout = lazy(() => import('./passport/PassportLayout'));
const PassportHome = lazy(() => import('./passport/PassportHome'));
const PassportIdentity = lazy(() => import('./passport/PassportIdentity'));
const PassportJourney = lazy(() => import('./passport/PassportJourney'));
const PassportMap = lazy(() => import('./passport/PassportMap'));
const PassportObservations = lazy(() => import('./passport/PassportObservations'));
const PassportStamps = lazy(() => import('./passport/PassportStamps'));
const PassportExpeditions = lazy(() => import('./passport/PassportExpeditions'));
const PassportDatasets = lazy(() => import('./passport/PassportDatasets'));
const PassportPublications = lazy(() => import('./passport/PassportPublications'));
const PassportCredentials = lazy(() => import('./passport/PassportCredentials'));
const PassportAchievements = lazy(() => import('./passport/PassportAchievements'));
const PassportRewards = lazy(() => import('./passport/PassportRewards'));
const PassportSmartCard = lazy(() => import('./passport/PassportSmartCard'));
const PassportVerify = lazy(() => import('./passport/PassportVerify'));
const PassportGallery = lazy(() => import('./passport/PassportGallery'));
const PassportApply = lazy(() => import('./passport/PassportApply'));
const PassportPrivacy = lazy(() => import('./passport/PassportPrivacy'));
const PassportShowcase = lazy(() => import('./passport/PassportShowcase'));

function PageLoader({ label = 'Cargando módulo...' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#07131e] flex flex-col items-center justify-center text-[#8faab5] font-mono text-xs space-y-3">
      <div className="w-7 h-7 rounded-full border-2 border-[#35c3c8] border-t-transparent animate-spin" />
      <span className="tracking-widest uppercase text-[10px] text-[#35c3c8]">{label}</span>
    </div>
  );
}

// =========================================================================
// ROUTE LAZY LOADING: EXPEDITIONS MODULE
// =========================================================================
const ExpeditionsLayout = lazy(() => import('./expeditions/ExpeditionsLayout'));
const ExpeditionsIndex = lazy(() => import('./expeditions/ExpeditionsIndex'));
const ExpeditionOverview = lazy(() => import('./expeditions/ExpeditionOverview'));
const ExpeditionMap = lazy(() => import('./expeditions/ExpeditionMap'));
const ExpeditionSessions = lazy(() => import('./expeditions/ExpeditionSessions'));
const ExpeditionObservations = lazy(() => import('./expeditions/ExpeditionObservations'));
const ExpeditionDevices = lazy(() => import('./expeditions/ExpeditionDevices'));
const ExpeditionScienceHub = lazy(() => import('./expeditions/ExpeditionScienceHub'));
const ExpeditionReview = lazy(() => import('./expeditions/ExpeditionReview'));
const ExpeditionMatchups = lazy(() => import('./expeditions/ExpeditionMatchups'));
const ExpeditionOutputs = lazy(() => import('./expeditions/ExpeditionOutputs'));
const ExpeditionReports = lazy(() => import('./expeditions/ExpeditionReports'));
const ExpeditionData = lazy(() => import('./expeditions/ExpeditionData'));
const ExpeditionSync = lazy(() => import('./expeditions/ExpeditionSync'));
const ExpeditionTeam = lazy(() => import('./expeditions/ExpeditionTeam'));
const ExpeditionSettings = lazy(() => import('./expeditions/ExpeditionSettings'));
const ExpeditionContribute = lazy(() => import('./expeditions/ExpeditionContribute'));

// PAC-Specific Lazy Loaded Workspaces
const ExpeditionReadiness = lazy(() => import('./expeditions/ExpeditionReadiness'));
const ExpeditionDocuments = lazy(() => import('./expeditions/ExpeditionDocuments'));
const ExpeditionTraining = lazy(() => import('./expeditions/ExpeditionTraining'));
const ExpeditionHealth = lazy(() => import('./expeditions/ExpeditionHealth'));
const ExpeditionLogistics = lazy(() => import('./expeditions/ExpeditionLogistics'));
const ExpeditionEquipment = lazy(() => import('./expeditions/ExpeditionEquipment'));
const ExpeditionScience = lazy(() => import('./expeditions/ExpeditionScience'));
const ExpeditionSafety = lazy(() => import('./expeditions/ExpeditionSafety'));
const ExpeditionComms = lazy(() => import('./expeditions/ExpeditionComms'));
const ExpeditionIncidents = lazy(() => import('./expeditions/ExpeditionIncidents'));
const ExpeditionEnvironment = lazy(() => import('./expeditions/ExpeditionEnvironment'));
const ExpeditionReturn = lazy(() => import('./expeditions/ExpeditionReturn'));
const ExpeditionLessons = lazy(() => import('./expeditions/ExpeditionLessons'));

export default function App() {
  const pb124PublicMode = import.meta.env.VITE_PB124_PUBLIC_MODE === '1';
  const routerBase = import.meta.env.BASE_URL === '/'
    ? '/'
    : import.meta.env.BASE_URL.replace(/\/$/, '');

  if (pb124PublicMode) {
    return (
      <BrowserRouter basename={routerBase}>
        <Suspense fallback={<PageLoader label="Cargando PB124 Field Connect..." />}>
          <Routes>
            <Route path="/" element={<Navigate to="/peaceboat/" replace />} />
            <Route path="/peaceboat/*" element={<MobileContribute />} />
            <Route path="/contribute" element={<Navigate to="/peaceboat/" replace />} />
            <Route path="*" element={<Navigate to="/peaceboat/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename={routerBase}>
      <Suspense fallback={<PageLoader label="Cargando AMOH..." />}>
        <Routes>
          {/* Map-first: the full AMOH app opens into the observatory. */}
          <Route path="/" element={<Navigate to="/observatory" replace />} />
          <Route path="/observatory" element={<MapPage />} />
          <Route path="/briefing" element={<BriefingPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/*" element={<Explore />} />
          <Route path="/map" element={<Navigate to="/observatory" replace />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/data-sources" element={<Navigate to="/sources" replace />} />
          <Route path="/science" element={<ScienceLabPage />} />
          <Route path="/science/*" element={<ScienceLabPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/*" element={<ReportsPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/context" element={<ContextPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/cameras" element={<CameraWall />} />
          <Route path="/atlas" element={<FieldAtlas />} />
          <Route path="/field/atlas" element={<FieldAtlas />} />
          <Route path="/scenarios" element={<ScenarioLab />} />
          <Route path="/lab" element={<Navigate to="/scenarios" replace />} />
          <Route path="/intelligence" element={<IntelligencePortal />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/review" element={<ReviewMatch />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/overview" element={<Overview />} />
          {/* Standalone — no AppShell chrome, this is what the QR code opens on a phone. */}
          <Route path="/contribute" element={<MobileContribute />} />
          <Route path="/field/device-test" element={<DeviceTestPage />} />
          <Route path="/device-test" element={<Navigate to="/field/device-test" replace />} />
          <Route path="/field-logger" element={<FieldLoggerPage />} />
          <Route path="/bitacora" element={<Navigate to="/field-logger" replace />} />
          <Route path="/onboard" element={<OnboardAppPage />} />
          <Route path="/bordo" element={<Navigate to="/onboard" replace />} />
          <Route path="/app" element={<Navigate to="/onboard" replace />} />
          <Route path="/science-hub" element={<ScienceHubWallPage />} />
          <Route path="/science-hub-wall" element={<Navigate to="/science-hub" replace />} />
          <Route path="/kiosk" element={<Navigate to="/science-hub" replace />} />

          {/* Antarctica World Passport — Scientific Connected Edition (Lazy Loaded) */}
          <Route
            path="/passport"
            element={
              <Suspense fallback={<PageLoader label="Cargando Pasaporte Polar..." />}>
                <PassportLayout />
              </Suspense>
            }
          >
            <Route index element={<PassportHome />} />
            <Route path="showcase" element={<PassportShowcase />} />
            <Route path="apply" element={<PassportApply />} />
            <Route path="id" element={<PassportIdentity />} />
            <Route path="journey" element={<PassportJourney />} />
            <Route path="map" element={<PassportMap />} />
            <Route path="observations" element={<PassportObservations />} />
            <Route path="stamps" element={<PassportStamps />} />
            <Route path="expeditions" element={<PassportExpeditions />} />
            <Route path="datasets" element={<PassportDatasets />} />
            <Route path="publications" element={<PassportPublications />} />
            <Route path="credentials" element={<PassportCredentials />} />
            <Route path="achievements" element={<PassportAchievements />} />
            <Route path="rewards" element={<PassportRewards />} />
            <Route path="smart-card" element={<PassportSmartCard />} />
            <Route path="verify" element={<PassportVerify />} />
            <Route path="gallery" element={<PassportGallery />} />
            <Route path="privacy" element={<PassportPrivacy />} />
            <Route path="security" element={<PassportPrivacy />} />
          </Route>

          {/* AMOH Expeditions — Master Engine (Lazy Loaded) */}
          <Route
            path="/expeditions"
            element={
              <Suspense fallback={<PageLoader label="Cargando Expediciones AMOH..." />}>
                <ExpeditionsIndex />
              </Suspense>
            }
          />
          <Route
            path="/expeditions/pac"
            element={<Navigate to="/expeditions/exp-pac-13/overview" replace />}
          />
          <Route
            path="/expeditions/contribute"
            element={
              <Suspense fallback={<PageLoader label="Cargando Expediciones AMOH..." />}>
                <ExpeditionContribute />
              </Suspense>
            }
          />
          <Route
            path="/expeditions/:expeditionId"
            element={
              <Suspense fallback={<PageLoader label="Cargando Expediciones AMOH..." />}>
                <ExpeditionsLayout />
              </Suspense>
            }
          >
            <Route index element={<ExpeditionOverview />} />
            <Route path="overview" element={<ExpeditionOverview />} />
            <Route path="map" element={<ExpeditionMap />} />
            <Route path="sessions" element={<ExpeditionSessions />} />
            <Route path="observations" element={<ExpeditionObservations />} />
            <Route path="devices" element={<ExpeditionDevices />} />
            <Route path="science-hub" element={<ExpeditionScienceHub />} />
            <Route path="review" element={<ExpeditionReview />} />
            <Route path="matchups" element={<ExpeditionMatchups />} />
            <Route path="outputs" element={<ExpeditionOutputs />} />
            <Route path="reports" element={<ExpeditionReports />} />
            <Route path="data" element={<ExpeditionData />} />
            <Route path="sync" element={<ExpeditionSync />} />
            <Route path="team" element={<ExpeditionTeam />} />
            <Route path="settings" element={<ExpeditionSettings />} />

            {/* PAC Specific Sub-routes */}
            <Route path="readiness" element={<ExpeditionReadiness />} />
            <Route path="checklist" element={<ExpeditionReadiness />} />
            <Route path="documents" element={<ExpeditionDocuments />} />
            <Route path="training" element={<ExpeditionTraining />} />
            <Route path="health" element={<ExpeditionHealth />} />
            <Route path="logistics" element={<ExpeditionLogistics />} />
            <Route path="equipment" element={<ExpeditionEquipment />} />
            <Route path="science" element={<ExpeditionScience />} />
            <Route path="safety" element={<ExpeditionSafety />} />
            <Route path="comms" element={<ExpeditionComms />} />
            <Route path="incidents" element={<ExpeditionIncidents />} />
            <Route path="environment" element={<ExpeditionEnvironment />} />
            <Route path="return" element={<ExpeditionReturn />} />
            <Route path="lessons" element={<ExpeditionLessons />} />
          </Route>

          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<Navigate to="/observatory" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
