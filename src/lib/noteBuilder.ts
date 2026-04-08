import { OrderItem } from './types'

export function pct(val: string): string {
  const s = (val || '').trim()
  if (!s) return ''
  return s.endsWith('%') ? s : s + '%'
}

export function buildItemNote(item: OrderItem): string {
  const oosSku    = item.oosSku    || '[OOS SKU]'
  const thcStr    = pct(item.thc)  || '[THC%]'
  const uO        = item.unitsOrdered     !== '' ? parseFloat(item.unitsOrdered)     : null
  const uU        = item.unitsUnavailable !== '' ? parseFloat(item.unitsUnavailable) : null
  const subbed    = item.subbedSku || '[Subbed SKU]'
  const subThcStr = pct(item.subThc)

  let line1 = ''
  if (uO !== null && uU !== null) {
    if (uO === uU) {
      // All units unavailable
      line1 = `No available item: 0/${uO} ${oosSku} at ${thcStr} - OOS`
    } else if (uO > uU) {
      // Some units available — show how many we could fulfill vs ordered
      const available = uO - uU
      line1 = `Less available item: ${available}/${uO} ${oosSku} at ${thcStr} - OOS\nAdded last ${available} units`
    } else {
      line1 = `0/${uO} ${oosSku} at ${thcStr} - OOS`
    }
  } else {
    line1 = `0/${uO ?? '[Units Ordered]'} ${oosSku} at ${thcStr} - OOS`
  }

  let note = line1
  if (item.subOffered === 'yes') {
    note += '\n' + (subThcStr
      ? `Suggested sub: ${subbed} at ${subThcStr}`
      : `Suggested sub: ${subbed}`)
  }
  return note
}

export function buildFullNote(items: OrderItem[]): string {
  return items.map(buildItemNote).join('\n\n')
}