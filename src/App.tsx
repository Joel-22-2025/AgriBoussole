import { BarChart3Icon, FileSpreadsheetIcon, SettingsIcon } from 'lucide-react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { ADMIN_DASHBOARD_ROLES } from '@/components/layout/navigation'
import { PublicShell } from '@/components/layout/public-shell'
import { RequireAuth } from '@/features/auth/require-auth'
import { AdminAdminsPage } from '@/pages/admin-admins-page'
import { AdminDashboardPage } from '@/pages/admin-dashboard-page'
import { AdminPlaceholderPage } from '@/pages/admin-placeholder-page'
import { SaeiRequestsPage } from '@/pages/admin-saei-requests-page'
import { AdminUsersPage } from '@/pages/admin-users-page'
import { AssistantPage } from '@/pages/assistant-page'
import { CandidaturesPage } from '@/pages/candidatures-page'
import { EntrepreneurChatPage, SaeiChatPage } from '@/pages/chat-page'
import { EntrepreneurIndicatorsPage } from '@/pages/entrepreneur-indicators-page'
import { HomePage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login-page'
import {
  EntrepreneurNotificationsPage,
  SaeiNotificationsPage,
} from '@/pages/notifications-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { OffersPage } from '@/pages/offers-page'
import { PhasePage } from '@/pages/phase-page'
import { ProfilePage } from '@/pages/profile-page'
import { RegisterEntrepreneurPage } from '@/pages/register-entrepreneur-page'
import { RegisterSaeiPage } from '@/pages/register-saei-page'
import { RouteErrorPage } from '@/pages/route-error-page'
import { SaeiDashboardPage } from '@/pages/saei-dashboard-page'
import { SaeiEntrepreneursPage } from '@/pages/saei-entrepreneurs-page'
import { SaeiIndicatorsPage } from '@/pages/saei-indicators-page'
import { SaeiOffersPage } from '@/pages/saei-offers-page'
import { SaeiProfilePage } from '@/pages/saei-profile-page'
import { SaeiTeamPage } from '@/pages/saei-team-page'
import { StructuresPage } from '@/pages/structures-page'
import { StructureDetailPage } from '@/pages/structure-detail-page'

const router = createBrowserRouter([
  {
    element: <PublicShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'structures', element: <StructuresPage /> },
      { path: 'structures/:id', element: <StructureDetailPage /> },
      { path: 'connexion', element: <LoginPage /> },
      { path: 'inscription/entrepreneur', element: <RegisterEntrepreneurPage /> },
      { path: 'inscription/saei', element: <RegisterSaeiPage /> },
      {
        path: 'phase',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <PhasePage />
          </RequireAuth>
        ),
      },
      {
        path: 'offres',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <OffersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'indicateurs',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <EntrepreneurIndicatorsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'candidatures',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <CandidaturesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'notifications',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <EntrepreneurNotificationsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'messages',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <EntrepreneurChatPage />
          </RequireAuth>
        ),
      },
      {
        path: 'assistant',
        element: (
          <RequireAuth roles={['ENTREPRENEUR']}>
            <AssistantPage />
          </RequireAuth>
        ),
      },
      {
        path: 'profil',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: 'tableau-de-bord',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiDashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/entrepreneurs',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiEntrepreneursPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/offres',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiOffersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/indicateurs',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiIndicatorsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/equipe',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiTeamPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/notifications',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiNotificationsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/messages',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiChatPage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/profil',
        element: (
          <RequireAuth roles={['SAEI']}>
            <SaeiProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'saei/assistant',
        element: (
          <RequireAuth roles={['SAEI']}>
            <AssistantPage audience="saei" />
          </RequireAuth>
        ),
      },
      {
        path: 'admin',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <AdminDashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/statistiques',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <AdminPlaceholderPage
              title="Statistiques"
              description="Analyse détaillée de l’activité et de la répartition des structures."
              icon={BarChart3Icon}
              note="Les graphiques de synthèse sont disponibles sur le tableau de bord. Une page d’analyse détaillée sera ajoutée avec l’endpoint GET /api/admin/dashboard/."
            />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/demandes-saei',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <SaeiRequestsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/utilisateurs',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <AdminUsersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/import-export',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <AdminPlaceholderPage
              title="Import / export Excel"
              description="Gestion des fichiers de structures et des données de référence."
              icon={FileSpreadsheetIcon}
              note="Les endpoints d’import/export ne sont pas encore exposés par le backend."
            />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/administrateurs',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <AdminAdminsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/parametres',
        element: (
          <RequireAuth roles={ADMIN_DASHBOARD_ROLES}>
            <AdminPlaceholderPage
              title="Paramètres et journal d’activité"
              description="Configuration et traçabilité des actions d’administration."
              icon={SettingsIcon}
              note="Le journal d’activité nécessite l’endpoint GET /api/admin/audit-log/, non encore disponible."
            />
          </RequireAuth>
        ),
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
