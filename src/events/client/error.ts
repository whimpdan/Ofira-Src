import { WebhookClient } from "discord.js";
import { Event, type Bot } from "../../structures/index.js";

export default class ErrorEvent extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "error",
    });
  }

  public async run(error: Error): Promise<void> {
    this.client.logger.error(`[Error Event] An error occurred: ${error}`);

    if (!this.client.config.error_log) {
      this.client.logger.error(
        "[Error Event] No webhook URL found in configuration."
      );
      return;
    }

    const webhookClient = new WebhookClient({
      url: this.client.config.error_log,
    });

    try {
      await webhookClient.send({
        embeds: [
          this.client
            .embed()
            .setTitle("Unexpected Error")
            .setDescription(`\`\`\`js\n${error.stack || error.message}\n\`\`\``)
            .setColor(this.client.color.red)
            .setTimestamp(),
        ],
      });
    } catch (err) {
      this.client.logger.error(
        `[Error Event] Failed to send error to webhook: ${err}`
      );
    }
  }
}
