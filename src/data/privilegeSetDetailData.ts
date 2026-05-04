/**
 * Privilege Set detail payload — RBAC playground (Figma 48:15931 / 48:16030).
 */
import { PRIVILEGE_SET_ROWS, type PrivilegeSetRow } from './privilegeSets'

export interface PermissionNode {
  id: string
  label: string
  granted: boolean
  /** License / plan-gated: UI shows key icon, disabled + “contact sales” tooltip. */
  isKey?: boolean
}

export interface PrivilegeSubgroupNode {
  id: string
  title: string
  description: string
  grantedCount: number
  totalCount: number
  permissions: PermissionNode[]
}

export interface PrivilegeCategoryNode {
  id: string
  title: string
  description: string
  sidebarCountLabel: number
  grantedCount: number
  totalCount: number
  subgroups: PrivilegeSubgroupNode[]
}

export interface PrivilegeSetDetailModel {
  base: PrivilegeSetRow
  /** Long subtitle + basic-fields body (Figma differs from terse list cell). */
  longDescription: string
  assignedRoleNames: string[]
  categories: PrivilegeCategoryNode[]
}

function subgroup(
  sid: string,
  title: string,
  description: string,
  rows: Omit<PermissionNode, 'id'>[],
): PrivilegeSubgroupNode {
  const permissions: PermissionNode[] = rows.map((r, i) => ({
    id: `${sid}-p-${i}`,
    ...r,
  }))
  const totalCount = permissions.length
  const grantedCount = permissions.filter((p) => p.granted).length
  return {
    id: sid,
    title,
    description,
    grantedCount,
    totalCount,
    permissions,
  }
}

function categoryFromSubgroups(
  id: string,
  title: string,
  description: string,
  subgroups: PrivilegeSubgroupNode[],
): PrivilegeCategoryNode {
  let totalCount = 0
  let grantedCount = 0
  for (const sg of subgroups) {
    totalCount += sg.totalCount
    grantedCount += sg.grantedCount
  }
  return {
    id,
    title,
    description,
    sidebarCountLabel: totalCount,
    grantedCount,
    totalCount,
    subgroups,
  }
}

/**
 * Dense enterprise contact-center taxonomy (routing, QM, compliance, WFM,
 * integrations, outbound, digital, identity). Used for playground ps-4.
 */
