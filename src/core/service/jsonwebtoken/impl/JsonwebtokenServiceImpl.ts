import { JsonwebtokenService } from "../JsonwebtokenService";
import * as jwt from "jsonwebtoken";

export class JsonwebtokenServiceImpl implements JsonwebtokenService {
  verify(
    token: string,
    secretOrPublicKey: jwt.Secret
  ): string | jwt.JwtPayload {
    const result = jwt.verify(token, secretOrPublicKey);
    return result;
  }
  sign(
    // eslint-disable-next-line @typescript-eslint/ban-types
    payload: string | object | Buffer,
    secretOrPrivateKey: jwt.Secret
  ): string {
    const result = jwt.sign(payload, secretOrPrivateKey);
    return result;
  }
}
