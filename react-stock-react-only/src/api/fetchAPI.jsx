// Function to fetch data from the API
export const fetchData = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error(
      `Error fetching prices: ${error.message}`,
    )
  }
}

// Function to update data on the API
export const updateDataOnApi = async (
  updatedPrices,
  url,
) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPrices),
    })
    if (!response.ok) {
      throw new Error('Failed to update data on API')
    }
    const data = await response.json()
    console.log('Sent:', data)
    return { status: response.status, data: data }
  } catch (error) {
    throw new Error(`Error updating data: ${error.message}`)
  }
}
