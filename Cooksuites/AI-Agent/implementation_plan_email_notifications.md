# Implementation Plan: Event-Based Email Notifications

This document outlines the architectural approach and steps to implement event-based email notifications for User Registration, Login, and Recipe Creation, while refactoring the existing Nodemailer setup into a robust Service layer.

## Proposed Changes

### 1. Centralized Email Service (`src/services/EmailService.ts`)
We will create a dedicated `EmailService` class to handle all email interactions. This abstracts the Nodemailer configuration and keeps the API controllers clean.

- **Transporter Configuration**: Will be initialized once and reused. It will support both Ethereal (for dev testing) and standard SMTP, similar to the existing implementation.
- **Template System**:
  - `getBaseTemplate(content: string, title: string)`: Wraps the body content with standard Cooksuites branding, header, and footer.
- **Service Methods**:
  - `sendPasswordResetEmail(email, token)` (Migrated from `mailer.ts`)
  - `sendWelcomeEmail(email, userName)`: Triggered on Registration.
  - `sendLoginAlert(email, ip, userAgent)`: Triggered on Login.
  - `sendRecipeCreatedEmail(email, recipeTitle, recipeId)`: Triggered on Recipe Creation.

> [!NOTE]
> `mailer.ts` will be deprecated and safely deleted after the migration to `EmailService.ts`.

### 2. Controller Hooks (Non-Blocking)
We will invoke the `EmailService` methods asynchronously in the controllers without `await`ing them directly in the main response flow (fire-and-forget), preventing any delay to the API response times.

#### `src/controllers/AuthController.ts`
- **[MODIFY] `register`**: Trigger `emailService.sendWelcomeEmail` upon successful user creation.
- **[MODIFY] `login`**: Trigger `emailService.sendLoginAlert` upon successful authentication. (We can extract basic IP/Device info from Express `req.ip` and `req.headers['user-agent']`).
- **[MODIFY] `forgotPassword`**: Update to use `emailService.sendPasswordResetEmail`.

#### `src/controllers/RecipeController.ts`
- **[MODIFY] `createRecipe`**: Trigger `emailService.sendRecipeCreatedEmail` after saving the recipe successfully.

## Open Questions

> [!IMPORTANT]
> 1. Do you want to include any specific Cooksuites logos or brand colors (e.g., `#10b981` Emerald) in the HTML template header/footer?
> 2. Is firing the emails synchronously in the background (fire-and-forget `promise.catch()`) sufficient for now, or would you prefer a simple in-memory queue to prevent unhandled promise rejections crashing the Node process in edge cases?

## Verification Plan

### Automated / Manual Verification
1. Register a new user -> Verify Welcome email arrives via Ethereal/SMTP.
2. Login with the user -> Verify Login Alert email arrives (includes IP/UserAgent).
3. Create a Recipe -> Verify Recipe Created email arrives containing the recipe name.
4. Verify the Forgot Password flow remains fully functional using the refactored service.
5. Verify that API response times (e.g. for login) remain fast because the email is sent asynchronously.
