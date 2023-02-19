/* eslint-disable @typescript-eslint/ban-types */
import * as jwt from "jsonwebtoken";

export interface JsonwebtokenService {
  verify(token: string, secretOrPublicKey: jwt.Secret): string | jwt.JwtPayload;
  sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: jwt.Secret
  ): string;
}
