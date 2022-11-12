import nodemailer from "nodemailer";

import { getErrorFromUnknown } from "utils/errors";
import { serverConfig } from "utils/serverConfig";

export default class BaseEmail {
  name = "";

  protected getNodeMailerPayload(): Record<string, unknown> {
    return {};
  }
  public sendEmail() {
    new Promise((resolve, reject) =>
      nodemailer
        .createTransport(this.getMailerOptions().transport)
        .sendMail(this.getNodeMailerPayload(), (_err, info) => {
          if (_err) {
            const err = getErrorFromUnknown(_err);
            this.printNodeMailerError(err);
            reject(err);
          } else {
            resolve(info);
          }
        })
    ).catch((e) => console.error("sendEmail", e));
    return new Promise((resolve) => resolve("send mail async"));
  }

  protected getMailerOptions() {
    return {
      transport: serverConfig.transport,
      from: serverConfig.from,
    };
  }

  protected printNodeMailerError(error: Error): void {
    console.error(`${this.name}_ERROR`, error);
  }
}
