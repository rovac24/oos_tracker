'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { OrderItem, OrderData } from '@/lib/types'
import { buildFullNote, parsePrice, toTitleCase } from '@/lib/noteBuilder'
import ItemRow from './ItemRow'
import NoteOutput from './NoteOutput'
import styles from './OOSForm.module.css'

function createItem(): OrderItem {
  return {
    id: Date.now() + Math.random(),
    oosSku: '', unitsOrdered: '', unitsUnavailable: '',
    unitPrice: '', thc: '', subbedSku: '', subThc: '', subOffered: null,
  }
}

function formatDate(d: Date, pacificStone: boolean): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  if (pacificStone) {
    return `${d.getMonth() + 1}/${dd}/${yy}`
  }
  return `${mm}.${dd}.${yy}`
}

interface FieldErrors {
  placedOrder?: string
  retailerName?: string
  salesRep?: string
  items?: Record<number, ItemErrors>
}

interface ItemErrors {
  oosSku?: string
  unitsOrdered?: string
  unitsUnavailable?: string
  unitPrice?: string
  subbedSku?: string
}

interface Props { scriptUrl: string; clientName: string; pacificStone: boolean }

export default function OOSForm({ scriptUrl, clientName, pacificStone }: Props) {
  const placedOrderRef = useRef<HTMLInputElement>(null)

  const [order, setOrder] = useState<OrderData>({
    placedOrder: '',
    retailerName: '',
    items: [createItem()],
  })
  const [salesRep, setSalesRep] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [showModal, setShowModal] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => { placedOrderRef.current?.focus() }, [])

  useEffect(() => {
    setNote(buildFullNote(order.items))
  }, [order])

  const updateItem = useCallback((id: number, patch: Partial<OrderItem>) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...patch } : item),
    }))
    setErrors(prev => {
      const itemIndex = prev.items ? Object.keys(prev.items).find(
        k => order.items[parseInt(k)]?.id === id
      ) : undefined
      if (itemIndex === undefined || !prev.items) return prev
      const idx = parseInt(itemIndex)
      const patchKeys = Object.keys(patch)
      const newItemErrors = { ...prev.items[idx] }
      patchKeys.forEach(k => { delete newItemErrors[k as keyof ItemErrors] })
      return { ...prev, items: { ...prev.items, [idx]: newItemErrors } }
    })
  }, [order.items])

  const [focusItemId, setFocusItemId] = useState<number | null>(null)

  const addItem = () => {
    const newItem = createItem()
    setFocusItemId(newItem.id)
    setOrder(prev => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const removeItem = (id: number) => {
    setOrder(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
  }

  const resetForm = () => {
    setOrder({ placedOrder: '', retailerName: '', items: [createItem()] })
    setSalesRep('')
    setStatus(null)
    setErrors({})
    setTimeout(() => placedOrderRef.current?.focus(), 0)
  }

  const showStatus = (msg: string, type: 'success' | 'error') => {
    setStatus({ msg, type })
    setTimeout(() => setStatus(null), 4000)
  }

  const validate = () => {
    const newErrors: FieldErrors = {}
    const missing: string[] = []

    if (!order.placedOrder.trim()) {
      newErrors.placedOrder = 'Required'
      missing.push('Placed Order #')
    }
    if (!order.retailerName.trim()) {
      newErrors.retailerName = 'Required'
      missing.push('Retailer Name')
    }
    if (pacificStone && !salesRep) {
      newErrors.salesRep = 'Required'
      missing.push('Sales Rep')
    }

    const itemErrors: Record<number, ItemErrors> = {}
    order.items.forEach((item, idx) => {
      const ie: ItemErrors = {}
      const label = order.items.length > 1 ? ` (Item ${idx + 1})` : ''
      if (!item.oosSku.trim()) { ie.oosSku = 'Required'; missing.push(`OOS SKU${label}`) }
      if (!item.unitsOrdered.toString().trim()) { ie.unitsOrdered = 'Required'; missing.push(`Units Ordered${label}`) }
      if (!item.unitsUnavailable.toString().trim()) { ie.unitsUnavailable = 'Required'; missing.push(`Units Unavailable${label}`) }
      if (!item.unitPrice.toString().trim()) { ie.unitPrice = 'Required'; missing.push(`Unit Price${label}`) }
      if (item.subOffered === null) { ie.subbedSku = 'Please select Yes or No'; missing.push(`Sub Offered${label}`) }
      if (item.subOffered === 'yes' && !item.subbedSku.trim()) { ie.subbedSku = 'Required'; missing.push(`Subbed SKU${label}`) }
      if (Object.keys(ie).length > 0) itemErrors[idx] = ie
    })

    if (Object.keys(itemErrors).length > 0) newErrors.items = itemErrors
    setErrors(newErrors)

    if (missing.length > 0) {
      setMissingFields(missing)
      setShowModal(true)
      return false
    }
    return true
  }

  const sendAndClear = async () => {
    if (!validate()) return
    setSending(true)

    const orderDate = formatDate(new Date(), pacificStone)
    const payload = {
      orderDate,
      placedOrder: toTitleCase(order.placedOrder),
      retailerName: toTitleCase(order.retailerName),
      salesRep,
      note,
      items: order.items.map(item => {
        const unitsUnavailable = parseFloat(item.unitsUnavailable) || 0
        const unitPrice = parsePrice(item.unitPrice)
        const total = (unitsUnavailable * unitPrice).toFixed(2)
        const isNo = item.subOffered === 'no'
        const isYes = item.subOffered === 'yes'

        return {
          oosSku: toTitleCase(item.oosSku),
          unitsOrdered: item.unitsOrdered,
          unitsUnavailable: item.unitsUnavailable,
          unitPrice: `$${unitPrice.toFixed(2)}`,
          total: `$${total}`,
          subOffered: isYes ? 'Yes' : 'No',
          subAccepted: isYes ? 'Pending' : 'No',
          // Ascend: subbedSku always gets the value (including "No suitable subs" message)
          // Pacific Stone: subbedSku only gets value on Yes; No goes to notes field
          subbedSku: isYes
            ? toTitleCase(item.subbedSku)
            : pacificStone ? '' : toTitleCase(item.subbedSku),
          notes: pacificStone && isNo ? toTitleCase(item.subbedSku) : '',
        }
      }),
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      showStatus('Sent! Starting new order…', 'success')
      setTimeout(() => resetForm(), 1200)
    } catch {
      showStatus('Error sending. Check your URL and try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  const multiItem = order.items.length > 1

  return (
    <>
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Missing information</h2>
            <p className={styles.modalSubtitle}>Please fill in the following fields before sending:</p>
            <ul className={styles.modalList}>
              {missingFields.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button className={styles.modalBtn} onClick={() => setShowModal(false)}>Got it</button>
          </div>
        </div>
      )}

      <div className={styles.form}>
        <p className={styles.sectionLabel}>Order info</p>
        <div className={styles.card}>
          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <label>Placed Order #</label>
              <input
                ref={placedOrderRef}
                value={order.placedOrder}
                onChange={e => {
                  setOrder(prev => ({ ...prev, placedOrder: e.target.value }))
                  if (errors.placedOrder) setErrors(prev => ({ ...prev, placedOrder: undefined }))
                }}
                placeholder="e.g. PO-1234"
                className={errors.placedOrder ? styles.inputError : ''}
              />
              {errors.placedOrder && <span className={styles.errorMsg}>{errors.placedOrder}</span>}
            </div>
            <div className={styles.field}>
              <label>Retailer Name</label>
              <input
                value={order.retailerName}
                onChange={e => {
                  setOrder(prev => ({ ...prev, retailerName: e.target.value }))
                  if (errors.retailerName) setErrors(prev => ({ ...prev, retailerName: undefined }))
                }}
                placeholder="e.g. Green Leaf Co."
                className={errors.retailerName ? styles.inputError : ''}
              />
              {errors.retailerName && <span className={styles.errorMsg}>{errors.retailerName}</span>}
            </div>
            {pacificStone && (
              <div className={styles.field}>
                <label>Sales Rep</label>
                <select
                  value={salesRep}
                  onChange={e => {
                    setSalesRep(e.target.value)
                    if (errors.salesRep) setErrors(prev => ({ ...prev, salesRep: undefined }))
                  }}
                  className={errors.salesRep ? styles.inputError : ''}
                >
                  <option value="">— Select —</option>
                  <option>Anthony</option>
                  <option>Tim</option>
                  <option>Nicole</option>
                  <option>Panda</option>
                  <option>Vinny</option>
                  <option>Juan</option>
                  <option>Max</option>
                </select>
                {errors.salesRep && <span className={styles.errorMsg}>{errors.salesRep}</span>}
              </div>
            )}
          </div>
        </div>

        <p className={styles.sectionLabel}>Items</p>
        {order.items.map((item, idx) => (
          <ItemRow
            key={item.id}
            item={item}
            index={idx}
            canRemove={multiItem}
            onChange={updateItem}
            onRemove={removeItem}
            errors={errors.items?.[idx]}
            autoFocus={item.id === focusItemId}
          />
        ))}

        <button className={styles.addBtn} onClick={addItem}>+ add another item</button>

        <hr className={styles.divider} />

        <p className={styles.sectionLabel}>Generated note</p>
        <NoteOutput note={note} />

        {status && (
          <div className={`${styles.statusMsg} ${styles[status.type]}`}>
            {status.msg}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.sendBtn} onClick={sendAndClear} disabled={sending}>
            {sending ? 'Sending…' : multiItem ? 'Send OOS Notes' : 'Send OOS Note'}
          </button>
          <button className={styles.clearBtn} onClick={resetForm} title="Clear everything">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Clear
          </button>
        </div>
      </div>
    </>
  )
}