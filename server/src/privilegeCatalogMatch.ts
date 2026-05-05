import type { CatSeed, PermSeed, SgSeed } from './seed.js'

export function normCatalogSegment(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function denyAllGrantFlags(categories: CatSeed[]): void {
  for (const c of categories) {
    for (const sg of c.subgroups) {
      for (const p of sg.permissions) {
        p.granted = false
      }
    }
  }
}

/** Returns candidate subgroups ordered by traversal (deduped by subgroup id). */
export function resolveSubgroupsBySpec(
  categories: CatSeed[],
  spec: string,
): Array<{ cat: CatSeed; sg: SgSeed }> {
  const trimmed = spec.trim()
  if (!trimmed) return []

  const out: Array<{ cat: CatSeed; sg: SgSeed }> = []
  const seenSg = new Set<string>()
  const push = (pair: { cat: CatSeed; sg: SgSeed }) => {
    if (seenSg.has(pair.sg.id)) return
    seenSg.add(pair.sg.id)
    out.push(pair)
  }

  const segments = trimmed.split(/\s*>\s*/).map((p) => p.trim()).filter(Boolean)
  const norms = segments.map(normCatalogSegment)

  if (norms.length >= 2) {
    const catHint = norms[0]
    const subHint = norms.slice(1).join(' ')
    for (const c of categories) {
      const ct = normCatalogSegment(c.title)
      const catOk = ct === catHint || ct.includes(catHint) || catHint.includes(ct)
      if (!catOk) continue
      for (const sg of c.subgroups) {
        const st = normCatalogSegment(sg.title)
        if (st === subHint || st.includes(subHint) || subHint.includes(st)) push({ cat: c, sg })
      }
    }
    return out
  }

  const subHint = norms[0]
  for (const c of categories) {
    for (const sg of c.subgroups) {
      const st = normCatalogSegment(sg.title)
      if (st === subHint || st.includes(subHint) || subHint.includes(st)) push({ cat: c, sg })
    }
  }
  return out
}

function catalogPathSamples(categories: CatSeed[], limit: number): string[] {
  const paths: string[] = []
  for (const c of categories) {
    for (const sg of c.subgroups) {
      paths.push(`${c.title} > ${sg.title}`)
      if (paths.length >= limit) return paths
    }
  }
  return paths
}

export function requireSingleSubgroup(
  categories: CatSeed[],
  spec: string,
  ctx: string,
): { cat: CatSeed; sg: SgSeed } {
  const matches = resolveSubgroupsBySpec(categories, spec)
  if (matches.length === 1) return matches[0]

  const samples = catalogPathSamples(categories, 10)

  if (matches.length === 0) {
    throw new Error(
      `${ctx}: No subgroup matched "${spec}". Examples: ${samples.join('; ')}. Call list_permission_catalog first.`,
    )
  }

  throw new Error(
    `${ctx}: Ambiguous subgroup "${spec}" — matched: ${matches.map(({ cat, sg }) => `${cat.title} > ${sg.title}`).join(' | ')}. Prefer a full "Category > Subgroup" path.`,
  )
}

/** Resolve permission labels to rows in this subgroup (exact match, then single-prefix match). */
export function matchPermissionLabelsInSubgroup(
  subgroup: SgSeed,
  requested: string[],
): { granted: PermSeed[]; unmatched: string[] } {
  const granted: PermSeed[] = []
  const unmatched: string[] = []
  const used = new Set<string>()

  for (const r of requested) {
    const nr = normCatalogSegment(r)
    if (!nr) continue
    const exact = subgroup.permissions.find((p) => normCatalogSegment(p.label) === nr)
    if (exact) {
      if (!used.has(exact.id)) {
        used.add(exact.id)
        granted.push(exact)
      }
      continue
    }
    const prefixHits = subgroup.permissions.filter((p) => {
      const nl = normCatalogSegment(p.label)
      return nl === nr || nl.startsWith(`${nr} `)
    })
    if (prefixHits.length === 1) {
      const p = prefixHits[0]
      if (!used.has(p.id)) {
        used.add(p.id)
        granted.push(p)
      }
      continue
    }
    unmatched.push(r)
  }
  return { granted, unmatched }
}

export type CopilotPrivilegeGrantOptions = {
  grantAllInSubgroups?: string[]
  grantPermissionsInSubgroup?: { subgroupPath: string; permissionLabels: string[] }[]
}

/**
 * When any grant option is set: deny all, then apply scoped grants.
 * When none: leave `categories` grants unchanged (keyword baseline from categoriesForNewPrivilegeSet).
 */
export function applyCopilotPrivilegeGrantsOnTree(
  categories: CatSeed[],
  opts: CopilotPrivilegeGrantOptions,
): { applied: boolean; notes: string[] } {
  const allSpecs = (opts.grantAllInSubgroups ?? []).map((s) => s.trim()).filter(Boolean)
  const scoped = (opts.grantPermissionsInSubgroup ?? []).filter(
    (x) => x.permissionLabels.length > 0 && x.subgroupPath.trim(),
  )

  if (allSpecs.length === 0 && scoped.length === 0) {
    return { applied: false, notes: [] }
  }

  denyAllGrantFlags(categories)
  const notes: string[] = []

  for (const spec of allSpecs) {
    const { cat, sg } = requireSingleSubgroup(categories, spec, 'grantAllInSubgroups')
    for (const p of sg.permissions) p.granted = true
    notes.push(`All ${sg.permissions.length} permissions in "${cat.title} > ${sg.title}"`)
  }

  for (const row of scoped) {
    const { cat, sg } = requireSingleSubgroup(categories, row.subgroupPath, 'grantPermissionsInSubgroup')
    const { granted, unmatched } = matchPermissionLabelsInSubgroup(sg, row.permissionLabels)
    if (unmatched.length) {
      const avail = sg.permissions.map((p) => p.label).join(', ')
      throw new Error(
        `grantPermissionsInSubgroup: could not match labels ${JSON.stringify(unmatched)} in "${cat.title} > ${sg.title}". Available: ${avail}`,
      )
    }
    for (const p of granted) p.granted = true
    notes.push(
      `${granted.length} selected permission(s) in "${cat.title} > ${sg.title}": ${granted.map((p) => p.label).join(', ')}`,
    )
  }

  return { applied: true, notes }
}
