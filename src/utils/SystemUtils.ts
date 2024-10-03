import { config } from "dotenv";

export class SystemUtils {
  constructor() {
    config();
  }

  static isProduction() {
    return process.env.NODE_ENV === "production";
  }
}
