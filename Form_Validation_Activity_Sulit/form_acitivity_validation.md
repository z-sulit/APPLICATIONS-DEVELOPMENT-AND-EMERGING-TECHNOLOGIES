# Form Validation Activity Requirements

## Overview
Build a clean, responsive registration form with client-side JavaScript validation.

## Fields & Validation Rules
1. **Username**
   - Required.
   - Minimum length of 3 characters.
2. **Email Address**
   - Required.
   - Must match standard email format (`user@domain.com`).
3. **Password**
   - Required.
   - Minimum length of 8 characters.
   - Must contain at least 1 letter and 1 number.
4. **Confirm Password**
   - Required.
   - Must match the `Password` field.

## User Experience Features
- Display clear error messages under the specific input field upon invalid entry or submit.
- Real-time validation updates as the user types (`input` event listeners).
- Highlight valid/invalid fields visually with appropriate border styles.
- Show a success alert notification when the form passes all validations upon submit.
