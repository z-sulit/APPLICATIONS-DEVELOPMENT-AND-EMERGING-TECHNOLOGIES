# User Signup and Login Authentication System

Using a basic backend setup with Express.js, create a simple User Signup and Login Authentication System with only 1 HTTP method: `POST`.

## Signup Page
* Create a form that accepts `email`, `username`, and `password`.
* When submitted, it should call a `POST` API that stores the object to a JSON `users` array in the backend.
* With a successful request, redirects to a simple homepage.
* An already existing user will throw a `409` error.
* Empty fields must return a `400` error.

## Login Page
* Create a form that accepts `username` and `password`.
* When logged in, calls a `POST` API on the backend that checks whether a user is existing in the demo database (JSON array).
* The fields `username` and `password` must be passed to the backend via request body (not request params).
* If exists, redirect to a simple homepage.
* Empty fields must return a `400` error.

## Notes
Display proper error messages and status codes:
* `201` for successful creation of new resource (signup)
* `200` if user successfully exists upon logging in
* `409` for already existing user (signup)
* `400` if any field is empty (signup & login)

Your database to be used will just be a JSON array on a separate JS file. Key each array item by an additional `id` field. Build your frontend with simple HTML pages.