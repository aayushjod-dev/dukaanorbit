# Security Policy & Production Readiness

## Supported Versions
This project receives security updates on the main branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Dukaan Orbit, please follow responsible disclosure practices:

1. **Do not create a public GitHub issue.** Public issues expose the vulnerability before a patch is ready.
2. Please contact the security team or repository maintainers directly with details of the vulnerability, reproduction steps, and potential impact.
3. Allow up to 48 hours for acknowledgment of your report.
4. We will coordinate with you on verifying the issue and releasing a security patch before publishing any details.

---

## Production Security Principles & Compliance

Dukaan Orbit strictly adheres to standard retail and banking security rules:

1. **No Sensitive Payment Credentials**:
   - The application **never** asks for, receives, or stores UPI PINs, banking passwords, debit/credit card CVVs, or SMS OTPs.
   - All UPI payments use standard NPCI-compliant intent URIs (`upi://pay`) that hand off payment authentication entirely to the user's secure UPI client (GPay, PhonePe, Paytm, BHIM, etc.).
   - Only the public merchant UPI Virtual Payment Address (VPA) is visible on payment QR codes.

2. **Customer Data Privacy**:
   - No real customer phone numbers, personal addresses, or sensitive billing records are included in the source code or test seeds.
   - All default data uses explicitly synthetic sample accounts (`9999900001`, `Sample Customer`).

3. **Client vs. Server Secrets Separation**:
   - No server secrets, Firebase Admin private keys, database passwords, or Google Cloud service-account files are bundled into client-side JavaScript.
   - Client applications must never reference private secrets via `VITE_`, `NEXT_PUBLIC_`, or `REACT_APP_` prefixes.
   - Server-side routes and Cloud Functions must read credentials through standard `process.env` or encrypted secret managers.

4. **Repository Hygiene**:
   - The `.gitignore` configuration explicitly excludes all `.env*` files (except `.env.example`), `serviceAccount*.json`, `*.pem`, `*.key`, and build artifacts.
   - Only placeholder configurations are documented in `.env.example`.
