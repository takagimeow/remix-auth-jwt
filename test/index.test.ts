import "reflect-metadata";
import { createCookieSessionStorage } from "@remix-run/node";
// import * as jwt from "jsonwebtoken-esm";
import { AuthenticateOptions, AuthorizationError } from "remix-auth";
import { container } from "tsyringe";
import { JwtStrategy, JwtStrategyVerifyParams } from "../src";
import { JsonwebtokenService } from "../src/core/service/jsonwebtoken/JsonwebtokenService";
import { jsonwebtokenModule } from "../src/core/service/di/JsonwebtokenModule";

const BASE_OPTIONS: AuthenticateOptions = {
  name: "form",
  sessionKey: "user",
  sessionErrorKey: "error",
  sessionStrategyKey: "strategy",
};

jsonwebtokenModule();

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
  let token: string;
  interface User {
    id: string;
  }

  beforeAll(async () => {
    const jwt = container.resolve<JsonwebtokenService>("JsonwebtokenService");
    token = await jwt.sign(payload, secret);
  });

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

    await strategy.authenticate(request, sessionStorage, {
      ...BASE_OPTIONS,
    });
    expect(verify).toBeCalledWith({
      payload: {
        ...payload,
        iat: expect.any(Number),
      },
    });
  });

  test("should return what the verify callback returned", async () => {
    verify.mockImplementationOnce(
      async ({ payload }: JwtStrategyVerifyParams) => {
        return payload["username"];
      }
    );

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let context = { test: "it works!" };

    let strategy = new JwtStrategy<User>(options, verify);

    const user = await strategy.authenticate(request, sessionStorage, {
      ...BASE_OPTIONS,
      context,
    });

    expect(user).toBe(payload.username);
  });

  test("should pass the context to the verify callback", async () => {
    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let context = { test: "it works!" };

    let strategy = new JwtStrategy<User>(options, verify);

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

  test("should pass error as cause on failure", async () => {
    verify.mockImplementationOnce(() => {
      throw new TypeError("Invalid bearer token");
    });

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let strategy = new JwtStrategy<User>(options, verify);

    let result = await strategy
      .authenticate(request, sessionStorage, {
        ...BASE_OPTIONS,
        throwOnError: true,
      })
      .catch((error) => error);

    expect(result).toEqual(new AuthorizationError("Invalid bearer token"));
    expect((result as AuthorizationError).cause).toEqual(
      new TypeError("Invalid bearer token")
    );
  });

  test("should pass generate error from string on failure", async () => {
    verify.mockImplementationOnce(() => {
      throw "Invalid bearer token";
    });

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let strategy = new JwtStrategy<User>(options, verify);

    let result = await strategy
      .authenticate(request, sessionStorage, {
        ...BASE_OPTIONS,
        throwOnError: true,
      })
      .catch((error) => error);

    expect(result).toEqual(new AuthorizationError("Invalid bearer token"));
    expect((result as AuthorizationError).cause).toEqual(
      new TypeError("Invalid bearer token")
    );
  });

  test("should create Unknown error if thrown value is not Error or string", async () => {
    verify.mockImplementationOnce(() => {
      throw { message: "Invalid bearer token" };
    });

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let strategy = new JwtStrategy<User>(options, verify);

    let result = await strategy
      .authenticate(request, sessionStorage, {
        ...BASE_OPTIONS,
        throwOnError: true,
      })
      .catch((error) => error);

    expect(result).toEqual(new AuthorizationError("Unknown error"));
    expect((result as AuthorizationError).cause).toEqual(
      new Error(JSON.stringify({ message: "Invalid bearer token" }, null, 2))
    );
  });
});
