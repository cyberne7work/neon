# GameBuilder Frontend

A modern React application built with TypeScript and Vite for creating and managing game assets and configurations.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theming
- **State Management**: Custom stores using Zustand
- **Real-time Communication**: WebSocket integration
- **UI Components**: Custom components with responsive design
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # React components
├── constants/     # Application constants
├── hooks/         # Custom React hooks
├── stores/        # State management stores
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Features

- **Authentication System**: Secure user authentication
- **Theme Support**: Light and dark mode with custom color variables
- **File Management**: View and manage game assets and files
- **Real-time Updates**: WebSocket integration for live updates
- **Responsive Design**: Mobile-friendly interface
- **Tab-based Interface**: Organized content presentation
- **Toast Notifications**: User-friendly status updates

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Theme Customization

The application uses CSS variables for theming, supporting both light and dark modes. Theme variables are defined in `index.css`:

```css
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text-primary: #111827;
  /* ... other variables */
}

:root[data-theme='dark'] {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  /* ... other variables */
}
```

## Component Library

The application includes reusable UI components with consistent styling:

- Buttons (`btn`, `btn-primary`, `btn-secondary`)
- Input fields (`input`)
- Tabs (`tab`, `tab-active`, `tab-inactive`)
- Custom scrollbars (`scrollbar-thin`, `scrollbar-none`)

## WebSocket Integration

Real-time communication is handled through a WebSocket client with support for:
- Chat messages
- Live updates
- Error handling
- Automatic reconnection
