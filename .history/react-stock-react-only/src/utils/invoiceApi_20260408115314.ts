/**
 * Invoice API utilities for backend communication
 */

export interface InvoiceListItem {
  link: string
}

export interface InvoiceDetails {
  referenceNumber: string
  sessionReferenceNumber: string
  nip: string
  invoiceHash: string
  issueDate: string
  shop: string
  totalGrossCents: number
  createdAt: string
  ksefNumber?: string
  invoiceNumber?: string
  status?: {
    code: number
    description: string
  }
  upo?: {
    xml: string
    hash: string
  }
  qrCode?: {
    data: string
    invoiceHash: string
    issueDate: string
    sellerNip: string
  }
  cached: boolean
}

// VITE_KSEF_API_URL should be set to 'http://localhost:8000/invoices' (includes /invoices)
const BACKEND_URL = import.meta.env.VITE_KSEF_API_URL || 'http://localhost:8000/invoices'
const KSEF_AUTH_URL =
  import.meta.env.VITE_KSEF_AUTH_URL || 'http://localhost:8000/ksef-authentications'
// const SSAPI_BASE_URL = import.meta.env.VITE_SSAPI_BASE_URL || 'http://localhost:8000'

/**
 * Fetch list of invoices from backend
 * @param shop - Optional shop filter (e.g., 'abc')
 * @returns Array of invoice links
 */

/**
 * Check if active KSeF session exists
 * Returns array of active tokens or empty array
 */
export const checkKsefSession = async (): Promise<
  Array<{
    token_type: 'access' | 'refresh'
    valid_until: string
  }>
> => {
  const response = await fetch('http://localhost:8000/ksef-authentications', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to check KSeF session: ${response.status}`)
  }

  return await response.json()
}

export const authenticateWithKsef = async (
  nip: string,
  passphrase: string,
): Promise<void> => {
  const response = await fetch(KSEF_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nip, passphrase }),
    // Keep KSeF/auth cookies in sync during local development.
    credentials: 'include',
  })

  if (!response.ok) {
    const data = await response.json()
    if (response.status === 422) {
      throw new Error('Uwierzytelnianie KSeF w trakcie, spróbuj ponownie za chwilę')
    }
    throw new Error(`Błąd uwierzytelniania: ${data.outcome || response.status}`)
  }
}

export const fetchInvoiceList = async (shop?: string): Promise<InvoiceListItem[]> => {
  try {
    const url = shop
      ? `${BACKEND_URL}?shop=${encodeURIComponent(shop)}`
      : `${BACKEND_URL}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.status}`)
    }

    const data = await response.json()
    return data as InvoiceListItem[]
  } catch (error) {
    console.error('Error fetching invoice list:', error)
    throw error
  }
}

/**
 * Fetch detailed invoice information
 * @param referenceNumber - Invoice reference number (from the link)
 * @returns Invoice details
 */
export const fetchInvoiceDetails = async (
  referenceNumber: string,
): Promise<InvoiceDetails> => {
  try {
    const response = await fetch(`${BACKEND_URL}/${referenceNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch invoice details: ${response.status}`)
    }

    const data = await response.json()
    return data as InvoiceDetails
  } catch (error) {
    console.error('Error fetching invoice details:', error)
    throw error
  }
}

/**
 * Extract reference number from invoice link
 * @param link - Invoice link (e.g., "/invoices/20260308-EE-31F4D5D000-CA57512E21-FE")
 * @returns Reference number
 */
export const extractReferenceNumber = (link: string): string => {
  return link.replace('/invoices/', '')
}

/**
 * Fetch all invoices with full details
 * @param shop - Optional shop filter
 * @returns Array of invoice details
 */
export const fetchAllInvoicesWithDetails = async (
  shop?: string,
): Promise<InvoiceDetails[]> => {
  try {
    // Get list of invoice links
    const invoiceList = await fetchInvoiceList(shop)

    // Fetch details for each invoice
    const detailsPromises = invoiceList.map((item) => {
      const referenceNumber = extractReferenceNumber(item.link)
      return fetchInvoiceDetails(referenceNumber)
    })

    const allDetails = await Promise.all(detailsPromises)
    return allDetails
  } catch (error) {
    console.error('Error fetching all invoices with details:', error)
    throw error
  }
}

/**
 * Update invoice status after receiving UPO from KSeF
 * @param referenceNumber - Invoice reference number
 * @param updates - Status fields to update
 */
export const updateInvoiceStatus = async (
  referenceNumber: string,
  updates: {
    ksef_number?: string
    invoice_number?: string
    status_code?: number
    status_description?: string
  },
): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/${referenceNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Failed to update invoice status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error updating invoice status:', error)
    throw error
  }
}

/**
 * Poll invoice status until processing completes or timeout
 * Backend returns 202 while processing, 200 when done
 */
export const pollInvoiceStatus = async (
  referenceNumber: string,
  maxRetries: number = 30,
  initialDelay: number = 1000,
): Promise<InvoiceDetails> => {
  let delay = initialDelay

  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(`http://localhost:8000/invoices/${referenceNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    const data = await response.json()

    // Status 200 = processing complete
    if (response.status === 200 && data.status?.code === 200) {
      return data as InvoiceDetails
    }

    // Status 202 = still processing, retry
    if (response.status === 202) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 1.5, 10000) // Exponential backoff, max 10s
      continue
    }

    // Other status = error
    throw new Error(`Invoice processing failed: ${response.status}`)
  }

  throw new Error('Invoice polling timeout')
}
