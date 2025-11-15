# TypeSpeed - Custom Typing Test Application

## Overview

TypeSpeed is a minimalist typing test application inspired by Monkeytype. It allows users to test their typing speed and accuracy using custom text content. Users can upload their own text files, paste content directly, or import from Google Drive. The application tracks performance metrics (WPM, accuracy) and maintains a global leaderboard for competitive typing.

The application features a clean, distraction-free interface with a pure black background and monospace typography, designed to keep users focused on the typing experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight routing library. Routes include:
- Home (`/`) - Username entry and navigation
- Typing Test (`/test`) - Main typing interface
- Upload (`/upload`) - Content upload/import interface
- Results (`/results`) - Post-test statistics display
- Leaderboard (`/leaderboard`) - Global rankings

**State Management**: React hooks for local component state, with TanStack Query (React Query) for server state management and caching. Session storage is used for persisting username across navigation.

**UI Components**: Extensive use of Radix UI primitives wrapped in custom components (shadcn/ui pattern), providing accessible and composable UI elements. Components follow a "New York" style variant with dark mode as default.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The design system uses a minimalist black/white color scheme with subtle grays and accent colors (green for correct, red for errors). Typography uses JetBrains Mono for monospace content and Inter for UI elements.

**Data Visualization**: Recharts library for displaying performance metrics and statistics on the results page.

### Backend Architecture

**Server Framework**: Express.js running on Node.js, configured as ES modules.

**API Design**: RESTful API with endpoints for:
- Content management (`POST /api/content/upload`, `GET /api/content/random`, `GET /api/content`)
- Google Drive integration (`POST /api/content/import-drive`)
- Leaderboard operations (`POST /api/sessions/submit`, `GET /api/leaderboard`)

**File Upload**: Multer middleware for handling multipart/form-data file uploads, storing files in memory before processing.

**Development Setup**: Vite middleware integration in development mode for hot module replacement and seamless frontend/backend development experience. Custom error logging and request/response tracking middleware.

### Database Architecture

**ORM**: Drizzle ORM for type-safe database operations and schema management.

**Database**: PostgreSQL via Neon serverless platform, configured with WebSocket support for serverless environments.

**Schema Design**: Two primary tables:
- `uploaded_content` - Stores text content with metadata (title, source type, word/character counts)
- `leaderboard_entries` - Records typing test results with performance metrics (WPM, accuracy, error counts, timestamps)

**Data Validation**: Zod schemas derived from Drizzle table definitions for runtime validation of API inputs.

**Connection Management**: Connection pooling via `@neondatabase/serverless` with WebSocket constructor for Replit environment compatibility.

### External Dependencies

**Google Drive Integration**: OAuth-based connection using the Google Drive API v3. Access tokens are managed through Replit's connector infrastructure with automatic token refresh. Users can import `.txt` files directly from their Google Drive.

**Replit Services**: 
- Connectors API for Google Drive OAuth flow
- Development tools (vite-plugin-cartographer, vite-plugin-dev-banner, vite-plugin-runtime-error-modal) for enhanced development experience
- Identity and renewal tokens for authentication with Replit services

**Third-Party UI Libraries**: 
- Radix UI for accessible component primitives
- Recharts for data visualization
- Lucide React for iconography
- date-fns for date formatting

**Development Dependencies**:
- TypeScript for type safety
- ESBuild for production builds
- Drizzle Kit for database migrations
- PostCSS and Autoprefixer for CSS processing

### Key Architectural Decisions

**Monorepo Structure**: Client, server, and shared code organized in separate directories with path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`).

**Type Sharing**: Database schemas and types defined in `shared/schema.ts` are used by both frontend and backend, ensuring type consistency across the stack.

**Session Management**: Lightweight session handling using sessionStorage on the client side rather than server-side sessions, reducing backend complexity for this use case.

**Responsive Design**: Mobile-first approach with breakpoint-based layouts, though the application is optimized primarily for desktop typing experiences.

**Performance Optimization**: React Query handles caching and background refetching, while Vite provides optimized bundling and code splitting. Static assets are served efficiently in production.