import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { RequireAuth } from './layout/RequireAuth'
import { MainContent } from './layout/MainContent'
import { DateTimeShowcasePage } from './pages/DateTimeShowcasePage'
import { ExampleTablePage } from './pages/ExampleTablePage'
import { ClosedInteractionPage } from './pages/ClosedInteractionPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { PrivilegeSetDetailPage } from './pages/PrivilegeSetDetailPage'
import { RoleDetailPage } from './pages/RoleDetailPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { ExampleSettingsPage } from './pages/ExampleSettingsPage'
import { HomePage } from './pages/HomePage'
import { ContactCentrePage } from './pages/ContactCentrePage'
import {
  PatternCampaignMultiActionDemoPage,
} from './pages/rbacUiImpact/PatternCampaignMultiActionDemoPage'
import { PatternDrawerRoleDemoPage } from './pages/rbacUiImpact/PatternDrawerRoleDemoPage'
import { PatternStepperRoleDemoPage } from './pages/rbacUiImpact/PatternStepperRoleDemoPage'
import {
  PatternWorkspaceSettingsDemoPage,
} from './pages/rbacUiImpact/PatternWorkspaceSettingsDemoPage'
import { RbacUiImpactHubPage } from './pages/rbacUiImpact/RbacUiImpactHubPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { AdminLayout } from './layout/AdminLayout'
import { AdminUserManagementPage } from './pages/admin/AdminUserManagementPage'
import { LicenseManagementPage } from './pages/admin/LicenseManagementPage'
import { CreateUserPage } from './pages/admin/CreateUserPage'
import { SignupScreen } from './pages/SignupScreen'
import { RoleStep } from './pages/onboarding/RoleStep'
import { NeedStep } from './pages/onboarding/NeedStep'
import { PersonalizeStep } from './pages/onboarding/PersonalizeStep'
import { DevApiStep } from './pages/onboarding/DevApiStep'
import { DevEnvStep } from './pages/onboarding/DevEnvStep'
import { AdminHomePage } from './pages/AdminHomePage'
import { DeveloperHomePage } from './pages/DeveloperHomePage'
import { AgentHomePage } from './pages/AgentHomePage'
import { SupervisorHomePage } from './pages/SupervisorHomePage'
import { HomeLayout } from './layout/HomeLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/onboarding/role" element={<RoleStep />} />
      <Route path="/onboarding/need" element={<NeedStep />} />
      <Route path="/onboarding/personalize" element={<PersonalizeStep />} />
      <Route path="/onboarding/dev/api" element={<DevApiStep />} />
      <Route path="/onboarding/dev/env" element={<DevEnvStep />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        {/* Different keys force full remount on path change so useState initializer re-runs */}
        <Route path="/admin/users" element={<UserManagementPage hideSecondaryNav key="admin-users" />} />
        <Route path="/admin/user-management" element={<UserManagementPage hideSecondaryNav key="admin-roles" />} />
        <Route path="/admin/overview" element={<AdminUserManagementPage />} />
        <Route path="/admin/license-management" element={<LicenseManagementPage />} />
        <Route path="/admin/users/create" element={<CreateUserPage />} />
        {/* Detail pages — open inline within AdminLayout; back navigates to previous table */}
        <Route path="/admin/users/:userId" element={<UserDetailPage />} />
        <Route path="/admin/roles/:roleId" element={<RoleDetailPage />} />
        <Route path="/admin/privilege-sets/:privilegeSetId" element={<PrivilegeSetDetailPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        {/* Role-specific home pages — TopBar only, no sidebar */}
        <Route path="/home"       element={<HomeLayout />}>
          <Route index element={<AdminHomePage />} />
        </Route>
        <Route path="/agent"      element={<HomeLayout />}>
          <Route index element={<AgentHomePage />} />
        </Route>
        <Route path="/developer"  element={<HomeLayout />}>
          <Route index element={<DeveloperHomePage />} />
        </Route>
        <Route path="/supervisor" element={<HomeLayout />}>
          <Route index element={<SupervisorHomePage />} />
        </Route>

        <Route path="/contact-centre" element={<ContactCentrePage />} />
        <Route path="/rbac-ui-impact/pattern/stepper" element={<PatternStepperRoleDemoPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/example-table" element={<ExampleTablePage />} />
          <Route path="/closed-interaction" element={<ClosedInteractionPage />} />
          <Route path="/rbac-ui-impact" element={<RbacUiImpactHubPage />} />
          <Route path="/rbac-ui-impact/pattern/drawer" element={<PatternDrawerRoleDemoPage />} />
          <Route path="/rbac-ui-impact/pattern/full-page" element={<PatternWorkspaceSettingsDemoPage />} />
          <Route path="/rbac-ui-impact/pattern/multi-action" element={<PatternCampaignMultiActionDemoPage />} />
          <Route
            path="/closed-interaction/user-management/roles/:roleId"
            element={<RoleDetailPage />}
          />
          <Route
            path="/closed-interaction/user-management/privilege-sets/:privilegeSetId"
            element={<PrivilegeSetDetailPage />}
          />
          <Route
            path="/closed-interaction/user-management/users/:userId"
            element={<UserDetailPage />}
          />
          <Route path="/closed-interaction/user-management" element={<UserManagementPage />} />
          <Route path="/date-time" element={<DateTimeShowcasePage />} />
          <Route path="/example-settings" element={<ExampleSettingsPage />} />
          <Route path="/example-node" element={<MainContent label="example node flow" />} />
          <Route path="/example-4/child-1" element={<MainContent label="example 4 child 1" />} />
          <Route path="/example-4/child-2" element={<MainContent label="example 4 child 2" />} />
          <Route path="/app-1" element={<MainContent label="app 1" />} />
          <Route path="/app-2" element={<MainContent label="app 2" />} />
        </Route>
        {/* Catch-all — outside AppLayout so role routes are never affected */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
