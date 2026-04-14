import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Navbar, Sidebar, Footer } from '../components/index'
import { size } from '../styles/devices'
import {
  getAllInvoices,
  deleteInvoice,
  getInvoicesByStatus,
} from '../utils/invoiceStorage'
import type { InvoiceRecord, KSefStatus } from '../utils/invoiceStorage'

const pageTitle = 'Historia Faktur'

const InvoicesHistoryPage = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [filterStatus, setFilterStatus] = useState<KSefStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadInvoices()
  }, [filterStatus])

  const loadInvoices = () => {
    if (filterStatus === 'all') {
      setInvoices(
        getAllInvoices().sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      )
    } else {
      setInvoices(
        getInvoicesByStatus(filterStatus).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      )
    }
  }

  const handleDelete = (id: string, invoiceNumber: string) => {
    if (confirm(`Czy na pewno chcesz usunąć fakturę ${invoiceNumber}?`)) {
      deleteInvoice(id)
      loadInvoices()
    }
  }

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.buyerNip.includes(searchTerm),
  )

  const getStatusBadge = (status: KSefStatus) => {
    const badges = {
      draft: { label: 'Szkic', color: '#6c757d' },
      sending: { label: 'Wysyłanie', color: '#0dcaf0' },
      sent: { label: 'Wysłana', color: '#0d6efd' },
      accepted: { label: 'Zaakceptowana', color: '#198754' },
      rejected: { label: 'Odrzucona', color: '#dc3545' },
      error: { label: 'Błąd', color: '#fd7e14' },
    }
    return badges[status]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stats = {
    total: invoices.length,
    accepted: invoices.filter((i) => i.ksefStatus === 'accepted').length,
    draft: invoices.filter((i) => i.ksefStatus === 'draft').length,
    error: invoices.filter((i) => i.ksefStatus === 'error' || i.ksefStatus === 'rejected')
      .length,
  }

  return (
    <StyledMain>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <Container>
        <Header>
          <Title>Historia Faktur KSeF</Title>
          <Stats>
            <StatCard>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>Wszystkie</StatLabel>
            </StatCard>
            <StatCard className="success">
              <StatNumber>{stats.accepted}</StatNumber>
              <StatLabel>Zaakceptowane</StatLabel>
            </StatCard>
            <StatCard className="draft">
              <StatNumber>{stats.draft}</StatNumber>
              <StatLabel>Szkice</StatLabel>
            </StatCard>
            <StatCard className="error">
              <StatNumber>{stats.error}</StatNumber>
              <StatLabel>Błędy</StatLabel>
            </StatCard>
          </Stats>
        </Header>

        <Filters>
          <SearchBox>
            <input
              type="text"
              placeholder="Szukaj po numerze, sklepie lub NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButtons>
            <FilterButton
              $active={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
            >
              Wszystkie
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'accepted'}
              onClick={() => setFilterStatus('accepted')}
            >
              Zaakceptowane
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'draft'}
              onClick={() => setFilterStatus('draft')}
            >
              Szkice
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'sent'}
              onClick={() => setFilterStatus('sent')}
            >
              Wysłane
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'error'}
              onClick={() => setFilterStatus('error')}
            >
              Błędy
            </FilterButton>
          </FilterButtons>
        </Filters>

        {filteredInvoices.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📄</EmptyIcon>
            <EmptyText>Brak faktur do wyświetlenia</EmptyText>
          </EmptyState>
        ) : (
          <InvoicesList>
            {filteredInvoices.map((invoice) => {
              const badge = getStatusBadge(invoice.ksefStatus)
              return (
                <InvoiceCard key={invoice.id}>
                  <InvoiceHeader>
                    <InvoiceNumber>{invoice.invoiceNumber}</InvoiceNumber>
                    <StatusBadge color={badge.color}>{badge.label}</StatusBadge>
                  </InvoiceHeader>

                  <InvoiceDetails>
                    <DetailRow>
                      <DetailLabel>Sklep:</DetailLabel>
                      <DetailValue>{invoice.shopName}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>NIP nabywcy:</DetailLabel>
                      <DetailValue>{invoice.buyerNip || '-'}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Data faktury:</DetailLabel>
                      <DetailValue>{invoice.invoiceDate}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Wartość brutto:</DetailLabel>
                      <DetailValue>{invoice.totalGross.toFixed(2)} zł</DetailValue>
                    </DetailRow>
                    {invoice.ksefNumber && (
                      <DetailRow>
                        <DetailLabel>Numer faktury KSeF:</DetailLabel>
                        <DetailValue className="mono">{invoice.ksefNumber}</DetailValue>
                      </DetailRow>
                    )}{' '}
                    {invoice.ksefErrorMessage && (
                      <DetailRow className="error">
                        <DetailLabel>Błąd:</DetailLabel>
                        <DetailValue>{invoice.ksefErrorMessage}</DetailValue>
                      </DetailRow>
                    )}
                    <DetailRow className="meta">
                      <DetailLabel>Utworzono:</DetailLabel>
                      <DetailValue>{formatDate(invoice.createdAt)}</DetailValue>
                    </DetailRow>
                  </InvoiceDetails>

                  <InvoiceActions>
                    {invoice.xmlFileName && (
                      <ActionButton className="info">
                        📄 {invoice.xmlFileName}
                      </ActionButton>
                    )}
                    {invoice.upoFileName && (
                      <ActionButton className="success">
                        ✅ {invoice.upoFileName}
                      </ActionButton>
                    )}
                    <ActionButton
                      className="danger"
                      onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                    >
                      🗑️ Usuń
                    </ActionButton>
                  </InvoiceActions>
                </InvoiceCard>
              )
            })}
          </InvoicesList>
        )}
      </Container>
      <Footer />
    </StyledMain>
  )
}

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  max-width: 100%;
  min-height: 100vh;
