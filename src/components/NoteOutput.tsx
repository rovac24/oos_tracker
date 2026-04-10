'use client'

import { useState } from 'react'
import styles from './NoteOutput.module.css'

export default function NoteOutput({ note }: { note: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!note) return
    navigator.clipboard.writeText(note)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.card}>
          {note
            ? <p className={styles.text}>{note}</p>
            : <p className={styles.placeholder}>Fill in the fields above to generate the note.</p>
          }
        </div>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          disabled={!note}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}