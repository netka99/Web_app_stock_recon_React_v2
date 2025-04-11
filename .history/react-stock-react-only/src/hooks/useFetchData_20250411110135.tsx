import { useEffect, Dispatch, SetStateAction } from 'react'
import { fetchData as fetchAPI } from '../api/fetchAPI'

const useFetchData = <T>(
  url: string,
  setData: Dispatch<SetStateAction<T>>,
  showMessage: (message: string, duration?: number) => void
): void => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchData(url)
        setData(data)
        showMessage('')
        return data
      } catch (error) {
        console.error('Error fetching data:', error)
        showMessage('Problem z pobraniem danych!', 6000)
      }
    }
    fetchData()
  }, [url, setData, showMessage])
}

export default useFetchData
