import { create } from 'xmlbuilder2'

export function generateFA3Invoice(invoiceData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('Faktura', {
    xmlns: 'http://crd.gov.pl/wzor/2023/06/29/12648/',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  })

  const naglowek = root.ele('Naglowek')
  naglowek
    .ele('KodFormularza', {
      kodSystemowy: 'FA(3)',
      wersjaSchemy: '1-0E',
    })
    .txt('FA')
  naglowek.ele('WariantFormularza').txt('3')
  naglowek.ele('DataWytworzeniaFa').txt(new Date().toISOString())
  naglowek.ele('SystemInfo').txt('Stock Recon App v1.0')

  const podmiot1 = root.ele('Podmiot1')
  const daneSprzedawcy = podmiot1.ele('DaneIdentyfikacyjne')
  daneSprzedawcy.ele('NIP').txt('8442120248')
  daneSprzedawcy.ele('Nazwa').txt('SMACZNY KĄSEK -catering-Ewelina Radoń')

  const adresSprzedawcy = podmiot1.ele('Adres')
  adresSprzedawcy.ele('KodKraju').txt('PL')
  adresSprzedawcy.ele('AdresL1').txt('ul. Sejneńska 21/1')
  adresSprzedawcy.ele('AdresL2').txt('16-400 Suwałki')

  const podmiot2 = root.ele('Podmiot2')
  const daneNabywcy = podmiot2.ele('DaneIdentyfikacyjne')

  daneNabywcy.ele('NIP').txt(invoiceData.buyerNIP || '1234567890')
  daneNabywcy.ele('Nazwa').txt(invoiceData.shopName)

  const adresNabywcy = podmiot2.ele('Adres')
  adresNabywcy.ele('KodKraju').txt('PL')
  const addressLines = invoiceData.address.split('\n')
  adresNabywcy.ele('AdresL1').txt(addressLines[0] || '')
  adresNabywcy.ele('AdresL2').txt(addressLines[1] || '')
  adresNabywcy.ele('AdresL3').txt(addressLines[2] || '')
}
