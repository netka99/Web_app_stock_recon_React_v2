import { create } from 'xmlbuilder2'

export function generateFA3Invoice(invoiceData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('Faktura', {
    xmlns: 'http://crd.gov.pl/wzor/2023/06/29/12648/',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  })
}
