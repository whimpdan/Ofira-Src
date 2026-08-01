import chalk from "chalk";
import moment from "moment";

class Logger {
  private getTimestamp(): string {
    return chalk.gray(`[${moment().format("DD-MM-YYYY HH:mm:ss")}]`);
  }

  public info(message: string): void {
    console.log(`${this.getTimestamp()} ${chalk.blue("[INFO]")} ${message}`);
  }

  public warn(message: string): void {
    console.log(`${this.getTimestamp()} ${chalk.yellow("[WARN]")} ${message}`);
  }

  public error(message: string): void {
    console.log(`${this.getTimestamp()} ${chalk.red("[ERROR]")} ${message}`);
  }

  public success(message: string): void {
    console.log(
      `${this.getTimestamp()} ${chalk.green("[SUCCESS]")} ${message}`
    );
  }

  public debug(message: string): void {
    console.log(
      `${this.getTimestamp()} ${chalk.magenta("[DEBUG]")} ${message}`
    );
  }

  public log(event: string, message: string): void {
    console.log(
      `${this.getTimestamp()} ${chalk.cyan(
        `[${event.toUpperCase()}]`
      )} ${message}`
    );
  }
}

export default Logger;