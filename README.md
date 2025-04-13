# Assembli Estimator Onboarding Platform

A dynamic onboarding platform for construction professionals that streamlines project initialization and standard definition within the Assembli ecosystem.

## Project Overview

This application provides an interactive wizard interface to guide construction professionals through the process of setting up their company standards, uploading documentation, creating estimates, and validating their projects against established industry standards.

## Features

### Standards Setup

- **Standards Wizard**: Interactive multi-step wizard to define company-specific construction standards
- **Project Type Configuration**: Support for Commercial, Residential, and Renovation project types
- **Critical & Advanced Standards**: Comprehensive configuration for all aspects of construction projects
- **Adaptive Configuration**: Standards are tailored based on project type selection

### Documentation Management

- **Document Upload**: Upload and manage project documentation, including RFPs, blueprints, and historical pricing data
- **Document Organization**: Categorize and search documents by type and project
- **Historical Analysis**: Leverage past pricing data to improve estimation accuracy

### Estimation Engine

- **Estimate Creation**: Build detailed project estimates with materials, labor, and other costs
- **Line Item Detailing**: Interactive flyout panels for each estimate line item with detailed information
- **Standards Validation**: Real-time validation of estimates against company and industry standards
- **Confidence Scoring**: Automatic confidence threshold calculation to ensure estimate quality

### Validation Dashboard

- **Validation Issues**: Track and resolve validation issues in a central dashboard
- **Compliance Checking**: Ensure all estimates comply with required standards
- **Issue Resolution**: Workflow for addressing and resolving validation concerns

### Global Features

- **Demo Reset**: Global reset functionality to clear all progress and start fresh
- **Responsive Design**: Fully responsive UI for desktop and mobile devices
- **Progress Tracking**: Track onboarding progress across all steps

## Technical Implementation

### Frontend

- React TypeScript with Vite
- Shadcn UI component library
- TanStack Query for data fetching
- React Hook Form for form handling
- Wouter for client-side routing
- Tailwind CSS for styling

### Backend

- Express server with TypeScript
- In-memory storage for quick prototyping
- RESTful API design
- File upload handling with Multer

### Data Model

The application manages several key entities:

- **Company Standards**: Define construction standards specific to a company
- **Onboarding Progress**: Track user progress through the onboarding flow
- **Documents**: Store uploaded project documentation
- **Materials**: Catalog construction materials with pricing
- **Estimates**: Project estimates with detailed line items
- **Validation Issues**: Track compliance issues in estimates

## Workflow

1. **Standards Setup**: Users begin by configuring their company-specific construction standards through an interactive wizard.
2. **Document Upload**: Next, they upload relevant project documentation, including historical pricing data.
3. **Estimate Creation**: Using the standards and documentation, users create detailed project estimates.
4. **Validation**: The system validates estimates against standards and calculates a confidence score.
5. **Issue Resolution**: Users address any validation issues in the dashboard.
6. **Submission**: Once validated, estimates can be submitted as final bids.

## Demo Usage

The application includes a global "Reset Demo" button in the header that allows users to completely reset all progress and start fresh. This is useful for demonstration purposes or when testing different configurations.

## Development Guidelines

- **Component Structure**: UI components are organized by function and reusability
- **State Management**: React Query is used for server state, React hooks for local state
- **Data Flow**: Follows a RESTful API pattern with clear client-server separation
- **Styling**: Uses Tailwind CSS with shadcn components for consistent UI
- **Error Handling**: Comprehensive error handling with user feedback
- **Performance**: Optimized data loading with proper caching strategies

## Project Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. The application will be available at `http://localhost:5000`

## Key Technologies

- React
- TypeScript
- Express
- TanStack Query
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- Vite
- Drizzle ORM