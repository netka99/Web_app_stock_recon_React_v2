// import * as React from 'react';
import basket from '../assets/shopping-basket-solid.svg'
import chart from '../assets/chart-pie-solid.svg'
import summary from '../assets/summary.svg'
import cog from '../assets/cog-solid.svg'
import priceTag from '../assets/price-tag.svg'
import store from '../assets/store-img.svg'
import address from '../assets/address.svg'
import invoice from '../assets/invoice.svg'

export const homeLabels = [
  {
    id: '1',
    url: '/sprzedaz',
    icon: basket,
    title: 'Sprzedaż',
    colors: {
      backgroundprimary: '#ffd3a5',
      backgroundsecondary: '#fd6585',
      hoverprimary: '#ecc499',
      hoversecondary: '#e95c7b',
    },
  },
  {
    id: '2',
    url: '/zestawienie',
    icon: summary,
    title: 'Zestawienie',
    colors: {
      backgroundprimary: '#90f390',
      backgroundsecondary: '#33a715',
      hoverprimary: '#84df84',
      hoversecondary: '#2b8e12',
    },
  },
  {
    id: '3',
    url: '/wykresy',
    icon: chart,
    title: 'Wykresy',
    colors: {
      backgroundprimary: '#ffe985',
      backgroundsecondary: '#fa742b',
      hoverprimary: '#e6d177',
      hoversecondary: '#e16928',
    },
  },
  {
    id: '4',
    url: '/ustawienia',
    icon: cog,
    title: 'Ustawienia',
    colors: {
      backgroundprimary: '#5efce8',
      backgroundsecondary: '#736efe',
      hoverprimary: '#54decb',
      hoversecondary: '#635fde',
    },
  },
  {
    id: '5',
    url: '/faktury',
    icon: invoice,
    title: 'Faktury',
    colors: {
      backgroundprimary: '#ffb3c6',
      backgroundsecondary: '#9b51e0',
      hoverprimary: '#e2a3b7',
      hoversecondary: '#8a46c9',
    },
  },
]

export const settingsLabels = [
  {
    id: '1',
    url: '/sklepy',
    icon: store,
    title: 'Lista Sklepów',
    bcgprimary: '#ff4dff',
    bcgsecondary: '#FAA1A6',
    hoverprimary: '#d241d2',
    hoversecondary: '#d88b8f',
  },
  {
    id: 2,
    url: '/ceny',
    icon: priceTag,
    title: 'Ceny produktów',
    bcgprimary: '#0e06e8',
    bcgsecondary: '#e5fbf9',
    hoverprimary: '#0b05a3',
    hoversecondary: '#c3d5d3',
  },
  {
    id: 3,
    url: '/adresy',
    icon: address,
    title: 'Adresy sklepów',
    bcgprimary: '#2ce806',
    bcgsecondary: '#e5fbf9',
    hoverprimary: '#05a30d',
    hoversecondary: '#c3d5d3',
  },
]
