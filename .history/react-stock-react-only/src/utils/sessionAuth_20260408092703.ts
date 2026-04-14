export const authenticateSession = async (): Promise<string> => {
  const secret = import.meta.env.VITE_SSAPI_AUTH_SECRET
  const response = await fetch(`http://localhost:8000/auth/${secret}`, {
    credentials: 'include', // Store session cookie
  })

  if (!response.ok) {
    throw new Error('Session authentication failed')
  }

  return 'authenticated' // Cookie is set automatically
}
