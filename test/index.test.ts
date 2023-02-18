import { createCookieSessionStorage } from "@remix-run/node";
import * as jwt from "jsonwebtoken";
import { AuthenticateOptions } from "remix-auth";
import { JwtStrategy } from "../src";

const BASE_OPTIONS: AuthenticateOptions = {
  name: "form",
  sessionKey: "user",
  sessionErrorKey: "error",
  sessionStrategyKey: "strategy",
};

describe(JwtStrategy, () => {
  let verify = jest.fn();
  // You will probably need a sessionStorage to test the strategy.
  let sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });

  const secret = "s3cr3t";
  let options = Object.freeze({
    secret,
  });

  const payload = { username: "example@example.com" };
  const token = jwt.sign(payload, secret);

  interface User {
    id: string;
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should have the name of the strategy", () => {
    let strategy = new JwtStrategy(options, verify);
    expect(strategy.name).toBe("jwt");
  });

  test("should pass the payload and the context to the verify callback", async () => {
    let strategy = new JwtStrategy<User>(options, verify);

    // create request with Authorization header with bearer token
    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let context = { test: "it works!" };

    await strategy.authenticate(request, sessionStorage, {
      ...BASE_OPTIONS,
      context,
    });
    expect(verify).toBeCalledWith({
      payload: {
        ...payload,
        iat: expect.any(Number),
      },
      context,
    });
  });
});
