export default class ErrorWithStatus extends Error {
  public constructor(message: string, public status: number) {
    super(message);
  }
}
