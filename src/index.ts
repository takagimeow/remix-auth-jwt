import { AppLoadContext, SessionStorage } from "@remix-run/server-runtime";
import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
import * as jwt from "jsonwebtoken";

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface JwtStrategyOptions {
  /**
   * The key to verify the JWT
   */
  secret: string;
}

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export interface JwtStrategyVerifyParams {
  context?: AppLoadContext;
  payload: string | jwt.JwtPayload;
}

export class JwtStrategy<User> extends Strategy<User, JwtStrategyVerifyParams> {
  name = "jwt";

  protected secret: string;

  constructor(
    options: JwtStrategyOptions,
    verify: StrategyVerifyCallback<User, JwtStrategyVerifyParams>
  ) {
    super(verify);
    this.secret = options.secret;
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    try {
      // Validating Authorisation headers using jsonwebtoken.
      const token = request.headers.get("Authorization")?.split(" ")[1];
      if (token == undefined) {
        return await this.failure(
          "Format is Authorization: Bearer [token]",
          request,
          sessionStorage,
          options
        );
      }

      const decoded = jwt.verify(token, this.secret);
      if (!decoded) {
        return await this.failure(
          "Invalid token",
          request,
          sessionStorage,
          options
        );
      }

      const user = await this.verify({
        payload: decoded,
        context: options.context,
      });
      return await this.success(user, request, sessionStorage, options);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return await this.failure(
          error.message,
          request,
          sessionStorage,
          options
        );
      }
      if (typeof error === "string") {
        return await this.failure(
          error,
          request,
          sessionStorage,
          options,
          new Error(error)
        );
      }
    }
    return await this.failure(
      "Unknown error",
      request,
      sessionStorage,
      options
    );
  }
}
