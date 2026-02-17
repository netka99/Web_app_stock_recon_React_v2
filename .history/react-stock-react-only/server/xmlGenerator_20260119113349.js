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
  daneSprzedawcy.ele('NIP').txt('???')
  daneSprzedawcy.ele('Nazwa').txt('???')

  const adresSprzedawcy = podmiot1.ele('Adres')
  adresSprzedawcy.ele('KodKraju').txt('PL')
  adresSprzedawcy.ele('AdresL1').txt('ul. Sejneńska 21/1')
  adresSprzedawcy.ele('AdresL2').txt('16-400 Suwałki')
}
