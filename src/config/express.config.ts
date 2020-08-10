// node module
import * as fs from 'fs';

export const httpsOptions = {
  key: fs.readFileSync(process.env.HTTPS_KEY_FILE),
  cert: fs.readFileSync(process.env.HTTPS_CERT_FILE),
};