`

const Container = styled.div`
  flex-grow: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media screen and (max-width: ${size.tabletS}) {
    padding: 1rem;
  }
`

const Header = styled.div`
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;

  @media screen and (max-width: ${size.tabletS}) {
    font-size: 1.5rem;
  }
`

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media screen and (max-width: ${size.tabletS}) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  border: 2px solid #dee2e6;

  &.success {
    background: #d1e7dd;
    border-color: #198754;
  }

  &.draft {
    background: #e2e3e5;
    border-color: #6c757d;
  }

  &.error {
    background: #f8d7da;
    border-color: #dc3545;
  }
`

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`

const Filters = styled.div`
  margin-bottom: 2rem;
`

const SearchBox = styled.div`
  margin-bottom: 1rem;

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    font-family: 'Lato', sans-serif;

    &:focus {
      outline: none;
      border-color: #8162c6;
    }
  }
`

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${(props) => (props.$active ? '#8162c6' : '#dee2e6')};
  background: ${(props) => (props.$active ? '#8162c6' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#333')};
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? 'bold' : 'normal')};
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? '#653db5' : '#f8f9fa')};
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`

const EmptyText = styled.div`
  font-size: 1.2rem;
  color: #666;
`

const InvoicesList = styled.div`
  display: grid;
  gap: 1rem;
`

const InvoiceCard = styled.div`
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
`

const InvoiceNumber = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`

const StatusBadge = styled.span<{ color: string }>`
  background: ${(props) => props.color};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
`

const InvoiceDetails = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;

  &.error {
    background: #f8d7da;
    padding: 0.5rem;
    border-radius: 5px;
  }

  &.meta {
    font-size: 0.85rem;
    color: #666;
  }

  @media screen and (max-width: ${size.tabletS}) {
    flex-direction: column;
    gap: 0.25rem;
  }
`

const DetailLabel = styled.span`
  font-weight: 600;
  color: #666;
`

const DetailValue = styled.span`
  color: #333;

  &.mono {
    font-family: monospace;
    font-size: 0.9rem;
  }

  @media screen and (max-width: ${size.tabletS}) {
    word-break: break-all;
  }
`

const InvoiceActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
`

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &.info {
    background: #d1ecf1;
    color: #0c5460;
  }

  &.success {
    background: #d1e7dd;
    color: #0f5132;
  }

  &.danger {
    background: #f8d7da;
    color: #842029;
  }
`

export default InvoicesHistoryPage
