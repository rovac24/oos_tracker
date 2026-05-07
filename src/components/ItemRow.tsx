'use client'

import { useEffect, useRef } from 'react'
import { OrderItem } from '@/lib/types'
import styles from './ItemRow.module.css'

const NO_SUB_MESSAGE = 'No suitable subs'

interface ItemErrors {
  oosSku?: string
  unitsOrdered?: string
  unitsUnavailable?: string
  unitPrice?: string
  subbedSku?: string
  unitsExceed?: string
}

interface Props {
  item: OrderItem
  index: number
  canRemove: boolean
  onChange: (id: number, patch: Partial<OrderItem>) => void
  onRemove: (id: number) => void
  errors?: ItemErrors
  autoFocus?: boolean
}

export default function ItemRow({ item, index, canRemove, onChange, onRemove, errors = {}, autoFocus }: Props) {
  const set = (patch: Partial<OrderItem>) => onChange(item.id, patch)
  const subActive = item.subOffered === 'yes'
  const oosSkuRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) oosSkuRef.current?.focus()
  }, [autoFocus])

  const uO = item.unitsOrdered !== '' ? parseFloat(item.unitsOrdered) : null
  const uU = item.unitsUnavailable !== '' ? parseFloat(item.unitsUnavailable) : null
  const unitsExceed = uO !== null && uU !== null && uU > uO

  const handleSubOffered = (val: 'yes' | 'no') => {
    if (val === 'no') {
      set({ subOffered: 'no', subbedSku: NO_SUB_MESSAGE })
    } else {
      set({
        subOffered: 'yes',
        subbedSku: item.subbedSku === NO_SUB_MESSAGE ? '' : item.subbedSku,
      })
    }
  }

  return (
    <div className={`${styles.card} ${Object.keys(errors).length > 0 ? styles.cardError : ''}`}>
      <div className={styles.header}>
        <span className={styles.badge}>Item {index + 1}</span>
        {canRemove && (
          <button className={styles.removeBtn} onClick={() => onRemove(item.id)} aria-label="Remove item">×</button>
        )}
      </div>

      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <label>OOS SKU</label>
          <input
            ref={oosSkuRef}
            value={item.oosSku}
            onChange={e => set({ oosSku: e.target.value })}
            placeholder="SKU name"
            className={errors.oosSku ? styles.inputError : ''}
          />
          {errors.oosSku && <span className={styles.errorMsg}>{errors.oosSku}</span>}
        </div>
        <div className={styles.field}>
          <label>Units Ordered</label>
          <input
            type="number"
            value={item.unitsOrdered}
            onChange={e => set({ unitsOrdered: e.target.value })}
            placeholder="0"
            className={errors.unitsOrdered || unitsExceed ? styles.inputError : ''}
          />
          {errors.unitsOrdered && <span className={styles.errorMsg}>{errors.unitsOrdered}</span>}
        </div>
        <div className={styles.field}>
          <label>Units Unavailable</label>
          <input
            type="number"
            value={item.unitsUnavailable}
            onChange={e => set({ unitsUnavailable: e.target.value })}
            placeholder="0"
            className={errors.unitsUnavailable || unitsExceed ? styles.inputError : ''}
          />
          {errors.unitsUnavailable && <span className={styles.errorMsg}>{errors.unitsUnavailable}</span>}
          {unitsExceed && (
            <span className={styles.errorMsg}>Cannot exceed Units Ordered</span>
          )}
        </div>
        <div className={styles.field}>
          <label>Unit Price</label>
          <input
            value={item.unitPrice}
            onChange={e => set({ unitPrice: e.target.value })}
            placeholder="$0.00"
            className={errors.unitPrice ? styles.inputError : ''}
          />
          {errors.unitPrice && <span className={styles.errorMsg}>{errors.unitPrice}</span>}
        </div>
        <div className={styles.field}>
          <label>THC % (Optional)</label>
          <input
            value={item.thc}
            onChange={e => set({ thc: e.target.value })}
            placeholder="e.g. 24"
          />
        </div>
      </div>

      <div className={styles.subRow}>
        <div className={styles.toggleField}>
          <label className={errors.subbedSku && item.subOffered === null ? styles.labelError : ''}>
            Sub Offered
          </label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${item.subOffered === 'yes' ? styles.yes : ''} ${errors.subbedSku && item.subOffered === null ? styles.toggleError : ''}`}
              onClick={() => handleSubOffered('yes')}
            >Yes</button>
            <button
              className={`${styles.toggleBtn} ${item.subOffered === 'no' ? styles.no : ''} ${errors.subbedSku && item.subOffered === null ? styles.toggleError : ''}`}
              onClick={() => handleSubOffered('no')}
            >No</button>
          </div>
          {errors.subbedSku && item.subOffered === null && (
            <span className={styles.errorMsg}>{errors.subbedSku}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Subbed SKU</label>
          <input
            value={item.subbedSku}
            onChange={e => set({ subbedSku: e.target.value })}
            placeholder="Substitute SKU"
            disabled={item.subOffered === null}
            className={errors.subbedSku && item.subOffered === 'yes' ? styles.inputError : ''}
          />
          {errors.subbedSku && item.subOffered === 'yes' && (
            <span className={styles.errorMsg}>{errors.subbedSku}</span>
          )}
        </div>

        <div className={`${styles.field} ${styles.subThcField}`}>
          <label>Sub THC % (Optional)</label>
          <input
            value={item.subThc}
            onChange={e => set({ subThc: e.target.value })}
            placeholder="e.g. 28"
            disabled={!subActive}
          />
        </div>
      </div>
    </div>
  )
}