import { HttpError } from "./httpError";

export class BadRequest extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class Unauthorize extends HttpError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string) {
    super(message, 402);
  }
}

export class NotFound extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}
