# MedSecure - Healthcare Authorization System

MedSecure is a healthcare management system that demonstrates sophisticated role-based (RBAC) and attribute-based (ABAC) access control using Permit.io.

## Features

- Role-based access control (RBAC) for different healthcare roles
- Attribute-based access control (ABAC) to enforce patient data privacy
- Multi-tenancy support for organizations
- Real-time permission checking
- Audit logging of permission decisions

## Getting Started

### Prerequisites

- Node.js 16+
- NPM 7+
- A Permit.io account (https://app.permit.io)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/medsecure.git
   cd medsecure
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   # Permit.io API Configuration
   VITE_PERMIT_API_KEY=your_permit_api_key_here
   VITE_PERMIT_API_URL=https://api.permit.io/v2
   VITE_USE_PROXY=true
   VITE_PROXY_URL=http://localhost:3001/api/permit

   # Server Configuration
   SERVER_PORT=3001

   # Other environment variables
   VITE_APP_NAME=MedSecure
   VITE_APP_ENV=development
   ```

4. Get your Permit.io API key from the Permit.io dashboard and add it to the `.env` file.

5. Start the development server with backend proxy:
   ```bash
   npm run start
   ```
   
   This will start both the React frontend and the Node.js proxy server.

   If you want to run them separately:
   ```bash
   # Run just the proxy server
   npm run server
   
   # Run just the frontend
   npm run dev
   ```

## Setting Up Permit.io

1. Create an account at [Permit.io](https://app.permit.io)
2. Create a new project called "medsecure"
3. In your project, set up the following:
   - **Resources**: patient, medical_record, prescription, billing, system, lab_result
   - **Roles**: admin, doctor, nurse, patient, lab_technician, receptionist
   - **Environment**: dev (default)

4. Configure role permissions:
   - Admin: full access to all resources
   - Doctor: view/create/edit patients and medical records, view/create/approve prescriptions
   - Nurse: view patients, view/create medical records, view/administer prescriptions
   - Patient: view only their own records
   - Lab technician: view patients, view/create medical records, view/create/edit lab results

5. Set up ABAC rules:
   - Patients can only view their own records (condition: user.id === resource.id)
   - Patients can only view their own medical records (condition: user.id === resource.patientId)
   - Nurses in Emergency department can edit patient info (condition: user.department === 'Emergency')
   - Doctors can only approve prescriptions in their specialty (condition: resource.department === user.department)

## Usage

- **Admin login**: admin@healthapp.com / 2025DEVChallenge
- **Doctor login**: dr.smith@healthapp.com / doctor123
- **Patient login**: patient.doe@example.com / patient123

## Project Structure

- `src/services/permit.js` - Permit.io integration
- `src/services/permitConfig.js` - Permit.io configuration and initialization
- `src/services/permitService.js` - Main service that handles Permit.io API calls
- `src/components/PermissionGuard.jsx` - React component for conditional rendering based on permissions
- `src/store/authStore.js` - Authentication store with user roles
- `server.js` - Backend proxy server that handles requests to Permit.io API

## CORS Configuration

The application uses a backend proxy server to handle CORS issues when communicating with Permit.io API:

1. All requests from the frontend to Permit.io go through the proxy server
2. The proxy server adds the necessary authorization headers and forwards the request
3. This approach avoids CORS issues and keeps the API key secure

## Security Considerations

- The application uses Permit.io's API directly for all permission checks
- No mock implementations or local fallbacks are used
- All permission decisions are logged for audit purposes
- Proper attribute-based access control prevents patients from accessing other patients' data
