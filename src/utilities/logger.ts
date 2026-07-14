type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const write = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const payload = {
    context,
    level,
    message,
    timestamp: new Date().toISOString(),
  }

  const line = JSON.stringify(payload)

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.log(line)
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write('debug', message, context),
  error: (message: string, context?: Record<string, unknown>) => write('error', message, context),
  info: (message: string, context?: Record<string, unknown>) => write('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => write('warn', message, context),
}
