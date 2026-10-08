# Freano — Money Management for Freelancers

Track income and expenses (personal, family, business), with date/time,
source/payee, category, and payment method (Cash, bKash, Nagad, Rocket,
Bank, Card). View a full statement anytime with filters.

## Folder structure

```
freano/
├── prisma/
│   └── schema.prisma          # Database models: User, Category, Transaction
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── categories/route.ts
│   │   │   └── transactions/
│   │   │       ├── route.ts         # GET (list/filter), POST (create)
│   │   │       └── [id]/route.ts    # GET, PATCH, DELETE one transaction
│   │   ├── dashboard/page.tsx       # Summary + recent transactions
│   │   ├── transactions/
│   │   │   ├── page.tsx             # All transactions
│   │   │   └── add/page.tsx         # Add income/expense form
│   │   ├── statement/page.tsx       # Filterable statement view
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── SummaryCard.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── auth.ts
│   └── types/index.ts
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## How to start (step by step)

1. **Install Node.js 18+** if you don't already have it.

2. **Get a PostgreSQL database.** Easiest for starting out: create a free
   database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)
   and copy its connection string. (Or run Postgres locally if you prefer.)

3. **Copy this project into a folder**, then open a terminal there and run:

   ```bash
   npm install
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and paste in your `DATABASE_URL`, and generate a secret:

   ```bash
   openssl rand -base64 32
   ```

   Paste that value into `NEXTAUTH_SECRET`.

   To enable the Contact page email form, create a [Resend](https://resend.com)
   API key, verify your sending domain, and set `RESEND_API_KEY` and
   `CONTACT_FROM_EMAIL` in `.env`. Messages are delivered to
   `mail@almamuncool.com`.

5. **Create the database tables**:

   ```bash
   npx prisma migrate dev --name init
   ```

6. **Run the app**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — register an
   account, then add your first income/expense transaction.

7. **(Optional) Browse your database visually**:

   ```bash
   npx prisma studio
   ```

## What's already built

- Register / log in (NextAuth, credentials + hashed passwords)
- Add income or expense with: amount, source/payee, category, date + time,
  scope (Personal / Family / Business), payment method, note
- Dashboard with total income, total expense, balance, and recent activity
- Full transaction list
- Statement page with filters (date range, type, scope)
- Default categories auto-created for every new user

## Suggested next steps

- Add category management UI (create/edit custom categories)
- Add charts (Recharts is already installed) — monthly income vs expense,
  spending by category
- Add CSV/PDF export for statements
- Add monthly budget limits per category with alerts
- Once the web app is stable, build the **React Native + Expo** mobile app
  reusing the same `/api/*` routes as the backend
- Add bKash/Nagad merchant API integration if you want to auto-import
  transactions instead of manual entry

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js (credentials provider)
- Recharts (for future charts)
- Zod (input validation)

## Guest mode

Visitors can select **Try as guest** on the landing page or **Continue as guest** on login and registration pages. `/guest` reuses the financial forms and trackers with an isolated, in-memory data adapter. Guests can manage bank accounts and wallets, income and expenses, transfers, bill records, freelance earnings and payouts, loans and repayments, projects and payments, and filtered CSV statements.

Guest financial data never reaches the authenticated APIs or database and is never written to browser storage. It remains available while navigating inside the guest workspace, and clears on refresh, closing the tab/app, leaving the workspace, or selecting **Reset demo**. Browser history restoration starts empty. Creating an account does not import guest records. CSV exports are explicitly downloaded files and remain on the visitor's device.

Run `npm run test:guest` to verify isolation, balance accounting, transfer rollback, payout receipts, repayment limits, and network isolation.
