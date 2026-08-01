import { ActivityType } from "discord.js";
import { Event, type Bot } from "../../structures/index.js";
import {
  checkAndRemoveExpiredPremiums,
  checkAndRemoveExpiredNoPrefix,
} from "../../structures/functions.js";

export default class Ready extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "ready",
    });
  }

  public async run(): Promise<void> {
    this.client.manager.init({
      id: this.client.user.id,
      username: this.client.user.username,
    });

    this.client.logger.info(`${this.client.user?.tag} is ready!`);

    this.client.user?.setPresence({
      activities: [
        {
          name: `/help`,
          type: ActivityType.Listening,
        },
      ],
      status: "online",
    });

    if (this.client.config.premium === true) {
      const shardId = this.client.shard?.ids[0] ?? 0;

      if (shardId === 0) {
        this.client.logger.info("Shard 0 detected, starting premium check.");

        await checkAndRemoveExpiredPremiums(this.client);

        setInterval(async () => {
          this.client.logger.info("Running scheduled premium check...");
          await checkAndRemoveExpiredPremiums(this.client);
        }, 3600000);
      }
    }

    await checkAndRemoveExpiredNoPrefix(this.client);

    setInterval(async () => {
      this.client.logger.info("Running scheduled NoPrefix cleanup...");
      await checkAndRemoveExpiredNoPrefix(this.client);
    }, 3600000);
  }
}
