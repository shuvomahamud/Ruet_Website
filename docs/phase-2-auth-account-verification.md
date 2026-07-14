# Phase 2 Authentication And Account Verification

Date: 2026-07-13

## Outcome

Remaining-roadmap Phase 2 is complete. Tasks `C-01`, `C-02`, `C-03`, and `C-04` are implemented in the application and marked `Completed`.

## Implemented Scope

| Area                     | Delivered behavior                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local authentication     | Public signup and login, Payload HttpOnly sessions, sign-out, verification, resend verification, forgot/reset password, strong-password enforcement, lockout, and non-enumerating recovery responses                                        |
| Google authentication    | Authorization Code flow with PKCE, HMAC-signed expiring state, nonce and ID-token validation, safe return paths, opaque revocable sessions stored as SHA-256 hashes, and a disabled UI state when credentials are absent                    |
| Account linking          | Existing email addresses are never auto-linked from an unauthenticated Google callback. A signed-in member must explicitly link a Google identity with the same verified email. A Google subject already owned by another user is rejected. |
| Profile settings         | Protected settings route, server-side update allowlist, active primary-chapter validation, alumni/professional fields, communication preferences, and derived profile-completion status                                                     |
| Account status           | Suspended and deleted users are rejected by local login, session refresh/me hooks, custom Google sessions, access helpers, and protected routes                                                                                             |
| Account deletion         | Password confirmation where applicable, transactional in-place anonymization, local and Google session revocation, removal of direct self hard-deletion, stable user IDs for related records, and append-only audit logging                 |
| Abuse and browser safety | Per-IP/account rate limits for signup, recovery, verification, Google start, and deletion; same-site secure-cookie configuration; CORS/CSRF origins; safe redirects; validation and accessible form states                                  |

## Data And Migration

Forward migration `20260714_035618` adds:

- user authentication methods, Google subject, profile status, consent timestamps, deletion timestamp, and anonymized reference
- Payload email-verification fields
- private `oauthSessions` records with unique token hashes, expiry, revocation, and user relationship
- a one-time backfill that marks pre-existing users verified and records password as their existing auth method so the original administrator is not locked out

All five repository migrations are applied locally. Generated Payload types match the Phase 2 schema.

## Security And Data-Preservation Evidence

Automated integration coverage verifies:

- public creation cannot request an elevated role or suspended status
- login is blocked until email verification
- weak reset passwords are rejected and reset tokens work once with a strong password
- self profile updates cannot alter email or elevated role fields
- unauthenticated duplicate Google email identities require explicit linking
- explicit linking requires an exact verified-email match
- opaque Google sessions authenticate, revoke, and stop working for inactive users
- direct self hard-deletion is denied
- anonymization removes personal/auth data and login access while order/payment relationships keep the same user ID
- the anonymization audit event remains available

## Verification Results

| Gate                          | Result                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                   | Passed without warnings; generated migration callback arguments are excluded from unused-variable linting          |
| `pnpm typecheck`              | Passed                                                                                                             |
| `pnpm test:int`               | Passed: `5` files, `21` tests                                                                                      |
| `pnpm build`                  | Passed; all account routes compiled                                                                                |
| `pnpm test:e2e`               | Passed: `8` Chromium tests, including signup → verification → login → profile update → logout → protected redirect |
| `pnpm payload migrate:status` | Passed: `5` migrations applied                                                                                     |
| Migration schema diff         | Passed: Payload reported no schema changes after `20260714_035618`                                                 |
| `git diff --check`            | Passed                                                                                                             |

The browser lifecycle test also covers form labels, visible success/error states, protected redirects, and the explanatory disabled Google state when local credentials are absent. Responsive account layouts use the shared `860px` and `640px` breakpoints.

## External Production Verification Inputs

These are already assigned in the roadmap and do not represent omitted Phase 2 application work:

- Google OAuth client ID/secret and approved production callback URL
- production email provider credentials and verified sender/domain, owned by Phase 5
- distributed/edge rate-limit verification, owned by final security hardening in Phase 11; the current in-process limiter protects a single application instance

Until the credentials are installed, local Google UI remains deliberately disabled and Payload writes email attempts to the development console. Integration tests cover Google identity resolution, safe linking, and session behavior without transmitting test identities to an external provider.
