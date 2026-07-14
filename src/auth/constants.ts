export const GOOGLE_SESSION_COOKIE = 'ruet-google-session'
export const GOOGLE_STATE_COOKIE = 'ruet-google-oauth-state'
export const GOOGLE_SESSION_DAYS = 7
export const OAUTH_STATE_MINUTES = 10

export const isSecureCookie = process.env.NODE_ENV === 'production'
