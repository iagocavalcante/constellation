# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Constellation is an Instagram-like mobile app built with React Native and Expo, using ATProto and BlueSky as the backend. The app focuses on visual content sharing with photo posts, feed viewing, and social interactions.

## Development Commands

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm test` - Run Jest tests with watch mode
- `npm run lint` - Run Expo linting

## Architecture Overview

### Core State Management
- **Session Management**: Complex session handling via `src/state/session/index.tsx` with ATProto agent management, account switching, and persistent storage
- **Agent System**: Uses ATProto agents (`@atproto/api`) for BlueSky API interactions, with session persistence and automatic token refresh
- **Persisted State**: Multi-tab synchronization and storage management in `src/state/persisted/`

### Key Services
- **BlueSky Service** (`src/services/bsky.service.ts`): Core API interactions including post creation, timeline fetching, image handling, and social features (likes, search)
- **Auth Service** (`src/services/auth.service.ts`): Authentication workflows with BlueSky
- **Media Pipeline**: Image manipulation with expo-image-manipulator, resizing to 1024x1024, and blob upload to BlueSky

### UI System
- **Custom Theme System**: React context-based theming with responsive design utilities (`src/ui/index.tsx`)
- **Component Architecture**: Modular components with custom icons, forms, and Instagram-like post components
- **Navigation**: Expo Router with auth-protected routes and tab-based main navigation

### File Structure
- `src/screens/` - Route components organized by auth state: `(auth)/` and `(main)/`
- `src/components/` - Reusable UI components including posts, feeds, icons, and forms
- `src/state/` - Global state management including session, modals, dialogs, and persistence
- `src/lib/` - Utility functions for media, async operations, logging, and app configuration

### Development Patterns
- TypeScript throughout with strict typing
- React hooks for state management
- Context providers for global state (session, theme, dialogs)
- Expo modules for native functionality (camera, image picker, media library)
- ATProto API integration with proper error handling and session management

### Testing Setup
- Jest with jest-expo preset
- Component testing with react-test-renderer
- Test files in `__tests__/` directories alongside components