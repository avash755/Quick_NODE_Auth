# Quick Node Auth

A reusable **Node.js and Express authentication starter** built with MongoDB, Mongoose, JWT, bcrypt, Zod, secure cookies, and Brevo email OTP verification.

Quick Node Auth helps developers get started with common authentication features without building everything from scratch.

> [!WARNING]
> **Development status:** Some authentication flows still have known issues, including OTP resend, password-reset OTP delivery, login validation, and server startup. Review the [Known Issues](#-known-issues) section before using this project. It is not production-ready in its current state.

## ✨ Features

- User registration with username, email, and password
- Password hashing with bcrypt
- Email verification using OTP
- OTP expiration and verification
- JWT authentication with HTTP-only cookies
- Logout and cookie clearing
- Password-reset functionality using OTP
- Request validation with Zod
- Authentication middleware
- Token version checking for session invalidation
- HTTP security headers with Helmet

> Some features require fixes before they can be used reliably. See [Known Issues](#-known-issues).

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | Backend framework |
| MongoDB | Database |
| Mongoose | Object data modeling |
| JWT | Authentication |
| bcrypt | Password and OTP hashing |
| Zod | Request validation |
| Helmet | HTTP security headers |
| Brevo | Transactional email delivery |

## 📁 Project Structure

```text
Quick_NODE_Auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── db/
│   │   ├── db.js
│   │   └── models/
│   │       └── userModel.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── utils/
│   │   └── sendOtp.js
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## 🚀 Getting Started

### Requirements

- Node.js 20.19.0 or later
- npm
- MongoDB database
- Brevo account with a verified sender
- Git

### 1. Clone the repository

```bash
git clone https://github.com/avash755/Quick_NODE_Auth.git

cd Quick_NODE_Auth
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
JWT_SECRET=your_long_random_secret

MONGO_URI=your_mongodb_connection_string

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Quick Node Auth

NODE_ENV=development
```

**Configuration:**

- `JWT_SECRET` — Secret used to sign JWTs.
- `MONGO_URI` — Your MongoDB connection string.
- `BREVO_API_KEY` — Your Brevo API key.
- `BREVO_SENDER_EMAIL` — Verified sender email in Brevo.
- `BREVO_SENDER_NAME` — Sender display name.
- `NODE_ENV` — Application environment.

Never commit your `.env` file or expose credentials in public repositories.

### 4. Configure MongoDB

You can use a local MongoDB database or [MongoDB Atlas](https://www.mongodb.com/atlas/database).

For Atlas:

1. Create a cluster.
2. Create a database user.
3. Configure network access.
4. Copy your connection string.
5. Add it to `MONGO_URI`.

[MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)

### 5. Configure Brevo

Brevo is used to deliver email verification OTPs.

1. Create a [Brevo account](https://www.brevo.com/).
2. Generate an API key.
3. Register and verify a sender email.
4. Add your credentials to `.env`.

[Brevo API Documentation](https://developers.brevo.com/)

### 6. Run the project

```bash
npm start
```

For development, the project currently uses `npx nodemon`, but `nodemon` is not declared as a dependency. Install it and update the development script before relying on it:

```bash
npm install --save-dev nodemon
```

```json
"dev": "nodemon server.js"
```

Then run:

```bash
npm run dev
```

## 🔗 API Reference

Base route:

```text
/api/auth
```

| Method | Endpoint | Purpose | Current Status |
|---|---|---|---|
| POST | `/signup` | Register a new user | Implemented; review required |
| POST | `/verify` | Verify email OTP | Implemented; review required |
| POST | `/resend-otp` | Resend verification OTP | Needs fixing |
| POST | `/sentOTP` | Request password-reset OTP | Needs redesign |
| POST | `/forgot-password` | Reset password | Needs validation and security fixes |
| POST | `/login` | Authenticate a user | Needs validation fix |
| POST | `/logout` | Clear authentication cookie | Implemented |

### Example: Signup

**POST** `/api/auth/signup`

```json
{
  "username": "demo_user",
  "email": "you@example.com",
  "password": "YourStrongPassword"
}
```

### Example: Verify Email

**POST** `/api/auth/verify`

```json
{
  "otp": "1234567"
}
```

The verification endpoint currently expects the authentication cookie created during signup.

### Example: Login

The current login controller expects both `username` and `email`. This is a known implementation issue and should be replaced with a single identifier field before publishing a stable API contract.

### Example: Logout

**POST** `/api/auth/logout`

No request body is required.

> Check the controller and route implementations for the exact request and response behavior. The API reference describes the current branch, not a guarantee that every endpoint is working.

## 🔒 Security Considerations

Authentication requires careful handling. Before deploying this project:

- Keep secrets and credentials in environment variables.
- Use HTTPS in production.
- Keep authentication cookies `HttpOnly` and configure `Secure` and `SameSite` appropriately.
- Add rate limiting to authentication endpoints.
- Apply OTP attempt limits and resend cooldowns.
- Validate and normalize user input.
- Handle duplicate database records safely.
- Configure CORS with trusted origins.
- Consider CSRF protection for cookie-based authentication.
- Never log passwords, OTPs, JWTs, or API keys.

## ⚠️ Known Issues

The following issues were identified in the current repository and should be addressed before a production release:

1. **OTP resend:** The controller expects `req.user`, but the route does not attach authentication middleware.
2. **Password-reset OTP:** The current route has the same authentication mismatch. Redesign it as a public email-based request.
3. **Login validation:** The controller calls `.trim()` on both username and email. Use a single validated identifier instead.
4. **Password reset:** Add Zod validation, OTP attempt limits, rate limiting, and OTP-purpose checks.
5. **OTP consistency:** The generated OTP has seven digits, while the stored expiry and email message use different durations.
6. **OTP attempts:** Fix the attempt-limit condition and make the limit safe against concurrent requests.
7. **Signup authentication:** Do not treat an unverified signup session as a fully authenticated session.
8. **Database startup:** Await the MongoDB connection before starting the server.
9. **Port configuration:** Use `process.env.PORT || 3000` instead of a hard-coded port.
10. **CORS and rate limiting:** Add appropriate configuration before using the API from a deployed frontend.
11. **Environment example:** Ensure `.env.example` contains placeholders only.
12. **Project metadata:** Clean up the package name, description, entry point, and development scripts.
13. **Testing and license:** Add automated tests, CI, and the actual license file before publishing a stable release.

## 🤝 Contributing

Contributions and suggestions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected functionality.
5. Open a pull request with a clear description.

Please avoid committing credentials, tokens, or personal information.

## ⭐ Support

If this project helps you understand authentication or saves you development time, consider giving it a **star** on GitHub.

Your support helps other developers discover the project and encourages further improvements.

**Repository:** [Quick Node Auth](https://github.com/avash755/Quick_NODE_Auth)

## 📚 Useful Documentation

- [Node.js](https://nodejs.org/docs/latest/api/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/docs/)
- [JSON Web Tokens](https://jwt.io/)
- [Zod](https://zod.dev/)
- [Brevo API](https://developers.brevo.com/)
