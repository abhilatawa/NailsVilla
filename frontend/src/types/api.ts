export interface ApiError {
  timestamp: string
  status: number
  code: string
  message: string
  path: string
  traceId: string
}

export class ApiRequestError extends Error {
  readonly apiError: ApiError

  constructor(apiError: ApiError) {
    super(apiError.message)
    this.name = 'ApiRequestError'
    this.apiError = apiError
  }
}
