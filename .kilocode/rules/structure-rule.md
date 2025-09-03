
# Polly App Custom Rules

These rules define conventions for developing the Polly polling application, ensuring consistency with its folder structure, form libraries, and Supabase integration.

## Folder Structure
- All API routes **MUST** be placed in the `/app/api/` directory.
  - Example: Poll-related API routes should be in `/app/api/polls/`.
- Poll-related pages **MUST** be placed in the `/app/polls/` directory.
  - Example: A poll creation page should be in `/app/polls/create.tsx`.
- Reusable UI components **MUST** be placed in the `/components/ui/` directory for shadcn/ui components or `/components/` for custom components.
- Supabase-related utilities **MUST** be placed in the `/lib/supabase/` directory.
  - Example: Database operations should be in `/lib/database.ts`.

## Form Libraries
- Use **react-hook-form** for all form handling in the Polly app.
  - Ensure forms are type-safe with TypeScript interfaces.
  - Example: Define form schemas using `zod` for validation.
- Use **shadcn/ui** components for form UI elements (e.g., Input, Button, Form).
  - Example: Use `<Form>` and `<Input>` from `/components/ui/` for consistent styling.
- Avoid using native HTML `<form>` elements directly; always wrap with shadcn/ui `<Form>` for consistency.

## Supabase Usage
- Use the Supabase client defined in `/lib/supabase/client.ts` for all database and auth operations.
  - Example: Import `supabase` from `/lib/supabase/client.ts` for queries.
- Enforce **Row Level Security (RLS)** for all database operations to protect poll and vote data.
  - Example: Ensure `polls` and `votes` tables are accessed with RLS policies.
- Use Supabase Auth for user authentication (email/password or OAuth).
  - Example: Implement login/signup with `supabase.auth.signInWithPassword` or `supabase.auth.signInWithOAuth`.
- Store poll options as JSON in the `polls` table for flexibility.
  - Example: `{ options: [{ id: 1, text: "Option 1" }, { id: 2, text: "Option 2" }]` }`.

## Code Style
- Use **TypeScript** for all code to ensure type safety.
  - Example: Define interfaces for poll and vote data in `/lib/types.ts`.
- Follow **Tailwind CSS** for styling, using utility classes for responsive design.
  - Example: Apply `sm:`, `md:`, `lg:` prefixes for responsive layouts.
- Include error handling for all API routes and Supabase queries.
  - Example: Use try-catch blocks and return user-friendly error messages.

