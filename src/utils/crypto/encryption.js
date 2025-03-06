import CryptoJS from "crypto-js";
import { config } from "dotenv";
import path from "path";
config({ path: path.resolve("src/config/.env") });

export const encrypt = ({ data, key = process.env.CRYPTO_KEY }) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};
