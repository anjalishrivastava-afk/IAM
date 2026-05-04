/**
 * Loads Archbee widget scripts once for the authenticated shell.
 */
import { useEffect } from 'react'
import { bootstrapArchbeeWidget } from '../integrations/archbeeWidget'

export function ArchbeeDocsWidget() {
  useEffect(() => {
    bootstrapArchbeeWidget()
  }, [])

  return null
}
