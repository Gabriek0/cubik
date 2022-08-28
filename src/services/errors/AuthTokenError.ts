// when we create a class it is possible to
// distinguish one error from the others

export class AuthTokenError extends Error {
  constructor() {
    super("Error with authentication token.");
  }
}
