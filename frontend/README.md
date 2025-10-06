# Facelytics Frontend

A modern React frontend for the Facelytics face recognition system built with TypeScript, Tailwind CSS, and Vite.

## Features

- **User Authentication**: Register and login functionality
- **Face Embedding Creation**: Upload images to create face embeddings
- **Face Comparison**: Compare two images to check if they contain the same person
- **Embedding Management**: Delete existing face embeddings
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for routing
- **Axios** for API calls
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running FastAPI backend on `http://localhost:8000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── LoadingButton.tsx
│   └── FileUpload.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── services/           # API services
│   └── api.ts
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend is configured to work with the FastAPI backend running on `http://localhost:8000`. The following endpoints are integrated:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Face Recognition
- `POST /create-embedding` - Create face embedding
- `DELETE /delete-embedding` - Delete face embedding
- `POST /compare-faces` - Compare two faces

## Features Overview

### Authentication System
- Secure user registration and login
- JWT token management (ready for implementation)
- Protected routes
- User session persistence

### Face Recognition Dashboard
- **Create Embeddings**: Upload face images with person names
- **Compare Faces**: Upload two images to check similarity
- **Manage Embeddings**: Delete existing face embeddings

### UI Components
- Responsive design that works on all devices
- Drag-and-drop file upload
- Loading states for all async operations
- Error handling with user-friendly messages
- Modern, clean interface

## Configuration

The frontend is configured to proxy API requests to the backend. If your backend runs on a different port, update the `vite.config.ts` file:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:YOUR_BACKEND_PORT',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist` directory, ready for deployment.

## Contributing

1. Follow the existing code style and TypeScript conventions
2. Use functional components with hooks
3. Implement proper error handling
4. Add appropriate loading states for async operations
5. Ensure responsive design for all new components
