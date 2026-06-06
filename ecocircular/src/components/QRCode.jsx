import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onScan }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError]       = useState('')
  const scannerRef              = useRef(null)
  const html5QrRef              = useRef(null)
  const stoppedRef              = useRef(false)   // evita doble stop

  async function startScan() {
    setError('')
    stoppedRef.current = false
    setScanning(true)
  }

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5Qrcode('qr-reader')
    html5QrRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        if (stoppedRef.current) return
        stoppedRef.current = true
        scanner.stop()
          .catch(() => {})
          .finally(() => {
            setScanning(false)
            onScan(decodedText)
          })
      },
      () => {}   // errores de frame ignorados
    ).catch(err => {
      setScanning(false)
      setError('No se pudo acceder a la cámara')
      console.error(err)
    })

    // cleanup: solo detener si realmente está corriendo
    return () => {
      if (stoppedRef.current) return
      stoppedRef.current = true
      const s = html5QrRef.current
      if (s) {
        // isRunning puede no existir en versiones viejas — usamos try/catch
        try {
          if (s.isRunning()) s.stop().catch(() => {})
        } catch {
          s.stop().catch(() => {})
        }
      }
    }
  }, [scanning])

  function stopScan() {
    if (stoppedRef.current) return
    stoppedRef.current = true
    const s = html5QrRef.current
    if (s) {
      try {
        if (s.isRunning()) s.stop().catch(() => {})
      } catch {
        s.stop().catch(() => {})
      }
    }
    setScanning(false)
  }

  return (
    <div>
      {scanning && (
        <div style={{ marginBottom: 12 }}>
          <div
            id="qr-reader"
            ref={scannerRef}
            style={{ borderRadius: 14, overflow: 'hidden' }}
          />
          <button onClick={stopScan} style={cancelBtnStyle}>
            Cancelar
          </button>
        </div>
      )}

      {!scanning && (
        <button onClick={startScan} style={scanBtnStyle}>
          📷 Escanear QR del ciudadano
        </button>
      )}

      {error && (
        <p style={{ color: '#FFB0B0', fontSize: 13, marginTop: 8 }}>{error}</p>
      )}
    </div>
  )
}

const scanBtnStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1px dashed rgba(76,175,128,0.4)', background: 'transparent',
  color: '#4CAF80', fontWeight: 700, fontSize: 14, cursor: 'pointer',
}

const cancelBtnStyle = {
  marginTop: 10, width: '100%', padding: '10px', borderRadius: 12,
  border: '1px solid rgba(255,100,100,0.3)', background: 'transparent',
  color: '#FFB0B0', fontSize: 13, cursor: 'pointer',
}