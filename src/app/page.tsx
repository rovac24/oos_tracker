import OOSForm from '@/components/OOSForm'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>OOS Tracker</h1>
        <p className={styles.subtitle}></p>
      </header>
      <OOSForm />
    </main>
  )
}
