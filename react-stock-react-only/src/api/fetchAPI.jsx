// Function to fetch data from the API
export const fetchData = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET', // Or POST, PUT, etc.
      credentials: 'include', // THIS IS THE ONLY CHANGE NEEDED HERE
    })
    if (!response.ok) {
      const errorData = await response.json() // Try to parse error
      throw new Error(
        errorData?.message ||
          `HTTP error! status: ${response.status}`,
      )
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// Function to update data on the API
export const updateDataOnApi = async (
  updatedData,
  url,
  method,
) => {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
      credentials: 'include',
    })
    if (!response.ok) {
      const errorData = await response.json() // Try to parse error
      throw new Error(
        errorData?.message ||
          `Failed to update data on API: ${response.statusText}`,
      )
    }
    if (response.status === 204) {
      // console.log('No content returned')
      return { status: response.status, data: null }
    }
    // Check if the response has content
    const contentType = response.headers.get('Content-Type')
    if (
      !contentType ||
      !contentType.includes('application/json')
    ) {
      throw new Error('Response is not JSON')
    }

    const data = await response.json()
    console.log('Sent:', data)
    return { status: response.status, data: data }
  } catch (error) {
    console.log('Error updating data:', error)
    return {
      status: 500,
      data: {
        message: `Error updating data: ${error.message}`,
      },
    }
  }
}
