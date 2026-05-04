import { UserManagementPage } from '../UserManagementPage'

/**
 * RBAC UI Impact pattern 03 (hub: “Campaign details”) — campaign shell with HDFC Outbound Voice
 * header actions, eight-section rail, and Basic Settings retains the Roles / Privilege Sets grids for demo.
 */
export function PatternCampaignMultiActionDemoPage() {
  return <UserManagementPage variant="campaign" />
}
