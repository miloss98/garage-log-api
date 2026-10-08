// An error that knows which HTTP status it should produce.
// Services throw it; the error middleware turns it into a JSON response.
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`)
