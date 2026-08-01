import { WebhookClient, type Guild } from "discord.js";
import { Event, type Bot } from "../../structures/index.js";

export default class GuildDelete extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "guildDelete",
    });
  }

  public async run(guild: Guild): Promise<any> {
    const web = new WebhookClient({ url: `${this.client.config.leave_log}` });

    try {
      const guildCount = await this.client.cluster.broadcastEval(
        (c) => c.guilds.cache.size
      );
      const totalGuilds = guildCount.reduce((a: number, b: number) => a + b, 0);

      const userCount = await this.client.cluster.broadcastEval((c) =>
        c.guilds.cache
          .filter((x) => x.available)
          .reduce((a: number, g) => a + g.memberCount, 0)
      );
      const totalUsers = userCount.reduce(
        (acc: number, count: number) => acc + count,
        0
      );

      const embed = this.client
        .embed()
        .setTitle("Guild Left")
        .setColor(this.client.color.main)
        .setAuthor({
          name: `${this.client.user.username}`,
          iconURL: this.client.user.displayAvatarURL(),
        })
        .addFields(
          {
            name: "Guild Info",
            value:
              `**Guild Name:** ${guild.name}\n` +
              `**Guild ID:** ${guild.id}\n` +
              `**Created At:** <t:${Math.floor(
                guild.createdTimestamp / 1000
              )}:R>\n` +
              `**Member Count:** ${guild.memberCount} Members`,
          },
          {
            name: "Bot Info",
            value:
              `**Server Count:** ${totalGuilds} Servers\n` +
              `**User Count:** ${totalUsers} Users`,
          }
        );

      await web.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error sending guild left webhook:", error);
    }
  }
}
