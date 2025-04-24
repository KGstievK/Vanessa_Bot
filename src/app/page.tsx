'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import axios from 'axios'

type BotStatus = 'stopped' | 'starting' | 'running' | 'error'

export default function Home() {
  const [status, setStatus] = useState<BotStatus>('stopped')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  const checkStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/api/bot/status')
      setStatus(data.status)
    } catch (err) {
      console.error('Status check failed:', err)
      setError(axios.isAxiosError(err) ? err.message : 'Unknown error')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const startBot = async () => {
    setStatus('starting')
    setError(null)
    try {
      const { data } = await axios.post('/api/bot/start')
      setStatus(data.success ? 'running' : 'stopped')
    } catch (err) {
      console.error('Start failed:', err)
      setError(axios.isAxiosError(err) ? err.message : 'Start failed')
      setStatus('error')
    }
  }

  const setWebhook = async () => {
    try {
      await axios.post('/api/bot/setWebhook')
      alert('Webhook set successfully!')
    } catch (err) {
      alert(`Error setting webhook: ${axios.isAxiosError(err) ? err.message : 'Unknown error'}`)
    }
  }

  useEffect(() => { checkStatus() }, [])

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Bot Control Panel</h1>
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={checkStatus}>Retry</button>
          </div>
        )}

        <div className={styles.controlPanel}>
          <button
            onClick={startBot}
            disabled={status === 'running' || loading}
            className={`
              ${styles.button}
              ${status === 'running' ? styles.running : ''}
              ${status === 'error' ? styles.errorBtn : ''}
            `}
          >
            {loading ? 'Loading...' : 
             status === 'running' ? 'Running' :
             status === 'error' ? 'Error - Click to Retry' :
             'Start Bot'}
          </button>

          <button onClick={setWebhook} className={styles.button}>
            Set Webhook
          </button>

          <div className={styles.status}>
            <span className={`
              ${styles.statusIndicator}
              ${status === 'running' ? styles.running : ''}
              ${status === 'error' ? styles.error : ''}
            `}/>
            <span>Status: {status}</span>
          </div>
        </div>
      </div>
    </main>
  )
}