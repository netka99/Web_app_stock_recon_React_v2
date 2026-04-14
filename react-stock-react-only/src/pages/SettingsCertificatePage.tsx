import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { size } from '../styles/devices'
import useTemporaryMessage from '../hooks/useTemporaryMessage'
import { Navbar, Sidebar, Footer } from '../components/index'

const pageTitle = 'Ustawienia - Certyfikaty'

const CERT_API_URL =
  import.meta.env.VITE_KSEF_CERT_URL || 'http://localhost:8000/user-certificate'

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g., "data:application/x-pem-file;base64,")
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const SettingsCertificatePage = () => {
  const [messageText, showMessage] = useTemporaryMessage() as [
    string,
    (newMessage: string, duration?: number) => void,
  ]
  const [certFile, setCertFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const certInputRef = useRef<HTMLInputElement>(null)
  const keyInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!certFile || !keyFile) {
      showMessage('Wybierz oba pliki: certyfikat i klucz prywatny', 4000)
      return
    }

    setIsUploading(true)
    try {
      const [certBase64, keyBase64] = await Promise.all([
        readFileAsBase64(certFile),
        readFileAsBase64(keyFile),
      ])

      const response = await fetch(CERT_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          certificate: certBase64,
          key: keyBase64,
        }),
      })

      if (response.status === 204 || response.ok) {
        showMessage('Certyfikat i klucz zostaly zapisane!', 4000)
        setCertFile(null)
        setKeyFile(null)
        if (certInputRef.current) certInputRef.current.value = ''
        if (keyInputRef.current) keyInputRef.current.value = ''
      } else {
        const data = await response.json().catch(() => ({}))
        const errorMsg = data.error || `Blad serwera: ${response.status}`
        showMessage(errorMsg, 6000)
      }
    } catch (error) {
      console.error('Error uploading certificate:', error)
      showMessage('Problem z wysylaniem certyfikatu!', 6000)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Container>
        {messageText && (
          <div
            className={`notification ${messageText.includes('zapisane') ? 'success' : 'error'}`}
          >
            {messageText}
          </div>
        )}
        <div className="cert-wrapper">
          <div className="cert-container">
            <div className="cert-header">Certyfikat i klucz KSeF</div>

            <div className="cert-field">
              <label>Certyfikat (.pem, .crt, .cer)</label>
              <div className="file-input-wrapper">
                <input
                  ref={certInputRef}
                  type="file"
                  accept=".pem,.crt,.cer"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                />
                {certFile && <span className="file-name">{certFile.name}</span>}
              </div>
            </div>

            <div className="cert-field">
              <label>Klucz prywatny (.key, .pem)</label>
              <div className="file-input-wrapper">
                <input
                  ref={keyInputRef}
                  type="file"
                  accept=".key,.pem"
                  onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                />
                {keyFile && <span className="file-name">{keyFile.name}</span>}
              </div>
            </div>

            <div className="cert-actions">
              <button
                className="save-button"
                onClick={handleUpload}
                disabled={isUploading || !certFile || !keyFile}
              >
                {isUploading ? 'Wysylanie...' : 'Zapisz certyfikat'}
              </button>
            </div>
          </div>
        </div>
      </Container>
      <Sidebar />
      <Footer />
    </main>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
  flex-grow: 1;
  margin-bottom: 8rem;
  margin-top: 10rem;

  @media screen and (max-width: ${size.mobileL}) {
    margin-top: 4rem;
  }

  .notification {
    padding: 0.8rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;

    &.error {
      background-color: #f8d7da;
      border: 1px solid #e74c3c;
    }

    &.success {
      background-color: #d4edda;
      border: 1px solid #28a745;
    }
  }

  .cert-wrapper {
    width: 65%;

    @media screen and (max-width: ${size.mobileL}) {
      width: 95%;
    }
  }

  .cert-container {
    width: 100%;
    background-color: #ffffff;
    border-radius: 15px;
    margin: 1rem 0;
    padding: 1.5rem;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }

  .cert-header {
    font-weight: bold;
    font-size: 1.2rem;
    color: #333;
    padding: 0.5rem 0 1rem 0;
    border-bottom: 2px solid #5533cc;
    margin-bottom: 1rem;
  }

  .cert-field {
    display: flex;
    flex-direction: column;
    width: 85%;
    background-color: #f6f6f6;
    margin: 0.8rem auto;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    box-shadow:
      0 2px 4px 0 rgba(0, 0, 0, 0.1),
      0 3px 10px 0 rgba(0, 0, 0, 0.1);

    label {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #555;
      font-size: 0.9rem;
    }

    input[type='file'] {
      width: 100%;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 0.5rem;
      font-family: inherit;
      cursor: pointer;

      &:focus {
        border-color: #5533cc;
        outline: none;
      }
    }

    .file-name {
      margin-top: 0.3rem;
      font-size: 0.85rem;
      color: #5533cc;
    }
  }

  .cert-actions {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .save-button {
    background: linear-gradient(45deg, #5533cc, #7755ee);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: linear-gradient(45deg, #4422bb, #6644dd);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(85, 51, 204, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`

export default SettingsCertificatePage
