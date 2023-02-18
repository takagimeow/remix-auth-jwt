import { SessionStorage } from "@remix-run/server-runtime";
import {
  AuthenticateOptions,
  Strategy,
  StrategyVerifyCallback,
} from "remix-auth";

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface JwtStrategyOptions {
  something: "You may need";
}

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export interface JwtStrategyVerifyParams {
  something: "Dev may need";
}

export class JwtStrategy<User> extends Strategy<User, JwtStrategyVerifyParams> {
  name = "change-me";

  constructor(
    options: JwtStrategyOptions,
    verify: StrategyVerifyCallback<User, JwtStrategyVerifyParams>
  ) {
    super(verify);
    // do something with the options here
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    return await this.failure(
      "Implement me!",
      request,
      sessionStorage,
      options
    );
    // Uncomment me to do a success response
    // this.success({} as User, request, sessionStorage, options);
  }
}
