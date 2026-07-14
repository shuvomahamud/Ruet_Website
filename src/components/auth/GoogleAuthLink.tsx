export const GoogleAuthLink = ({
  enabled,
  label = 'Continue with Google',
  mode,
}: {
  enabled: boolean
  label?: string
  mode?: 'link'
}) => {
  const href = `/api/auth/google/start${mode ? '?mode=link&returnTo=/account/settings' : ''}`

  return enabled ? (
    <a className="button button--secondary auth-button" href={href}>
      {label}
    </a>
  ) : (
    <div>
      <button className="button button--secondary auth-button" disabled type="button">
        {label}
      </button>
      <p className="form-help">Google sign-in will appear when its credentials are configured.</p>
    </div>
  )
}
