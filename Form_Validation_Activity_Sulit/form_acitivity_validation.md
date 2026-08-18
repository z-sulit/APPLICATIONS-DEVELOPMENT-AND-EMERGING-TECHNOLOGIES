# Form Validation Activity Requirements

## Overview
Create a simple web application that contains two forms: Sign Up and Sign In. On the first page, the user must choose whether they want to Sign Up or Sign In through two buttons, and then be redirected to the correct page.

Each form must include input validation using JavaScript before the form is submitted. Use event handling such as submit, input, and blur to show error messages and prevent the form from submitting if validation fails. If the form is valid, display a success message or redirect to a “Welcome” page.

## Initial Page Layout Structure
The initial page layout must contain a "Welcome!" heading, a Sign Up button, and a Login button to direct the user to the appropriate form.

## Validation Requirements

### Sign Up Form
1. **Email**: Validate that the email is in a proper format (`user@domain.com`).
2. **Phone Number**: Validate that the phone number is filled.
3. **Password**: Validate that the password is at least 8 characters long and contains a number.

### Sign In (Login) Form
1. **Email**: Validate that the email field is not empty and that the email format is valid.
2. **Password**: Validate that the password field is not empty.
