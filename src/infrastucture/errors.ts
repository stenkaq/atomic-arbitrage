export abstract class CustomError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      message: this.message,
    };
  }
}

export class GraphStudioGatewayError extends CustomError {
  readonly statusCode = 502;

  constructor(params: { message: string; source: string }) {
    super(`[GraphStudioGatewayError.${params.source}]: ${params.message}`);
  }
}
