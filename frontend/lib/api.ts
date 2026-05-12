declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Backend health check failed.')
    }

    return response.json()
  } catch (error) {
    throw new Error(getFetchErrorMessage(error))
  }
}

function getFetchErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return `Unable to reach the backend at ${API_URL}. Make sure the FastAPI server is running.`
  }
  return error instanceof Error ? error.message : 'Request failed.'
}

type AuthPayload = {
  email: string
  password: string
}

export async function loginUser(payload: AuthPayload) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.detail || 'Login failed.')
    }

    return data
  } catch (error) {
    throw new Error(getFetchErrorMessage(error))
  }
}

export async function registerUser(payload: AuthPayload) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.detail || 'Registration failed.')
    }

    return data
  } catch (error) {
    throw new Error(getFetchErrorMessage(error))
  }
}

export async function predictImage(file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(error?.detail || 'Prediction request failed.')
    }

    return response.json()
  } catch (error) {
    throw new Error(getFetchErrorMessage(error))
  }
}

export async function searchNearby(location: {
  address?: string
  latitude?: number
  longitude?: number
}) {
  try {
    const response = await fetch(`${API_URL}/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(error?.detail || 'Nearby search request failed.')
    }

    return response.json()
  } catch (error) {
    throw new Error(getFetchErrorMessage(error))
  }
}

export async function downloadReport(payload: {
  file: File
  class_name: string
  confidence: number
  probabilities: number[]
  advice: string
}) {
  try {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('class_name', payload.class_name)
    formData.append('confidence', payload.confidence.toString())
    formData.append('probabilities', JSON.stringify(payload.probabilities))
    formData.append('advice', payload.advice)

    const response = await fetch(`${API_URL}/report`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(error?.detail || 'Report generation failed.')
    }

    return response.blob()
  } catch (error) {
    throw new Error(getFetchErrorMessage(error))
  }
}
