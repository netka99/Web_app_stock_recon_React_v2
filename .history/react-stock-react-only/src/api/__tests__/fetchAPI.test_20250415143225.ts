import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchData, updateDataOnApi } from '../fetchAPI'

// Mock the global fetch function
global.fetch = vi.fn()

// Mock console methods
const originalConsole = { ...console }
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
}

describe('fetchAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Replace console methods with mocks
    console.error = mockConsole.error
    console.log = mockConsole.log
  })

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsole.error
    console.log = originalConsole.log
  })

  describe('fetchData', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockData),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await fetchData<typeof mockData>('https://api.example.com/data')
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'GET',
      })
    })

    it('should handle fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      await expect(fetchData('https://api.example.com/data')).rejects.toThrow('Not found')
    })
  })

  describe('updateDataOnApi', () => {
    it('should update data successfully', async () => {
      const mockData = { id: 1, name: 'Updated' }
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await updateDataOnApi(
        { id: 1, product: 'Test', shop: 'Shop1', quantity: 10, date: '2024-01-01' },
        'https://api.example.com/data',
        'PUT',
      )

      expect(result.status).toBe(200)
      expect(result.data).toEqual(mockData)
    })

    it('should handle non-JSON responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        json: () => Promise.resolve({}),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await updateDataOnApi(
        { id: 1, product: 'Test', shop: 'Shop1', quantity: 10, date: '2024-01-01' },
        'https://api.example.com/data',
        'PUT',
      )

      expect(result.status).toBe(500)
      expect(result.data).toHaveProperty('message')
    })
  })
})
