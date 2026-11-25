# Reusable Collection Authentication API

A Node.js, Express, and MongoDB authentication backend for projects that need email signup, OTP verification, login, password reset, and cookie-based sessions.

It uses JWTs stored in HTTP-only cookies, bcrypt password hashing, MongoDB through Mongoose, and Brevo for transactional OTP emails.

## Features

- Username and email signup
- Email OTP verification
- Password login
- HTTP-only JWT cookie sessions
- Session validation with `GET /api/auth/me`
- Protected users list
- Forgot-password OTP flow
- Password reset and logout
- Zod input validation, Helmet security headers, and CORS support

## Requirements

- Node.js 20 or later
- npm
- MongoDB database or MongoDB Atlas cluster
- Brevo account and API key for OTP email delivery

## Installation

1. Clone this repository and open the backend folder:

   ```bash
   git clone <your-backend-repository-url>
   cd signupLogin
   ```

2. Install all project dependencies:

   ```bash
   npm install
   ```

   This installs Express, Mongoose, bcrypt, JSON Web Token, Zod, Brevo, CORS, Helmet, cookie-parser, dotenv, and the other packages listed in `package.json`.

3. Create a `.env` file in the project root. Copy `.env.example` as a starting point, then use your own values:

   ```env
   JWT_SECRET=replace-with-a-long-random-secret
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   BREVO_API_KEY=your-brevo-api-key
   BREVO_SENDER_EMAIL=verified-sender@example.com
   BREVO_SENDER_NAME=Reusable Collection
   NODE_ENV=development
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

   Or run it without Nodemon:

   ```bash
   npm start
   ```

5. The API starts at:

   ```text
   http://localhost:3000
   ```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Signs and validates session tokens. Use a long, private random value. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `BREVO_API_KEY` | Yes | Sends OTP emails through Brevo. |
| `BREVO_SENDER_EMAIL` | Yes | A sender address verified in Brevo. |
| `BREVO_SENDER_NAME` | Yes | Name shown in the OTP email. |
| `NODE_ENV` | Yes | Use `development` locally and `production` when deployed. |

Never commit `.env`. It is already excluded by `.gitignore`.

## API routes

Base path: `http://localhost:3000/api/auth`

| Method | Route | Body | Purpose |
| --- | --- | --- | --- |
| `POST` | `/signup` | `username`, `email`, `password` | Creates an unverified user and sends an OTP. |
| `POST` | `/verify` | `otp` | Verifies the signed-in user’s OTP. Requires the session cookie. |
| `POST` | `/resend-otp` | None | Sends another signup OTP for the signed-in user. |
| `POST` | `/login` | `username` or `email`, `password` | Starts a session for a verified user. |
| `POST` | `/sentOTP` | `email` | Sends a password-reset OTP. |
| `POST` | `/forgot-password` | `email`, `otp`, `newPassword` | Resets a password with a valid OTP. |
| `POST` | `/logout` | None | Clears the session cookie. |
| `GET` | `/me` | None | Checks the current session. Requires the session cookie. |
| `GET` | `/users` | None | Returns user IDs, usernames, emails, and creation dates. Requires the session cookie. |

### Signup example

```json
{
  "username": "jane",
  "email": "jane@example.com",
  "password": "a-secure-password"
}
```

### Cookie-based authentication

The API stores the JWT in an HTTP-only `token` cookie. A browser frontend must send requests with credentials enabled:

```js
axios.get("http://localhost:3000/api/auth/me", {
  withCredentials: true
});
```

The frontend origin must also be listed in the CORS configuration in `src/app.js`. The current local setup permits `http://localhost:5173`.

## Database model

Each user has a unique `username` and `email`, a bcrypt password hash, verification status, OTP data, a token version, and automatic `createdAt`/`updatedAt` timestamps.

## Project structure

```text
signupLogin/
├── server.js
├── .env.example
└── src/
    ├── app.js
    ├── controllers/auth.controller.js
    ├── db/
    │   ├── db.js
    │   └── models/userModel.js
    ├── middlewares/auth.middleware.js
    ├── routes/auth.routes.js
    └── utils/sendOtp.js
```

## Open-source use and contributions

You may use this authentication starter in your own learning and projects. Before publishing a fork, add a license file that matches how you want others to reuse it.

Issues and pull requests are welcome. Please do not include `.env` files, API keys, database credentials, or real user data in commits.

## Roadmap

I will continue improving this authentication system whenever I have free time, with the goal of making useful updates frequently rather than waiting for monthly releases.
