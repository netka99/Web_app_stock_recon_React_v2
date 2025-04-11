import { useState, useEffect, useRef } from 'react'

const useTemporaryMessage = (
  initialMessage = '',
): [string, (newMessage: string, duration: number) => void] => {
  const [message, setMessage] = useState<string>(initialMessage)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null) // Keeps track of the active timeout

  const showMessage = (newMessage: string, duration: number = 3000): void => {
    setMessage(newMessage) // Set message immediately

    // Clear any existing timeout to prevent early clearing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout to remove the message after the specified duration
    timeoutRef.current = setTimeout(() => {
      setMessage('') // Remove message after time expires
      timeoutRef.current = null // Reset timeout reference
    }, duration)
  }

  // Clean up the timeout if the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [message, showMessage]
}

export default useTemporaryMessage
