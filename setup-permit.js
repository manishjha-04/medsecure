// This script sets up Permit.io resources using the CLI
// Run it with: node setup-permit.js

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure .permit directory exists
if (!existsSync('.permit')) {
  mkdirSync('.permit');
}

// Set API key from .env file or environment variable
const apiKey = process.env.PERMIT_API_KEY || process.env.VITE_PERMIT_API_KEY;
if (!apiKey) {
  console.error('Error: PERMIT_API_KEY environment variable is not set');
  process.exit(1);
}

// Helper function to run shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Initialize Permit project
console.log('Setting up Permit.io project...');

// Login with API key
runCommand(`permit login ${apiKey}`);

// Create project if it doesn't exist
try {
  runCommand('permit init');
} catch (error) {
  console.log('Project already initialized or error occurred:', error.message);
}

// Create policy using AI
const policyDescription = `
A healthcare data management application with different roles:
- admin (full access to all resources)
- doctor (can view and manage patients and medical records)
- nurse (can view patients and create/view medical records)
- patient (can only view their own medical records)

The system manages:
- patient records
- medical records
- prescriptions
- lab results
- billing information

Each resource should have appropriate actions like view, create, edit, and delete.
`;

try {
  runCommand(`permit policy create ai "${policyDescription}"`);
} catch (error) {
  console.log('Error creating policy:', error.message);
}

console.log('\nPermit.io setup completed! 🎉');
console.log('Your healthcare authorization model is now configured in Permit.io.');
console.log('You can view it in the Permit.io dashboard or by running:');
console.log('  permit resources list');
console.log('  permit roles list');
console.log('  permit users list');