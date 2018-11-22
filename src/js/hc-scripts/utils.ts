/**
 * Wraps a function returning a promise designed to handle script commands to automatically catch
 * errors and kill the process on finish.
 */
export function createHandler(createHandlerFn) {
  return (...args) => {
    createHandlerFn(...args)
      .catch(error => console.error(error))
      .then(() => process.exit());
  };
}
