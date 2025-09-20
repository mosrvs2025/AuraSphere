# AuraSphere - Replit Project Setup

## Project Overview
AuraSphere is a next-generation interactive audio social platform built with React, TypeScript, and Vite. It features live audio rooms, AI-powered tools via Google Gemini API, and a rich social experience.

## Recent Changes (September 20, 2025)
- ✅ Successfully imported from GitHub and configured for Replit environment
- ✅ Installed all Node.js dependencies (React 19.1.1, TypeScript, Vite 6.2.0)
- ✅ Configured Vite development server for Replit proxy compatibility (host: 0.0.0.0, port: 5000)
- ✅ Set up proper Tailwind CSS instead of CDN version
- ✅ Configured development workflow on port 5000
- ✅ Set up deployment configuration for autoscale with build step

## Project Architecture
- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 6.2.0 with Hot Module Replacement
- **Styling**: Tailwind CSS 4.1.13 with PostCSS and Autoprefixer
- **AI Integration**: Google Gemini API for icebreakers, chat summaries, and avatar generation
- **Module System**: ES Modules with import maps for external dependencies
- **Development Server**: Configured for 0.0.0.0:5000 to work with Replit's proxy system

## Key Configuration
- **Development**: `npm run dev` starts Vite server on port 5000
- **Production Build**: `npm run build` creates optimized bundle
- **Deployment**: Autoscale deployment with build step, serves on port 5000
- **Host Configuration**: Properly configured to accept all hosts for Replit proxy

## Environment Variables Required
- `GEMINI_API_KEY`: Required for AI features (icebreakers, summaries, avatar generation)

## User Preferences
- Project structure maintained as per original design
- Used existing package.json scripts and dependencies
- Maintained component-based architecture with TypeScript types
- Preserved all original features and functionality

## Current State
✅ **Fully functional** - Development server running, all dependencies installed, ready for use
✅ **Deployment ready** - Production configuration set up for autoscale deployment
✅ **Replit optimized** - Configured for Replit's environment and proxy system