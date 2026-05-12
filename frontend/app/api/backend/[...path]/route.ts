import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const DEFAULT_RENDER_API_URL = 'https://skin-burn-detection-gdy1.onrender.com'

function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_RENDER_API_URL).replace(/\/+$/, '')
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path = [] } = await context.params
  const backendPath = path.join('/')
  const targetUrl = new URL(`${getBackendBaseUrl()}/${backendPath}`)

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value)
  })

  const headers = new Headers(request.headers)
  headers.delete('host')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
    redirect: 'follow',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('transfer-encoding')

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
