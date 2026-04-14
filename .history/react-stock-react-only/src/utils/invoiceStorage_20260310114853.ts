import type { InvoiceRecord, KSefStatus } from './types'
import { saveInvoice, updateInvoiceStatus } from '../utils/invoiceStorage'

const STORAGE_KEY = 'ksef_invoices'

// Generate UUID
function generateId(): string {
  return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Get all invoices
export function getAllInvoices(): InvoiceRecord[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Get single invoice by ID
export function getInvoiceById(id: string): InvoiceRecord | null {
  const invoices = getAllInvoices()
  return invoices.find((inv) => inv.id === id) || null
}

// Get invoice by invoice number
export function getInvoiceByNumber(invoiceNumber: string): InvoiceRecord | null {
  const invoices = getAllInvoices()
  return invoices.find((inv) => inv.invoiceNumber === invoiceNumber) || null
}

// Save new invoice
export function saveInvoice(
  invoice: Omit<InvoiceRecord, 'id' | 'createdAt' | 'updatedAt'>,
): InvoiceRecord {
  const invoices = getAllInvoices()

  const newInvoice: InvoiceRecord = {
    ...invoice,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  invoices.push(newInvoice)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))

  return newInvoice
}

// Update existing invoice
export function updateInvoice(
  id: string,
  updates: Partial<InvoiceRecord>,
): InvoiceRecord | null {
  const invoices = getAllInvoices()
  const index = invoices.findIndex((inv) => inv.id === id)

  if (index === -1) return null

  invoices[index] = {
    ...invoices[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  return invoices[index]
}

// Update invoice status
export function updateInvoiceStatus(
  id: string,
  status: KSefStatus,
  details?: {
    ksefReferenceNumber?: string
    ksefErrorMessage?: string
  },
): InvoiceRecord | null {
  const updates: Partial<InvoiceRecord> = { ksefStatus: status }

  if (status === 'sent' && details?.ksefReferenceNumber) {
    updates.ksefReferenceNumber = details.ksefReferenceNumber
    updates.ksefSentAt = new Date().toISOString()
  }

  if (status === 'accepted') {
    updates.ksefAcceptedAt = new Date().toISOString()
  }

  if (status === 'error' || status === 'rejected') {
    updates.ksefErrorMessage = details?.ksefErrorMessage
  }

  return updateInvoice(id, updates)
}

// Delete invoice
export function deleteInvoice(id: string): boolean {
  const invoices = getAllInvoices()
  const filtered = invoices.filter((inv) => inv.id !== id)

  if (filtered.length === invoices.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

// Get invoices by status
export function getInvoicesByStatus(status: KSefStatus): InvoiceRecord[] {
  return getAllInvoices().filter((inv) => inv.ksefStatus === status)
}
