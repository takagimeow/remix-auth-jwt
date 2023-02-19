# JwtStrategy

A Remix Auth strategy for working with JWT.

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

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

export let authenticator = new Authenticator<{ requestname: string }>(sessionStorage);
```

And you can tell the authenticator to use the JwtStrategy.

```ts
import { JwtStrategy } from 'remix-auth-jwt';

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
}
```