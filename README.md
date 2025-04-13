# Assembli Estimator Onboarding Platform

**Interactive onboarding prototype for a construction estimating platform. Case study turned working demo to show how real UX beats static mockups.**

🔗 [Live Demo](https://assembli-example-flow.replit.app)

---

## Why I Built This

This was part of a case study for a senior PM role at a construction tech startup. The ask was simple: mock up a UI to collect missing inputs their AI couldn't pull from blueprints or settings.

Instead of tossing together a static flow, I rebuilt their entire onboarding experience in Replit using modern tools. The engineers were pretty blown away. They were still new to tools like Cursor and V0, so I figured the best way to communicate vision was to build something real.

The app doesn’t calculate estimates (their job, not mine), but the UI is fully functional and shows how a cleaner, more intuitive workflow could work in practice. I ended up passing on the role due to comp and team fit, but it was a fun exercise. Just wanted to show that good product thinking isn't about pixels or decks. It's about showing, not telling.

---

## Project Overview

This application provides an interactive wizard interface to guide construction professionals through the process of setting up their company standards, uploading documentation, creating estimates, and validating their projects against established industry standards.

---

## Features

### Standards Setup
- Interactive multi-step wizard to define company-specific construction standards
- Project type configuration: Commercial, Residential, Renovation
- Critical & advanced standards input
- Adaptive configuration based on project type

### Documentation Management
- Upload and manage RFPs, blueprints, and pricing data
- Organize documents by type and project
- Reference historical data to improve estimates

### Estimation Engine
- Build detailed estimates with material, labor, and cost inputs
- Line item flyouts with added context
- Real-time standards validation
- Confidence scoring logic (placeholder UI)

### Validation Dashboard
- Track validation issues
- Check for compliance with standards
- Central issue resolution workflow

### Global Features
- Reset demo function to clear progress
- Fully responsive UI
- Onboarding progress tracking

---

## Technical Implementation

### Frontend
- React (TypeScript)
- Vite
- Tailwind CSS
- Shadcn UI
- TanStack Query
- React Hook Form
- Wouter

### Backend
- Express (TypeScript)
- RESTful API
- Multer for file uploads
- In-memory data store (for demo only)

---

## Data Model

- **Company Standards**: Company-specific estimation rules
- **Onboarding Progress**: Tracks user flow
- **Documents**: Uploaded RFPs and blueprints
- **Materials**: Catalog with pricing
- **Estimates**: Detailed line items
- **Validation Issues**: Compliance tracking

---

## Workflow

1. Set company standards via interactive wizard  
2. Upload project documentation  
3. Create estimate with material and labor breakdown  
4. Validate estimate against rules  
5. Resolve flagged issues  
6. Submit final estimate

---

## Demo Usage

Click the "Reset Demo" button in the header to restart and test different configurations.

🔗 [Live Demo](https://assembli-example-flow.replit.app)

---

## Project Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/assembli-estimator-onboarding.git

# Navigate into the project folder
cd assembli-estimator-onboarding

# Install dependencies
npm install

# Start the dev server
npm run dev
