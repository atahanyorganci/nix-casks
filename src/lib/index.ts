export class BaseError extends Error {
  constructor(
    public override readonly name: string,
    public override readonly message: string,
  ) {
    super(`${name}: ${message}`);
  }
}

export class UnreachableError extends BaseError {
  constructor(message: string) {
    super("UnreachableError", message);
  }
}

export function unreachable(message: string): never {
  throw new UnreachableError(message);
}

export class UnimplementedError extends BaseError {
  constructor(message: string) {
    super("UnimplementedError", message);
  }
}

export function unimplemented(message: string): never {
  throw new UnimplementedError(message);
}