const DETAIL_MONITOR: PrivilegeSetDetailModel = {
  base: PRIVILEGE_SET_ROWS.find((r) => r.id === 'ps-4')!,
  longDescription: 'Recording, reports and dashboards',
  assignedRoleNames: ['Supervisor', 'Analyst', 'Executive'],
  categories: [
    categoryFromSubgroups(
      'cat-monitor',
      'Monitor',
      'Real-time and operational contact-center visibility',
      [
        subgroup('sg-live', 'Live monitoring', 'Listen / assist on active legs', [
          { label: 'View', granted: true },
          { label: 'Snoop', granted: true },
          { label: 'Whisper', granted: true },
          { label: 'Barge', granted: true },
          { label: 'Take over', granted: true },
          { label: 'Force disconnect', granted: true },
          { label: 'View metadata', granted: true },
          { label: 'Tag moment', granted: true },
          { label: 'Download clip', granted: true },
          { label: 'Share snapshot', granted: true },
          { label: 'Mask audio', granted: true },
        ]),
        subgroup('sg-agent', 'Agent monitoring', 'State, occupancy, and timeline', [
          { label: 'View', granted: true },
          { label: 'List agents', granted: true },
          { label: 'Filter', granted: true },
          { label: 'Export snapshot', granted: true },
          { label: 'Nudge', granted: true },
          { label: 'Reassign', granted: true },
          { label: 'View aux codes', granted: true },
          { label: 'View timeline', granted: true },
          { label: 'Alert on breach', granted: true },
        ]),
        subgroup('sg-queue', 'Queue monitoring', 'Waits, SLA, abandons, callbacks', [
          { label: 'View', granted: true },
          { label: 'Drill in', granted: true },
          { label: 'Set threshold', granted: true },
          { label: 'Rebalance', granted: false, isKey: true },
          { label: 'View forecast', granted: true },
          { label: 'Abandonment detail', granted: true },
          { label: 'Callback list', granted: true },
          { label: 'Override routing', granted: false, isKey: true },
        ]),
        subgroup('sg-manual', 'Manual review sessions', 'User-initiated monitoring sessions and notes', [
          { label: 'Create', granted: true },
          { label: 'View', granted: true },
          { label: 'Edit', granted: true },
          { label: 'Delete', granted: false },
          { label: 'Add note', granted: true },
          { label: 'Close session', granted: true },
          { label: 'Reopen', granted: true },
          { label: 'Assign reviewer', granted: true },
          { label: 'Lock session', granted: false, isKey: true },
        ]),
        subgroup('sg-incident', 'Incident response', 'Escalations tied to live operations', [
          { label: 'View', granted: true },
          { label: 'Create ticket', granted: true },
          { label: 'Assign owner', granted: true },
          { label: 'Snooze', granted: true },
          { label: 'Resolve', granted: false },
          { label: 'Post-mortem link', granted: true },
          { label: 'Notify leadership', granted: false, isKey: true },
          { label: 'Archive', granted: true },
        ]),
        subgroup('sg-wfm', 'Workforce views', 'Real-time adherence and staffing', [
          { label: 'View schedule', granted: true },
          { label: 'Compare plan', granted: true },
          { label: 'Shift swap approve', granted: false },
          { label: 'Overtime offer', granted: true },
          { label: 'Break override', granted: false, isKey: true },
          { label: 'Team rollup', granted: true },
          { label: 'Export CSV', granted: true },
          { label: 'Alert roster gap', granted: true },
          { label: 'Capacity hint', granted: true },
          { label: 'Skill mix view', granted: true },
        ]),
        subgroup('sg-ops', 'Operational dashboards', 'Tiles and drill paths for ops leaders', [
          { label: 'View', granted: true },
          { label: 'Configure layout', granted: true },
          { label: 'Share link', granted: true },
          { label: 'Schedule snapshot', granted: true },
          { label: 'Embed in wallboard', granted: false },
          { label: 'Drill to detail', granted: true },
          { label: 'Compare interval', granted: true },
          { label: 'Annotate', granted: true },
          { label: 'Threshold alert', granted: true },
          { label: 'Mute tile', granted: true },
        ]),
        subgroup('sg-media', 'Media compliance', 'Recording access and redaction', [
          { label: 'Play', granted: true },
          { label: 'Download', granted: false, isKey: true },
          { label: 'Redact PII', granted: false },
          { label: 'Chain of custody', granted: true },
          { label: 'Legal hold', granted: false, isKey: true },
          { label: 'Share internally', granted: true },
          { label: 'Retention tag', granted: true },
          { label: 'Parental dual consent', granted: false },
          { label: 'Redaction template', granted: true },
        ]),
        subgroup('sg-mon-dial', 'Dialer oversight', 'Outbound campaign health without agent takeover', [
          { label: 'View campaign KPIs', granted: true },
          { label: 'Preview list sample', granted: true },
          { label: 'Pacing graph', granted: true },
          { label: 'Abandon rate drill', granted: true },
          { label: 'TCPA window check', granted: true },
          { label: 'List freeze request', granted: false },
          { label: 'Blacklist override', granted: false, isKey: true },
          { label: 'AMD tuning view', granted: true },
          { label: 'Retry policy read', granted: true },
          { label: 'Timezone compliance', granted: true },
        ]),
        subgroup('sg-mon-ivr', 'IVR & call paths', 'Traffic, hotspots, failover without editor write', [
          { label: 'Node heatmap', granted: true },
          { label: 'Drop-off funnel', granted: true },
          { label: 'DTMF path trace', granted: true },
          { label: 'Queue exit volume', granted: true },
          { label: 'After-hours branch', granted: true },
          { label: 'Open editor', granted: false, isKey: true },
          { label: 'Version compare', granted: true },
          { label: 'Rollback request', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-voice',
      'Voice & telephony',
      'Carriers, numbering, SIP profiles, and voice policies for enterprise PBX / CCaaS',
      [
        subgroup('sg-v-num', 'Numbers & DIDs', 'Inventory, portability, and billing ownership', [
          { label: 'View inventory', granted: true },
          { label: 'Order DID', granted: true },
          { label: 'Port request', granted: false },
          { label: 'Emergency address', granted: true },
          { label: 'CNAM override', granted: false },
          { label: 'Toll-free steering', granted: true },
          { label: 'Region lock', granted: false, isKey: true },
          { label: 'Usage chargeback', granted: true },
          { label: 'Release number', granted: false },
        ]),
        subgroup('sg-v-sip', 'SIP & carriers', 'Trunks, auth, codec, and failure domains', [
          { label: 'View trunk', granted: true },
          { label: 'Create trunk', granted: false },
          { label: 'IP allowlist edit', granted: false, isKey: true },
          { label: 'SBC profile', granted: true },
          { label: 'OPTIONS probe', granted: true },
          { label: 'Failover ladder', granted: true },
          { label: 'Media bypass', granted: false },
          { label: 'Packet capture request', granted: false, isKey: true },
          { label: 'BYOC switch', granted: false },
        ]),
        subgroup('sg-v-route', 'Inbound routing', 'DNIS, geo, time-of-day, skills', [
          { label: 'View DNIS map', granted: true },
          { label: 'Edit entry point', granted: false },
          { label: 'Geo policy', granted: true },
          { label: 'Holiday schedule', granted: true },
          { label: 'Overflow chain', granted: true },
          { label: 'VIP route', granted: false, isKey: true },
          { label: 'DR warm standby', granted: false },
        ]),
        subgroup('sg-v-outpol', 'Outbound policy', 'ANI, STIR/SHAKEN, local presence', [
          { label: 'ANI pool view', granted: true },
          { label: 'Edit ANI policy', granted: false },
          { label: 'Attestation tier', granted: true },
          { label: 'Branded call', granted: false },
          { label: 'Stir trace', granted: true },
        ]),
        subgroup('sg-v-vm', 'Voicemail & prompts', 'Greetings, languages, TTS', [
          { label: 'Listen', granted: true },
          { label: 'Upload prompt', granted: true },
          { label: 'TTS synth', granted: true },
          { label: 'Delete prompt', granted: false },
        ]),
        subgroup('sg-v-emer', 'Emergency & E911', 'PSAP mapping and test calls', [
          { label: 'View location', granted: true },
          { label: 'Test call', granted: false },
          { label: 'Migrate address', granted: false, isKey: true },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-omni',
      'Omnichannel',
      'Email, messaging, chat, and social workspaces alongside voice',
      [
        subgroup('sg-o-email', 'Email queues', 'Skills, SLA, threading, disclaimers', [
          { label: 'Assign mailbox', granted: true },
          { label: 'Edit routing rule', granted: false },
          { label: 'Template library', granted: true },
          { label: 'HTML sanitizer bypass', granted: false, isKey: true },
          { label: 'Auto-reply windows', granted: true },
          { label: 'PII masking preview', granted: true },
        ]),
        subgroup('sg-o-chat', 'Live chat & cobrowse', 'Web widget, escalation, transcripts', [
          { label: 'Inject script', granted: false },
          { label: 'Cobrowse approve', granted: false },
          { label: 'Queue priority', granted: true },
          { label: 'Transcript export', granted: true },
          { label: 'Proactive invite', granted: false },
          { label: 'Session idle policy', granted: true },
        ]),
        subgroup('sg-o-msg', 'Messaging apps', 'WhatsApp Business, SMS,RCS', [
          { label: 'Template submit', granted: false },
          { label: 'Opt keyword list', granted: true },
          { label: 'Media OCR', granted: false },
          { label: 'Session handoff voice', granted: true },
          { label: 'Bulk broadcast', granted: false, isKey: true },
        ]),
        subgroup('sg-o-soc', 'Social & reviews', 'Public channel moderation', [
          { label: 'View threads', granted: true },
          { label: 'Reply approve', granted: false },
          { label: 'Hide comment', granted: false },
          { label: 'Sentiment rollup', granted: true },
          { label: 'Escalate legal', granted: false, isKey: true },
        ]),
        subgroup('sg-o-async', 'Asynchronous ticketing', 'Backlog, merge, SLA clock', [
          { label: 'Merge tickets', granted: false },
          { label: 'Split ticket', granted: false },
          { label: 'SLA breach override', granted: false, isKey: true },
          { label: 'Bulk reassign', granted: true },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-reporting',
      'Reporting',
      'Scheduled, ad-hoc, and governed exports for stakeholders',
      [
        subgroup('sg-rep-std', 'Standard reports', 'Curated library and PDF scheduling', [
          { label: 'View library', granted: true },
          { label: 'Run on demand', granted: true },
          { label: 'Schedule email', granted: true },
          { label: 'Share template', granted: true },
          { label: 'Clone', granted: true },
          { label: 'Archive run', granted: true },
          { label: 'Compare periods', granted: true },
          { label: 'Drill to detail', granted: true },
          { label: 'Watermark', granted: true },
          { label: 'Brand theme', granted: false },
        ]),
        subgroup('sg-rep-cust', 'Custom reports', 'Builder, SQL, and governed fields', [
          { label: 'Create', granted: true },
          { label: 'Edit', granted: true },
          { label: 'Delete', granted: false },
          { label: 'SQL mode', granted: false, isKey: true },
          { label: 'Join datasets', granted: false },
          { label: 'Preview', granted: true },
          { label: 'Validate', granted: true },
          { label: 'Publish', granted: false },
          { label: 'Version history', granted: true },
          { label: 'Rollback', granted: false },
        ]),
        subgroup('sg-rep-dash', 'Dashboards & KPIs', 'Executive and team scorecards', [
          { label: 'View', granted: true },
          { label: 'Edit layout', granted: true },
          { label: 'Set target', granted: true },
          { label: 'Alert on miss', granted: true },
          { label: 'Embed', granted: true },
          { label: 'TV mode', granted: true },
          { label: 'Export PNG', granted: true },
          { label: 'Share public link', granted: false, isKey: true },
        ]),
        subgroup('sg-rep-audit', 'Audit trail', 'Who ran what and data lineage', [
          { label: 'View runs', granted: true },
          { label: 'Filter user', granted: true },
          { label: 'Export log', granted: true },
          { label: 'Immutable proof', granted: false, isKey: true },
        ]),
        subgroup('sg-rep-reg', 'Regulatory packs', 'SOX / HIPAA appendix exports', [
          { label: 'SOX attest pack', granted: false },
          { label: 'HIPAA BAA appendix', granted: false, isKey: true },
          { label: 'PCI redacted extract', granted: false },
          { label: 'Country filter', granted: true },
          { label: 'Archive to vault', granted: false },
        ]),
        subgroup('sg-rep-cdp', 'Data warehouse feeds', 'ETL jobs and freshness SLAs', [
          { label: 'View jobs', granted: true },
          { label: 'Pause job', granted: false, isKey: true },
          { label: 'Schema map', granted: true },
          { label: 'PII hashing mode', granted: false },
          { label: 'Backfill rerun', granted: false },
          { label: 'SLA alert hook', granted: true },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-notifications',
      'Notifications',
      'In-app, email, SMS, and webhook delivery with throttles',
      [
        subgroup('sg-n-ch', 'Channels', 'Where alerts may be delivered', [
          { label: 'In-app', granted: true },
          { label: 'Email', granted: true },
          { label: 'SMS', granted: true },
          { label: 'Teams', granted: true },
          { label: 'Slack', granted: true },
          { label: 'Webhook', granted: false, isKey: true },
          { label: 'Pager', granted: false, isKey: true },
        ]),
        subgroup('sg-n-rule', 'Rules & routing', 'Policies, filters, quiet hours', [
          { label: 'Create rule', granted: true },
          { label: 'Edit priority', granted: true },
          { label: 'Mute topic', granted: true },
          { label: 'Escalation path', granted: false },
          { label: 'Rate limit', granted: true },
          { label: 'Digest bundle', granted: true },
          { label: 'Test send', granted: true },
          { label: 'Copy rule', granted: true },
        ]),
        subgroup('sg-n-tpl', 'Templates', 'Locales, placeholders, approvals', [
          { label: 'View', granted: true },
          { label: 'Edit HTML', granted: false },
          { label: 'Plain text fallback', granted: true },
          { label: 'Locale add', granted: false },
          { label: 'Preview', granted: true },
          { label: 'Approve publish', granted: false, isKey: true },
        ]),
        subgroup('sg-n-sys', 'System events', 'Platform health and integration alerts', [
          { label: 'Outage banner', granted: true },
          { label: 'API latency', granted: true },
          { label: 'Queue backlog', granted: true },
          { label: 'License warning', granted: true },
        ]),
        subgroup('sg-n-sla', 'SLA & escalation', 'Customer escalation chains', [
          { label: 'View chain', granted: true },
          { label: 'Edit escalation', granted: false },
          { label: 'On-call roster', granted: true },
          { label: 'Page bridge', granted: false, isKey: true },
        ]),
        subgroup('sg-n-ai', 'AI summarisation', 'Post-call/email digests', [
          { label: 'Summarize to supervisor', granted: false },
          { label: 'PII-aware redact', granted: false, isKey: true },
          { label: 'Feedback tone', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-audience',
      'Audience',
      'Segments, eligibility, suppression, and outreach consent',
      [
        subgroup('sg-a-seg', 'Segments', 'Build and refresh audience definitions', [
          { label: 'View', granted: true },
          { label: 'Create', granted: true },
          { label: 'Edit criteria', granted: true },
          { label: 'Refresh sample', granted: true },
          { label: 'Schedule sync', granted: false },
          { label: 'Export members', granted: false, isKey: true },
          { label: 'Clone', granted: true },
          { label: 'Archive', granted: false },
          { label: 'Share segment', granted: true },
          { label: 'Version diff', granted: false },
        ]),
        subgroup('sg-a-sup', 'Suppression lists', 'DNC / opt-outs and compliance holds', [
          { label: 'View', granted: true },
          { label: 'Add entry', granted: true },
          { label: 'Bulk upload', granted: false, isKey: true },
          { label: 'Remove', granted: false },
          { label: 'Audit reason', granted: true },
          { label: 'Expire rule', granted: true },
        ]),
        subgroup('sg-a-con', 'Consent & preferences', 'Channel and purpose-level consent', [
          { label: 'Read profile', granted: true },
          { label: 'Update prefs', granted: true },
          { label: 'Prove consent', granted: false, isKey: true },
          { label: 'Double opt-in', granted: true },
          { label: 'Resubscribe flow', granted: true },
        ]),
        subgroup('sg-a-lal', 'Lookalike / overlap', 'Advanced audience expansion', [
          { label: 'Run overlap', granted: false },
          { label: 'Seed upload', granted: false, isKey: true },
          { label: 'Similarity score', granted: false },
        ]),
        subgroup('sg-a-ent', 'Accounts & hierarchy', 'Enterprise org / subaccounts', [
          { label: 'Roll up spend', granted: true },
          { label: 'Parent override', granted: false },
          { label: 'Site ID tag', granted: true },
          { label: 'Contract tier', granted: true },
        ]),
        subgroup('sg-a-tm', 'Timezone & reachability', 'Best time to call / quiet hours', [
          { label: 'Local time window', granted: true },
          { label: 'Override holiday', granted: false },
          { label: 'Sunset campaign', granted: false },
          { label: 'Channel preference infer', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-content',
      'Content',
      'Scripts, snippets, knowledge articles, and media libraries',
      [
        subgroup('sg-c-lib', 'Libraries', 'Folders, tags, and lifecycle', [
          { label: 'Browse', granted: true },
          { label: 'Upload', granted: true },
          { label: 'Move', granted: true },
          { label: 'Delete', granted: false },
          { label: 'Tag', granted: true },
          { label: 'Approve publish', granted: false, isKey: true },
          { label: 'Lock version', granted: true },
          { label: 'Compare versions', granted: true },
          { label: 'Share link', granted: true },
          { label: 'Download original', granted: false },
        ]),
        subgroup('sg-c-art', 'Articles & macros', 'Agent-facing quick answers', [
          { label: 'View', granted: true },
          { label: 'Create', granted: true },
          { label: 'Edit', granted: true },
          { label: 'Deprecate', granted: false },
          { label: 'Usage stats', granted: true },
          { label: 'Feedback loop', granted: true },
          { label: 'Pin to queue', granted: true },
        ]),
        subgroup('sg-c-media', 'Media assets', 'Prompts, legal disclaimers, audio', [
          { label: 'Play preview', granted: true },
          { label: 'Replace asset', granted: false },
          { label: 'Transcode', granted: false, isKey: true },
          { label: 'Attach to campaign', granted: true },
        ]),
        subgroup('sg-c-loc', 'Localization', 'Locales and review workflow', [
          { label: 'Add locale', granted: false },
          { label: 'Translate task', granted: true },
          { label: 'Review approve', granted: false },
        ]),
        subgroup('sg-c-voice-bot', 'Conversational design', 'Intents & dialog policies', [
          { label: 'Edit intent graph', granted: false },
          { label: 'Entity registry', granted: false },
          { label: 'Handoff thresholds', granted: true },
          { label: 'Abandon intent log', granted: true },
          { label: 'LLM grounding policy', granted: false, isKey: true },
        ]),
        subgroup('sg-c-coach', 'Coaching overlays', 'In-panel coaching tips', [
          { label: 'Embed tip', granted: true },
          { label: 'A/B script branch', granted: false },
          { label: 'Risk phrase highlight', granted: false },
          { label: 'Competitor mention watch', granted: false },
        ]),
        subgroup('sg-c-comply', 'Disclosure snippets', 'Regulatory disclaimers per region', [
          { label: 'Approve legal text', granted: false, isKey: true },
          { label: 'Attach to DNIS', granted: false },
          { label: 'Preview play order', granted: true },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-engagement',
      'Engagement & campaigns',
      'Outbound dialing, nurture journeys, and journey experimentation',
      [
        subgroup('sg-e-prv', 'Campaign preview', 'Draft states and stakeholder sign-off', [
          { label: 'View drafts', granted: true },
          { label: 'Submit review', granted: false },
          { label: 'Stakeholder annotate', granted: true },
          { label: 'Promote staging', granted: false, isKey: true },
        ]),
        subgroup('sg-e-seq', 'Journey sequencer', 'Multi-step flows across channels', [
          { label: 'Fork on reply', granted: false },
          { label: 'A/B throttle', granted: false },
          { label: 'Exit criterion', granted: true },
          { label: 'Delay node', granted: true },
          { label: 'Human approval gate', granted: false },
        ]),
        subgroup('sg-e-ob', 'Outbound lists', 'List hygiene & rotation', [
          { label: 'View list health', granted: true },
          { label: 'Refresh from CRM', granted: false },
          { label: 'Cap daily attempts', granted: false },
          { label: 'Prioritize warm', granted: true },
          { label: 'Randomize order', granted: false },
          { label: 'Export sample', granted: true },
          { label: 'DNC reconcile', granted: false, isKey: true },
        ]),
        subgroup('sg-e-inb', 'Inbound capture', 'Web-to-queue, missed-call recovery', [
          { label: 'Callback promise', granted: true },
          { label: 'Form-to-case', granted: false },
          { label: 'Abandon salvage', granted: true },
          { label: 'SLA pledge text', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-wfm',
      'Workforce optimization',
      'Forecasting, scheduling, adherence, and intraday re-planning',
      [
        subgroup('sg-w-sch', 'Scheduling', 'Patterns, rotations, swaps', [
          { label: 'Publish schedule', granted: false, isKey: true },
          { label: 'Edit shift swap', granted: false },
          { label: 'Overtime accept', granted: true },
          { label: 'PTO blackout', granted: false },
          { label: 'Skill staffing rule', granted: false },
          { label: 'View heatmap gap', granted: true },
        ]),
        subgroup('sg-w-fc', 'Forecasting', 'Queues, Erlang overlays, uplift', [
          { label: 'View forecast', granted: true },
          { label: 'Edit uplift factor', granted: false },
          { label: 'Import history', granted: false },
          { label: 'What-if model', granted: false, isKey: true },
        ]),
        subgroup('sg-w-adh', 'Adherence', 'Exceptions, grace, coaching notes', [
          { label: 'View exceptions', granted: true },
          { label: 'Override exception', granted: false, isKey: true },
          { label: 'Coaching memo', granted: false },
          { label: 'Aux mapping edit', granted: false },
        ]),
        subgroup('sg-w-intra', 'Intraday', 'Reforecast, shrink, reallocations', [
          { label: 'Move agent pool', granted: false },
          { label: 'Close queue surge', granted: false },
          { label: 'Notify teams', granted: true },
          { label: 'Rebalance skills', granted: false, isKey: true },
        ]),
        subgroup('sg-w-gam', 'Gamification lite', 'Optional leaderboards tied to QoS', [
          { label: 'Leaderboard toggle', granted: false },
          { label: 'Metric weight edit', granted: false },
          { label: 'Display on TV wall', granted: true },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-lead-mgmt',
      'Lead & case management',
      'Lead lifecycle, dispositions, and CRM-aligned records',
      [
        subgroup('sg-l-dis', 'Disposition codes', 'Taxonomy governance', [
          { label: 'Suggest new code', granted: false },
          { label: 'Retire code', granted: false, isKey: true },
          { label: 'Map to QA reason', granted: false },
          { label: 'Audit trail view', granted: true },
          { label: 'Bulk remap', granted: false },
        ]),
        subgroup('sg-l-prior', 'Priority & SLA', 'SLA clocks and escalation', [
          { label: 'Breach alert', granted: true },
          { label: 'Escalate L2', granted: false },
          { label: 'Pause SLA', granted: false, isKey: true },
          { label: 'VIP pin', granted: false },
          { label: 'Throttling rule', granted: false },
        ]),
        subgroup('sg-l-imp', 'Imports & merges', 'Bulk leads and dedupe', [
          { label: 'Dry run import', granted: false },
          { label: 'Commit import', granted: false, isKey: true },
          { label: 'Merge duplicate', granted: false },
          { label: 'Enrichment hook', granted: false },
          { label: 'Error log export', granted: true },
        ]),
        subgroup('sg-l-case', 'Case records', '360° timelines and linkage', [
          { label: 'View timeline', granted: true },
          { label: 'Link outbound touch', granted: false },
          { label: 'PII purge request', granted: false },
          { label: 'Export case PDF', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-analysis',
      'Analysis',
      'Dashboards, speech analytics correlations, and deep operational drill-down',
      [
        subgroup('sg-dash', 'Dashboards', 'Saved views and KPI tiles', [
          { label: 'Sales funnel', granted: true },
          { label: 'SLA heatmap', granted: true },
          { label: 'Agent scoreboard', granted: false },
          { label: 'Custom SQL', granted: false, isKey: true },
          { label: 'Forecast blend', granted: false },
          { label: 'Cohort compare', granted: false },
          { label: 'Export snapshot', granted: false },
          { label: 'Alert subscription', granted: false },
        ]),
        subgroup('sg-an-sp', 'Speech analytics labels', 'Topic, intent & sentiment overlays', [
          { label: 'Bind label set', granted: false },
          { label: 'Retrain corpus', granted: false, isKey: true },
          { label: 'Precision audit', granted: false },
          { label: 'Agent opt-out anonymize', granted: false },
        ]),
        subgroup('sg-an-path', 'Journey attribution', 'Path mix across intents', [
          { label: 'Sankey explorer', granted: false },
          { label: 'Segment compare', granted: false },
          { label: 'Cost-per-resolution', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-qm',
      'Quality assurance',
      'Scorecards, calibrations, coaching, disputes, root-cause',
      [
        subgroup('sg-q-sc', 'Scorecards', 'Weighted rubrics and auto fail rules', [
          { label: 'Draft rubric', granted: false },
          { label: 'Publish version', granted: false, isKey: true },
          { label: 'Bind to queues', granted: false },
          { label: 'Random sample sizing', granted: false },
        ]),
        subgroup('sg-q-cal', 'Calibration', 'Agreement sessions across evaluators', [
          { label: 'Host calibration', granted: false },
          { label: 'Drift correction', granted: false },
          { label: 'Blind adjudicate', granted: false },
        ]),
        subgroup('sg-q-ch', 'Coaching workflows', 'Action plans tied to evaluations', [
          { label: 'Assign coach', granted: false },
          { label: 'Track completion', granted: false },
          { label: 'Close loop survey', granted: false },
        ]),
        subgroup('sg-q-disp', 'Disputes', 'Formal contest of scores', [
          { label: 'Raise dispute', granted: false },
          { label: 'Arbitrate', granted: false, isKey: true },
          { label: 'Escalate legal', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-user-admin',
      'Users & identity',
      'Org directory, SSO, MFA, impersonation governance',
      [
        subgroup('sg-u-dir', 'Directory', 'Agents, supervisors, admins', [
          { label: 'Create user', granted: false },
          { label: 'Deactivate user', granted: false, isKey: true },
          { label: 'Reset MFA', granted: false },
          { label: 'Assign skills', granted: false },
          { label: 'Bulk CSV import', granted: false, isKey: true },
        ]),
        subgroup('sg-u-sso', 'SSO & SAML', 'IdP metadata and JIT', [
          { label: 'Upload metadata', granted: false },
          { label: 'Test SAML flow', granted: false },
          { label: 'Group mapping edit', granted: false, isKey: true },
          { label: 'SCIM reconcile', granted: false },
        ]),
        subgroup('sg-u-imp', 'Privileged access', 'Support impersonation vault', [
          { label: 'Request impersonation', granted: false, isKey: true },
          { label: 'Approve session', granted: false },
          { label: 'Session watermark', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-sys-config',
      'Routing & platform',
      'Queues, disposition maps, geo and business-hours policies',
      [
        subgroup('sg-s-q', 'Queues & prioritization', 'Fairness tiers and backlog caps', [
          { label: 'Create queue', granted: false },
          { label: 'Priority formula', granted: false, isKey: true },
          { label: 'Overflow graph', granted: false },
          { label: 'Skill stack editor', granted: false },
        ]),
        subgroup('sg-s-bh', 'Business hours', 'Regional calendars', [
          { label: 'Edit holiday calendar', granted: false },
          { label: 'After-hours IVR shortcut', granted: false },
          { label: 'DST transition test', granted: false },
        ]),
        subgroup('sg-s-geo', 'Geo & tenancy', 'Data residency footprints', [
          { label: 'Tenant split view', granted: false },
          { label: 'Storage region pin', granted: false, isKey: true },
          { label: 'Cross-region fail drill', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-compliance-quality',
      'Compliance & risk',
      'Recording policy, HIPAA/PCI overlays, DPIA artefacts, attestations',
      [
        subgroup('sg-x-rec', 'Recording policy', 'Which legs to record vs mask', [
          { label: 'Consent capture mode', granted: false, isKey: true },
          { label: 'Dual-consent jurisdictions', granted: false },
          { label: 'Pause-record events', granted: false },
          { label: 'Export policy doc', granted: false },
        ]),
        subgroup('sg-x_pci', 'PCI DSS scope', 'Card data handling surface', [
          { label: 'DTMF masking depth', granted: false },
          { label: 'Pan scan alert', granted: false },
          { label: 'ASV scope tag', granted: false },
          { label: 'Segmentation attest', granted: false, isKey: true },
        ]),
        subgroup('sg-x-pii', 'Data subject rights', 'DSAR timelines', [
          { label: 'Export subject pack', granted: false },
          { label: 'Erasure certify', granted: false, isKey: true },
          { label: 'Consent withdraw log', granted: false },
        ]),
        subgroup('sg-x-monitor', 'Monitored assurance', 'Policy simulation & sampling', [
          { label: 'Run controls test', granted: false },
          { label: 'Sample transactions', granted: false },
          { label: 'Issue CAPA tracking', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-integrations',
      'Integrations',
      'CRM, CDP, data warehouse, ticketing, middleware',
      [
        subgroup('sg-i-api', 'API keys & quotas', 'Per-tenant quotas and revocation', [
          { label: 'Create keypair', granted: false },
          { label: 'Rotate secret', granted: false, isKey: true },
          { label: 'Burst rate override', granted: false },
          { label: 'IP pinning', granted: false },
        ]),
        subgroup('sg-i-crm', 'CRM connectors', 'Salesforce/Dynamics/Zendesk sync', [
          { label: 'Map fields', granted: false },
          { label: 'Conflict resolver', granted: false },
          { label: 'Bi-direction pause', granted: false },
        ]),
        subgroup('sg-i-evt', 'Event webhooks', 'Signed delivery and replay safety', [
          { label: 'Register endpoint', granted: false },
          { label: 'Replay DLQ', granted: false, isKey: true },
          { label: 'Schema validate', granted: false },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-workspace-data',
      'Workspace & data',
      'Sandboxes, redacted exports, lineage, archival legal holds',
      [
        subgroup('sg-d-sbx', 'Sandboxes', 'Non-prod data slices', [
          { label: 'Provision sandbox', granted: false },
          { label: 'Refresh anon data', granted: false, isKey: true },
          { label: 'Promote config up', granted: false },
        ]),
        subgroup('sg-d-lin', 'Lineage catalog', 'Field-level lineage and owners', [
          { label: 'Declare owner', granted: false },
          { label: 'Break glass access', granted: false, isKey: true },
        ]),
      ],
    ),
    categoryFromSubgroups(
      'cat-billing-license',
      'Billing & licenses',
      'Consumption metering, contract entitlements, purchase orders',
      [
        subgroup('sg-b-mtr', 'Metering reads', 'Per-minute / per-agent rollups', [
          { label: 'Variance explain', granted: false },
          { label: 'Usage export', granted: false },
          { label: 'Cost allocation tags', granted: false },
        ]),
        subgroup('sg-b-ent', 'Entitlements', 'Feature flags bound to SKU', [
          { label: 'Bump seat cap', granted: false, isKey: true },
          { label: 'Temp burst pack', granted: false },
          { label: 'True-up reconcile', granted: false },
        ]),
      ],
    ),
  ],
}

function buildFallback(row: PrivilegeSetRow): PrivilegeSetDetailModel {
  const names = row.usedByRoleNames
  const cat: PrivilegeCategoryNode = {
    id: 'cat-general',
    title: 'General',
    description: 'Core permissions for this privilege set.',
    sidebarCountLabel: 12,
    grantedCount: 9,
    totalCount: 12,
    subgroups: [
      subgroup('sg-core', 'Core access', 'Essential read/write toggles.', [
        { label: 'View workspace', granted: true },
        { label: 'Edit records', granted: true },
        { label: 'Export CSV', granted: true },
        { label: 'API read', granted: false, isKey: true },
        { label: 'Delete', granted: false },
      ]),
    ],
  }
  return {
    base: row,
    longDescription: row.description || 'Configure access for teams using this privilege set.',
    assignedRoleNames: names,
    categories: [cat],
  }
}

export function getPrivilegeSetDetail(id: string): PrivilegeSetDetailModel | null {
  const row = PRIVILEGE_SET_ROWS.find((r) => r.id === id)
  if (!row) return null
  if (id === 'ps-4') return DETAIL_MONITOR
  const fb = buildFallback(row)
  return { ...fb, longDescription: row.description || fb.longDescription, assignedRoleNames: row.usedByRoleNames }
}

export function countPrivilegeGrants(detail: PrivilegeSetDetailModel): { granted: number; total: number } {
  let granted = 0
  let total = 0
  for (const c of detail.categories) {
    for (const s of c.subgroups) {
      for (const p of s.permissions) {
        total += 1
        if (p.granted) granted += 1
      }
    }
  }
  return { granted, total }
}

/** Build initial grant map from model (permission id → granted). */
export function buildGrantMapFromDetail(detail: PrivilegeSetDetailModel): Record<string, boolean> {
  const m: Record<string, boolean> = {}
  for (const c of detail.categories) {
    for (const s of c.subgroups) {
      for (const p of s.permissions) {
        m[p.id] = p.granted
      }
    }
  }
  return m
}
