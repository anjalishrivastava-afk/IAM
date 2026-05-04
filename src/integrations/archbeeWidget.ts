/**
 * Hosted Archbee widget — no npm package (React 19 safe).
 * @see https://www.archbee.com/docs/app-documentation-widget-react
 */

const ARCHBEE_WIDGET_BASE = 'https://widget.archbee.com/v1'

/** Published space id (Widget integration in Archbee). */
export const ARCHBEE_PUBLISHED_SPACE_ID = 'PUBLISHED-uXc6_zUXuxQjEsmtNKgXc'

/** Doc opened from Campaign → Channel Configuration → Voicemail. */
export const ARCHBEE_DOC_VOICEMAIL_CONFIGURATION = 'yuOU_B7DjfwIGpZ2ZyJci'

type ArchbeeEvent = Record<string, unknown> & {
  eventType: string
  spaceId?: string
}

type ArchbeeBridge = {
  queue: ArchbeeEvent[]
  push: (event: ArchbeeEvent) => void
}

export type WindowWithArchbee = Window & { _archbee?: ArchbeeBridge }

/** One-time bootstrap: `_archbee` queue + lazy `main.js` (bubble hidden). */
export function bootstrapArchbeeWidget(): void {
  if (typeof window === 'undefined') return
  const w = window as WindowWithArchbee
  if (w._archbee) return

  const archbee: ArchbeeBridge = {
    queue: [],
    push(event) {
      this.queue.push(event)
    },
  }
  w._archbee = archbee

  archbee.push({
    eventType: 'init',
    spaceId: ARCHBEE_PUBLISHED_SPACE_ID,
    bubble: 'invisible',
  })

  const scripttag = document.createElement('script')
  scripttag.async = true
  scripttag.src = `${ARCHBEE_WIDGET_BASE}/main.js`
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript?.parentNode?.insertBefore(scripttag, firstScript)
}

/** Open the overlay for a doc (fires after `bootstrapArchbeeWidget` has run). */
export function archbeePush(event: ArchbeeEvent): void {
  const w = window as WindowWithArchbee
  w._archbee?.push(event)
}

export function openArchbeeDoc(docId: string): void {
  archbeePush({
    eventType: 'show-widget',
    spaceId: ARCHBEE_PUBLISHED_SPACE_ID,
    widgetType: 'docs',
    docId,
  })
}
