# JwtStrategy

A Remix Auth strategy for working with JWT.

This strategy is influenced by Ktor's JSON Web Tokens-related library.

In other words, when Remix is used as an API-only application, this strategy comes into effect.

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

This strategy has been tested to work with Node.js as well as with Cloudflare workers.

Run the following command to obtain a token to verify that this strategy works with Cloudflare workers.

```shell
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "example@example.com" }' \
  https://remix-auth-jwt.takagimeow.workers.dev/create-token
```

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE2NzY4NjgxMTl9.lQj4xzTxx26jL6AKH-1qpEgKuLCgZqXOrsHcRPGK6tM"
}
```

Then run the following command to verify that you can authenticate with this token.

```shell
curl -X GET \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE2NzY4NjgxMTl9.lQj4xzTxx26jL6AKH-1qpEgKuLCgZqXOrsHcRPGK6tM" \
  https://remix-auth-jwt.takagimeow.workers.dev/authenticate-required
```

```json
{ "success": true, "username": "example@example.com", "iat": 1676868119 }
```

Check out [this repository](https://github.com/takagimeow/remix-auth-jwt-cloudflare-workers) to learn how to implement this strategy for the applications you want to run on Cloudflare Workers.

<!-- If it doesn't support one runtime, explain here why -->

## How to use

<!-- Explain how to use the strategy, here you should tell what options it expects from the developer when instantiating the strategy -->

First, install the strategy, jsonwebtoken@8.5.1, jsonwebtoken-esm@1.0.5 and Remix Auth.

```bash
$ npm install remix-auth remix-auth-jwt jsonwebtoken@8.5.1 jsonwebtoken-esm@1.0.5
```

Then, create an Authenticator instance.

```ts
// app/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";

export let authenticator = new Authenticator<{ requestname: string }>(
  sessionStorage
);
```

And you can tell the authenticator to use the JwtStrategy.

```ts
import { JwtStrategy } from "remix-auth-jwt";

// The rest of the code above here...

authenticator.use(
  new JwtStrategy(
    {
      secret: "s3cr3t",
    },
    // Define what to do when the request is authenticated
    async ({ payload, context }) => {
      // You can access decoded token values here using payload
      // and also use `context` to access more things from the server
      return payload;
    }
  ),
  // each strategy has a name and can be changed to use another one
  "jwt"
);
```

In order to authenticate a request, you can use the following inside of an `loader` function:

```ts
import { LoaderArgs } from "@remix-run/server-runtime";
import { authenticator } from "~/auth.server";

export async function loader({ params, request }: LoaderArgs) {
  const result = await authenticator.authenticate("jwt", request);
  return result;
  try {
    const result = await authenticator.authenticate("jwt", request);
    /* handle success */
  } catch (error: unknown) {
    /* handle error */
  }
}
```

In order to authenticate a request, you can use the following inside of an `action` function:

```ts
import type { ActionArgs } from "@remix-run/server-runtime";
import { authenticator } from "~/auth.server";

export const action = async ({ request }: ActionArgs) => {
  try {
    const result = await authenticator.authenticate("jwt", request);
    switch (request.method) {
      case "POST": {
        /* handle "POST" */
      }
      case "PUT": {
        /* handle "PUT" */
      }
      case "PATCH": {
        /* handle "PATCH" */
      }
      case "DELETE": {
        /* handle "DELETE" */
      }
    }
  } catch (error: unknown) {
    /* handle error */
  }
};
```
