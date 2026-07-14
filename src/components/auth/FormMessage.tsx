export const FormMessage = ({
  message,
  success = false,
}: {
  message?: string
  success?: boolean
}) =>
  message ? (
    <p aria-live="polite" className={`form-message ${success ? 'form-message--success' : ''}`}>
      {message}
    </p>
  ) : null
