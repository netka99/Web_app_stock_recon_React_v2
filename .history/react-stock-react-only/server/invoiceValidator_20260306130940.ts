import { InvoiceData, ValidationResult } from './types.js'

export function validateInvoiceData(invoiceData: InvoiceData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // ===== WALIDACJA NIP =====
  if (!invoiceData.buyer_data?.nip || invoiceData.buyer_data.nip.trim() === '') {
    errors.push('Brak numeru NIP nabywcy')
  } else {
    const nip = invoiceData.buyer_data.nip.replace(/[\s-]/g, '')
    if (!/^\d{10}$/.test(nip)) {
      errors.push('NIP nabywcy musi mieć 10 cyfr')
    }
  }

  // ===== WALIDACJA DAT =====
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const invoiceDate = new Date(invoiceData.invoiceDate)
  const dateDiff = Math.floor(
    (today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (dateDiff < 0) {
    errors.push('Data wystawienia faktury nie może być w przyszłości')
  } else if (dateDiff > 1) {
    if (dateDiff <= 7) {
      warnings.push(
        `Data wystawienia jest ${dateDiff} dni wstecz (dozwolone tylko przy problemach technicznych KSeF)`,
      )
    } else {
      errors.push(
        `Data wystawienia jest ${dateDiff} dni wstecz (maksymalnie 7 dni przy problemach technicznych)`,
      )
    }
  }

  // ===== WALIDACJA DŁUGOŚCI PÓL =====
  const maxLengths: Record<string, { value?: string; max: number }> = {
    'Nazwa nabywcy': { value: invoiceData.buyer_data?.nazwa, max: 240 },
    'Adres L1 nabywcy': { value: invoiceData.buyer_data?.addressL1, max: 200 },
    'Adres L2 nabywcy': { value: invoiceData.buyer_data?.addressL2, max: 200 },
    'Numer faktury': { value: invoiceData.invoiceNumber, max: 256 },
    'Miasto wystawienia': { value: invoiceData.city, max: 256 },
  }

  if (invoiceData.buyer_data?.hasPodmiot3 && invoiceData.buyer_data?.podmiot3) {
    maxLengths['Nazwa odbiorcy (Podmiot3)'] = {
      value: invoiceData.buyer_data.podmiot3.nazwa,
      max: 240,
    }
    maxLengths['ID wewnętrzny odbiorcy'] = {
      value: invoiceData.buyer_data.podmiot3.idWew,
      max: 50,
    }
  }

  Object.entries(maxLengths).forEach(([fieldName, { value, max }]) => {
    if (value && value.length > max) {
      errors.push(`${fieldName} jest za długie (${value.length}/${max} znaków)`)
    }
  })

  // ===== WALIDACJA PRODUKTÓW =====
  const checkedProducts = invoiceData.products.filter((p) => p.checked)

  if (checkedProducts.length === 0) {
    errors.push('Brak zaznaczonych produktów na fakturze')
  }

  checkedProducts.forEach((product, index) => {
    if (!product.productName || product.productName.trim() === '') {
      errors.push(`Produkt #${index + 1}: Brak nazwy produktu`)
    }
    if (product.quantity <= 0) {
      errors.push(`Produkt "${product.productName}": Ilość musi być większa od 0`)
    }
    if (product.grossPrice <= 0) {
      errors.push(`Produkt "${product.productName}": Cena brutto musi być większa od 0`)
    }
    if (![0, 3, 4, 5, 7, 8, 22, 23].includes(product.vat)) {
      errors.push(
        `Produkt "${product.productName}": Nieprawidłowa stawka VAT (${product.vat}%)`,
      )
    }
  })

  // ===== WALIDACJA TERMINU PŁATNOŚCI =====
  if (invoiceData.paymentDate) {
    const paymentDate = new Date(invoiceData.paymentDate)
    if (paymentDate < invoiceDate) {
      errors.push('Termin płatności nie może być wcześniejszy niż data wystawienia')
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
}
