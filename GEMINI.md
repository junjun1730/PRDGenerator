# Project: AI PRD Generator

This project is a web application for generating Project Requirements Documents (PRDs) using AI. It guides users through a multi-stage questionnaire to gather information about their project and then presumably uses that information to generate a PRD.

## Key Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom theme.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) for managing the state of the questionnaire.
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) is used for form state and validation.
*   **Validation:** [Zod](https://zod.dev/) is used for schema validation.

## Project Structure

*   `src/app/page.tsx`: The main entry point of the application.
*   `src/components/`: Contains the React components, organized by feature (layout, prd, questionnaire, ui).
*   `src/lib/`: Contains shared logic, including:
    *   `store/useQuestionnaireStore.ts`: The Zustand store for the questionnaire.
    *   `types/questionnaire.ts`: TypeScript types for the questionnaire data.
    *   `validation/questionnaireSchemas.ts`: Zod schemas for validating the questionnaire data.
*   `tailwind.config.ts`: The configuration file for Tailwind CSS, which includes a detailed custom theme.

## Building and Running

### Development

To run the development server:

```bash
npm run dev
```

### Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

### Linting

To run the linter:

```bash
npm run lint
```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS with a custom theme defined in `tailwind.config.ts`. Utility classes are used for styling. The `clsx` and `tailwind-merge` libraries are used for conditional and merged class names.
*   **State Management:** The global state, particularly for the questionnaire, is managed with Zustand. The store is defined in `src/lib/store/useQuestionnaireStore.ts`.
*   **Component-based Architecture:** The application is built with React components, which are organized by feature in the `src/components` directory.
*   **Type Safety:** The project is written in TypeScript, and a strong emphasis is placed on type safety. Type definitions for the questionnaire are located in `src/lib/types/questionnaire.ts`.
