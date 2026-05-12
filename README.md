# Banking API

An Express + MongoDB backend for user authentication, account management, and ledger-based money transfers. The app uses Redis-backed sessions, immutable ledger entries, and email notifications to support a simple banking workflow with audit-friendly transaction tracking.

## What This Project Does

This project provides a REST API for:

- registering and authenticating users
- creating and viewing bank accounts
- checking account balances
- creating money transfers between accounts
- minting initial funds through a system-only workflow
- sending email notifications for registration, login, and transaction events

The design stores account balances indirectly through a ledger instead of updating a balance field directly. That makes the transaction history easier to audit and reason about.

## Main Purpose And Goals

- Provide a backend foundation for a banking-style application
- Keep transactions atomic and traceable
- Protect user sessions with server-side session storage
- Prevent duplicate transfers with idempotency keys
- Separate business logic, routing, persistence, and side effects into clear layers

## Key Features

- Session-based authentication using Express sessions and Redis
- MongoDB persistence with Mongoose models
- Password hashing with bcryptjs
- Transfer processing with MongoDB transactions
- Append-only ledger entries for debits and credits
- Role-based access for system-only money minting
- HTML email notifications through Nodemailer

## Project Structure

```text
server.js
src/
  app.js
  config/
    db.js
    session.js
  controllers/
    auth.controller.js
    account.controller.js
    transaction.controller.js
  middleware/
    auth.middleware.js
  models/
    account.model.js
    ledger.model.js
    transaction.model.js
    user.model.js
  routes/
    auth.routes.js
    account.routes.js
    transaction.routes.js
  services/
    email.service.js
  util/
    ApiResponse.js
    AppError.js
    asyncHandler.js
```

### Directory Overview

- `src/config` holds infrastructure setup for MongoDB and Redis/session management.
- `src/controllers` contains the request handlers and business logic.
- `src/middleware` contains request guards such as session verification.
- `src/models` defines the MongoDB schemas and model methods.
- `src/routes` maps HTTP endpoints to controller functions.
- `src/services` contains external integrations like email delivery.
- `src/util` contains shared helpers for errors, responses, and async controller wrapping.

## Main Files

### `server.js`

Application entry point. Imports the Express app and starts the HTTP server on `PORT` or `4000`.

### `src/app.js`

Bootstraps the application:

- loads environment variables
- connects to MongoDB
- connects to Redis
- installs middleware
- exposes the `/health` endpoint
- mounts the API routes

### `src/config/db.js`

Connects to MongoDB using the `mongoDb` environment variable.

### `src/config/session.js`

Configures Express sessions with Redis as the session store and defines cookie options.

### `src/middleware/auth.middleware.js`

Verifies the current session, loads the user from MongoDB, and attaches it to `req.user` for protected routes.

### `src/controllers/auth.controller.js`

Handles registration, login, logout, and current-user lookup.

### `src/controllers/account.controller.js`

Handles account creation, listing a user’s accounts, and balance lookup.

### `src/controllers/transaction.controller.js`

Handles normal transfers and system-only initial-funds transactions.

### `src/models/user.model.js`

Defines the user schema, password hashing hook, and password validation helper.

### `src/models/account.model.js`

Defines the account schema and the `getBalance()` helper that aggregates ledger entries.

### `src/models/ledger.model.js`

Defines immutable ledger entries and blocks updates/deletes so accounting records stay append-only.

### `src/models/transaction.model.js`

Stores transfer metadata, status, and idempotency keys.

### `src/services/email.service.js`

Sends registration, login, transaction success, and transaction failure emails.

## Technical Details

### Languages And Frameworks

- JavaScript
- Node.js
- Express 5
- MongoDB with Mongoose
- Redis for session storage

### Key Dependencies

- `express` for the HTTP server
- `mongoose` for database modeling and transactions
- `express-session` and `connect-redis` for session handling
- `redis` for session storage
- `bcryptjs` for password hashing
- `helmet`, `cors`, `cookie-parser`, and `morgan` for middleware support
- `nodemailer` and `resend` for email delivery workflows
- `dotenv` for environment configuration

### Architecture And Patterns

- Route-controller-service layering
- Session-based authentication
- Custom error and response classes
- Async controller wrapper for centralized error propagation
- MongoDB transactional workflow for money movement
- Immutable ledger pattern for auditability
- Idempotency key handling to prevent duplicate transactions

### How Components Work Together

1. `server.js` starts the app.
2. `src/app.js` connects to MongoDB and Redis, then mounts middleware and routes.
3. Protected routes call `verifySession`, which loads the authenticated user into `req.user`.
4. Controllers validate input, read and write models, and trigger emails when needed.
5. Account balances are computed from ledger records instead of being stored directly.

## Important Functions And Workflows

### Authentication Flow

- `registerUser` creates a user, hashes the password through the model hook, and sends a welcome email.
- `loginUser` checks credentials, stores the user ID in the session, and sends a login alert email.
- `logoutUser` destroys the session and clears the session cookie.
- `getCurrentUser` returns the authenticated user attached by middleware.

### Account Flow

- `createAccount` creates a new account for the logged-in user.
- `getUserAccounts` lists all accounts owned by the logged-in user.
- `getAccountBalance` loads the account and derives the balance from the ledger.

### Transfer Flow

- `createTransaction` validates both accounts, checks idempotency, verifies account status, checks balance, and then writes the transaction and ledger rows inside a MongoDB session.
- `createInitialFundsTransaction` is restricted to the `SYSTEM` role and uses the same transactional pattern to mint funds.

### Data Integrity Helpers

- `Account.getBalance()` aggregates ledger debits and credits to compute the current balance.
- `ledgerSchema` hooks block modifications after creation.
- `asyncHandler` forwards controller errors to Express error handling.

## Available Scripts

- `npm run dev` starts the server with Nodemon.
- `npm run format` formats the project with Prettier.
- `npm run send:resend` runs the email service test command.

## Environment Variables

The application expects values such as:

- `PORT`
- `NODE_ENV`
- `mongoDb`
- `REDIS_URL`
- `SESSION_SECRET`
- `corsOrigin`
- `EMAIL_USER`
- `EMAIL_FROM`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `REFRESH_TOKEN`

## API Surface

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/current-user`

### Accounts

- `POST /api/v1/accounts`
- `GET /api/v1/accounts`
- `GET /api/v1/accounts/balance/:accountId`

### Transactions

- `POST /api/v1/transactions`
- `POST /api/v1/transactions/system/initial-funds`

## Health Check

- `GET /health`

Returns a simple JSON response indicating that the server is healthy.

## Notes

- The app is clearly structured as a backend API, not a frontend application.
- Transaction emails are sent after the database work completes, and failures in email delivery do not block the successful transaction response.
- There is no visible centralized error-handling middleware in the inspected source tree, so the app likely relies on external setup or an omitted file for final error serialization.