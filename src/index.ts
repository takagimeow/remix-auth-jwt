import "reflect-metadata";
import { AppLoadContext, SessionStorage } from "@remix-run/server-runtime";
import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";
// import * as jwt from "jsonwebtoken-esm";
import type { JwtPayload } from "jsonwebtoken";
import { JsonwebtokenService } from "./core/service/jsonwebtoken/JsonwebtokenService";
import { container } from "tsyringe";
import { jsonwebtokenModule } from "./core/service/di/JsonwebtokenModule";
import type { Algorithm } from "jsonwebtoken";

jsonwebtokenModule();

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface JwtStrategyOptions {
  /**
   * The key to verify the JWT
   */
  secret: string;

  /**
   * The algorithms to verify the JWT
   */
  algorithms: Algorithm[];

  getToken?: (req: Request) => string | Promise<string>;
}

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export interface JwtStrategyVerifyParams {
  context?: AppLoadContext;
  payload: string | JwtPayload;
}

export class JwtStrategy<User> extends Strategy<User, JwtStrategyVerifyParams> {
  name = "jwt";

  protected secret: string;
  protected algorithms: Algorithm[];
  protected jwt: JsonwebtokenService;
  protected getToken?: JwtStrategyOptions["getToken"];

  constructor(
    options: JwtStrategyOptions,
    verify: StrategyVerifyCallback<User, JwtStrategyVerifyParams>
  ) {
    super(verify);
    this.secret = options.secret;
    this.algorithms = options.algorithms;
    this.jwt = container.resolve<JsonwebtokenService>("JsonwebtokenService");

    if (options.getToken) {
      this.getToken = options.getToken;
    }
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    let token: string | undefined;
    try {
      token = this.getToken
        ? await this.getToken(request)
        : request.headers.get("Authorization")?.split(" ")[1];

      if (token == undefined) {
        return await this.failure(
          "Format is Authorization: Bearer [token]",
          request,
          sessionStorage,
          options
        );
      }

      const decoded = this.jwt.verify(token, this.secret, {
        algorithms: this.algorithms,
      });
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
          options,
          error
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
      return await this.failure(
        "Unknown error",
        request,
        sessionStorage,
        options,
        new Error(JSON.stringify(error, null, 2))
      );
    }
  }
}
