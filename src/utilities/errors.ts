export class AppError extends Error {
  code: string
  status: number

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message)
    this.code = options?.code ?? 'APP_ERROR'
    this.name = 'AppError'
    this.status = options?.status ?? 500
  }
}

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return 'An unknown error occurred.'
}
