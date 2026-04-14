import { InvoiceData, ValidationResult } from './types.js'
import { getInvoiceByNumber } from './invoiceStorage'
import Big from 'big.js'

export function validateInvoiceData(invoiceData: InvoiceData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // ===== WALIDACJA DUPLIKATÓW =====
  const existingInvoice = getInvoiceByNumber(invoiceData.invoiceNumber)

  if (existingInvoice && existingInvoice.ksefStatus === 'accepted') {
    errors.push(
      `Duplikat faktury: Faktura "${invoiceData.invoiceNumber}" została już zaakceptowana w KSeF (Numer KSeF: ${existingInvoice.ksefNumber || 'N/A'}). Nie można wysłać tej samej faktury ponownie.`,
    )
  }

  if (existingInvoice && existingInvoice.ksefStatus === 'sent') {
    warnings.push(
      `Ostrzeżenie: Faktura "${invoiceData.invoiceNumber}" została już wysłana do KSeF i oczekuje na przetworzenie. Upewnij się, że chcesz wysłać ją ponownie.`,
    )
  }

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
  invoiceDate.setHours(0, 0, 0, 0)
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

  // Helper: Check if number has invalid separators (must use . not ,)
  const hasInvalidSeparators = (num: number): boolean => {
    const str = num.toString()
    return str.includes(',') || str.includes(' ')
  }

  // Helper: Check decimal precision
  const checkPrecision = (num: number, maxDecimals: number, fieldName: string): void => {
    const str = num.toString()
    const decimals = str.includes('.') ? str.split('.')[1].length : 0
    if (decimals > maxDecimals) {
      errors.push(`${fieldName}: Za dużo miejsc po kropce (${decimals}/${maxDecimals})`)
    }
  }

  // Totals for sum validation
  let calculatedTotalGross = 0
  const calculatedVatSummary: Record<
    number,
    { net: number; vat: number; gross: number }
  > = {}

  checkedProducts.forEach((product, index) => {
    const productLabel = product.productName || `Produkt #${index + 1}`

    // Name validation
    if (!product.productName || product.productName.trim() === '') {
      errors.push(`Produkt #${index + 1}: Brak nazwy produktu`)
    } else if (product.productName.length > 512) {
      errors.push(
        `${productLabel}: Nazwa za długa (${product.productName.length}/512 znaków)`,
      )
    }

    // Unit validation (P_8A - max 50 chars)
    if (product.units && product.units.length > 50) {
      errors.push(
        `${productLabel}: Jednostka za długa (${product.units.length}/50 znaków)`,
      )
    }

    // Quantity validation (P_8B - max 6 decimals)
    if (product.quantity <= 0) {
      errors.push(`${productLabel}: Ilość musi być większa od 0`)
    } else {
      checkPrecision(product.quantity, 6, `${productLabel} - Ilość (P_8B)`)
      if (hasInvalidSeparators(product.quantity)) {
        errors.push(
          `${productLabel}: Ilość zawiera nieprawidłowe separatory (użyj kropki)`,
        )
      }
    }

    // Unit price validation (P_9B - max 8 decimals)
    if (product.grossPrice <= 0) {
      errors.push(`${productLabel}: Cena brutto musi być większa od 0`)
    } else {
      checkPrecision(product.grossPrice, 8, `${productLabel} - Cena brutto (P_9B)`)
      if (hasInvalidSeparators(product.grossPrice)) {
        errors.push(
          `${productLabel}: Cena brutto zawiera nieprawidłowe separatory (użyj kropki)`,
        )
      }
    }

    // Net price validation (max 8 decimals)
    if (product.netPrice > 0) {
      checkPrecision(product.netPrice, 8, `${productLabel} - Cena netto (P_9A)`)
    }

    // Total gross validation (P_11A - max 2 decimals)
    if (product.totalGross > 0) {
      checkPrecision(product.totalGross, 2, `${productLabel} - Wartość brutto (P_11A)`)
    }

    // Total net validation (P_11 - max 2 decimals)
    if (product.totalNet > 0) {
      checkPrecision(product.totalNet, 2, `${productLabel} - Wartość netto (P_11)`)
    }

    // VAT rate validation
    if (![0, 3, 4, 5, 7, 8, 22, 23].includes(product.vat)) {
      errors.push(`${productLabel}: Nieprawidłowa stawka VAT (${product.vat}%)`)
    }

    // Accumulate totals for sum validation
    calculatedTotalGross = Big(calculatedTotalGross).plus(product.totalGross).toNumber()
    if (!calculatedVatSummary[product.vat]) {
      calculatedVatSummary[product.vat] = { net: 0, vat: 0, gross: 0 }
    }
    calculatedVatSummary[product.vat].net = Big(calculatedVatSummary[product.vat].net)
      .plus(product.totalNet)
      .toNumber()

    calculatedVatSummary[product.vat].vat = Big(calculatedVatSummary[product.vat].vat)
      .plus(Big(product.totalGross).minus(product.totalNet))
      .toNumber()

    calculatedVatSummary[product.vat].gross = Big(calculatedVatSummary[product.vat].gross)
      .plus(product.totalGross)
      .toNumber()
  })

  // ===== WALIDACJA SUM KONTROLNYCH (KRYTYCZNE) =====
  // KSeF rejects invoices with incorrect totals
  const tolerance = 0.02 // 2 grosze tolerancji na zaokrąglenia

  // Validate P_15 (total gross) matches sum of products
  const totalGrossFromProducts = checkedProducts.reduce((sum, p) => sum + p.totalGross, 0)
  if (Math.abs(totalGrossFromProducts - calculatedTotalGross) > tolerance) {
    errors.push(
      `Błąd sumy kontrolnej: Suma brutto produktów (${totalGrossFromProducts.toFixed(2)}) nie zgadza się z obliczoną sumą (${calculatedTotalGross.toFixed(2)})`,
    )
  }

  // Validate VAT summary totals
  Object.entries(calculatedVatSummary).forEach(([rate, totals]) => {
    const netSum = totals.net
    const vatSum = totals.vat
    const grossSum = totals.gross

    // Check if gross = net + vat
    if (Math.abs(grossSum - (netSum + vatSum)) > tolerance) {
      errors.push(
        `Błąd sumy kontrolnej VAT ${rate}%: Brutto (${grossSum.toFixed(2)}) ≠ Netto (${netSum.toFixed(2)}) + VAT (${vatSum.toFixed(2)})`,
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

  // ===== WALIDACJA FORMATU PŁATNOŚCI =====
  if (!['Przelew', 'Gotówka'].includes(invoiceData.paymentType)) {
    errors.push(`Nieprawidłowa forma płatności: ${invoiceData.paymentType}`)
  }

  return { isValid: errors.length === 0, errors, warnings }
}
