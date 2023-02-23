/* eslint-disable @typescript-eslint/ban-types */
import * as jwt from "jsonwebtoken";

export interface JsonwebtokenService {
  verify(
    token: string,
    secretOrPublicKey: jwt.Secret,
    options?: {
      algorithms?: jwt.Algorithm[];
    }
  ): string | jwt.JwtPayload;
  sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: jwt.Secret
  ): string;
}
