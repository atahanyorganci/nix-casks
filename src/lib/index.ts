import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export class UnsupportedArtifactError extends BaseError {
	constructor(
		public readonly type: string,
		message: string,
	) {
		super("UnsupportedError", message);
	}
}

export function unsupported(type: string, message: string): never {
	throw new UnsupportedArtifactError(type, message);
}

export function cn(...classes: ClassValue[]) {
	return twMerge(clsx(classes));
}
