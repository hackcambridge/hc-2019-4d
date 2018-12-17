/**
 * Statically asserts that the parameter is of type `never` — the type that is left
 * after all cases are removed.  This assertion is checked at compile time.
 * It can be used for example to check that a `switch` statement is exhaustive.
 *
 * For more, see https://www.typescriptlang.org/docs/handbook/advanced-types.html.
 */
export function assertNever(x: never): never {
  throw new Error('Unexpected object that should have never occurred: ' + x);
}
