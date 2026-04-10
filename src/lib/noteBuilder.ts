import { OrderItem } from './types'

export function pct(val: string): string {
  const s = (val || '').trim()
  if (!s) return ''
  return s.endsWith('%') ? s : s + '%'
}

// Strip leading $ and parse as float
export function parsePrice(val: string): number {
  return parseFloat((val || '').replace(/^\$/, '').trim()) || 0
}

export function buildItemNote(item: OrderItem): string {
  const oosSku    = item.oosSku    || '[OOS SKU]'
  const thcStr    = pct(item.thc)
  const uO        = item.unitsOrdered     !== '' ? parseFloat(item.unitsOrdered)     : null
  const uU        = item.unitsUnavailable !== '' ? parseFloat(item.unitsUnavailable) : null
  const subbed    = item.subbedSku || '[Subbed SKU]'
  const subThcStr = pct(item.subThc)

  // Only append "at X%" if THC was entered
  const atThc = thcStr ? ` at ${thcStr}` : ''

  let line1 = ''
  if (uO !== null && uU !== null) {
    if (uO === uU) {
      line1 = `No available item: 0/${uO} ${oosSku}${atThc} - OOS`
    } else if (uO > uU) {
      const available = uO - uU
      line1 = `Less available item: ${available}/${uO} ${oosSku}${atThc} - OOS\nAdded last ${available} units`
    } else {
      line1 = `0/${uO} ${oosSku}${atThc} - OOS`
    }
  } else {
    line1 = `0/${uO ?? '[Units Ordered]'} ${oosSku}${atThc} - OOS`
  }

  let note = line1

  if (item.subOffered === 'yes') {
    note += '\n' + (subThcStr
      ? `Suggested sub: ${subbed} at ${subThcStr}`
      : `Suggested sub: ${subbed}`)
  } else if (item.subOffered === 'no') {
    note += '\nNo suitable subs'
  }

  return note
}

export function buildFullNote(items: OrderItem[]): string {
  return items.map(buildItemNote).join('\n\n')
}