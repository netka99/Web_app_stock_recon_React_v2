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
    throw new Error(`Error fetching data: ${error.message}`)
  }
}

// Function to update data on the API
// export const updateDataOnApi = async (
//   updatedData,
//   url,
//   method,
// ) => {
//   try {
//     const response = await fetch(url, {
//       method: method,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(updatedData),
//     })
//     if (!response.ok) {
//       throw new Error('Failed to update data on API')
//     }
//     const data = await response.json()
//     console.log('Sent:', data)
//     return { status: response.status, data: data }
//   } catch (error) {
//     console.log('Error updating data:', error)
//     return {
//       status: 500,
//       data: {
//         message: `Error updating data: ${error.message}`,
//       },
//     }
//   }
// }
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
    })

    // Log the status and the response headers for debugging
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    if (!response.ok) {
      throw new Error(
        `Failed to update data on API: ${response.statusText}`,
      )
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
    console.log('Sent:', updatedData)
    console.log('Received:', data)
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
