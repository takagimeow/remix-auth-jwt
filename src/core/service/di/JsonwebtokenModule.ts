import { container } from "tsyringe";
import { JsonwebtokenEsmServiceImpl } from "../jsonwebtoken/impl/JsonwebtokenEsmServiceImpl";
import { JsonwebtokenServiceImpl } from "../jsonwebtoken/impl/JsonwebtokenServiceImpl";
import { JsonwebtokenService } from "../jsonwebtoken/JsonwebtokenService";

export function jsonwebtokenModule() {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    container.register<JsonwebtokenService>("JsonwebtokenService", {
      useClass: JsonwebtokenServiceImpl,
    });
  } else {
    container.register<JsonwebtokenService>("JsonwebtokenService", {
      useClass: JsonwebtokenEsmServiceImpl,
    });
  }
}
