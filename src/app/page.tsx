'use client'

import { useState } from 'react'
import OOSForm from '@/components/OOSForm'
import { CLIENTS } from '@/lib/config'
import styles from './page.module.css'

export default function Home() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [pendingClient, setPendingClient] = useState<string | null>(null)

  const client = CLIENTS.find(c => c.id === selectedClient) ?? null
  const pending = CLIENTS.find(c => c.id === pendingClient) ?? null
  const current = CLIENTS.find(c => c.id === selectedClient) ?? null

  const handleClientClick = (id: string) => {
    if (id === selectedClient) return
    if (selectedClient === null) {
      setSelectedClient(id)
    } else {
      setPendingClient(id)
    }
  }

  const confirmSwitch = () => {
    if (pendingClient) {
      setSelectedClient(pendingClient)
      setPendingClient(null)
    }
  }

  const cancelSwitch = () => setPendingClient(null)

  return (
    <main className={styles.main}>
      {pendingClient && (
        <div className={styles.modalOverlay} onClick={cancelSwitch}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Switch client?</h2>
            <p className={styles.modalBody}>
              You're about to switch from <strong>{current?.name}</strong> to <strong>{pending?.name}</strong>.
              Are you sure you want to change the destination spreadsheet?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={cancelSwitch}>Stay on {current?.name}</button>
              <button className={styles.modalConfirm} onClick={confirmSwitch}>Switch to {pending?.name}</button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <h1 className={styles.title}>OOS Tracker</h1>
        <div className={styles.clientButtons}>
          {CLIENTS.map(c => (
            <button
              key={c.id}
              className={`${styles.clientBtn} ${selectedClient === c.id ? styles.clientBtnActive : ''}`}
              onClick={() => handleClientClick(c.id)}
              title={c.name}
            >
              <img src={c.icon} alt={c.name} className={styles.clientIcon} />
            </button>
          ))}
        </div>
      </header>

      {!client && (
        <p className={styles.hint}>Select a client above to get started.</p>
      )}

      {CLIENTS.map(c => (
        <div key={c.id} style={{ display: selectedClient === c.id ? 'block' : 'none' }}>
          <OOSForm scriptUrl={c.scriptUrl} clientName={c.name} pacificStone={c.pacificStone} />
        </div>
      ))}
    </main>
  )
}