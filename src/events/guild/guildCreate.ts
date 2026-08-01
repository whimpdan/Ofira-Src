import { WebhookClient, type Guild } from "discord.js";
import { Event, type Bot } from "../../structures/index.js";

export default class GuildCreate extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "guildCreate",
    });
  }

  public async run(guild: Guild): Promise<any> {
    const web = new WebhookClient({ url: `${this.client.config.join_log}` });

    const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
    const ownerTag = owner ? owner.user.tag : "Unknown User";

    const statsEmbed = this.client
      .embed()
      .setTitle("Guild Joined")
      .setAuthor({
        name: `${this.client.user.username}`,
        iconURL: this.client.user.displayAvatarURL(),
      })
      .setColor(this.client.color.main)
      .addFields(
        {
          name: "Guild Info",
          value:
            `**Guild Name:** ${guild.name}\n` +
            `**Guild ID:** ${guild.id}\n` +
            `**Created At:** <t:${Math.floor(
              guild.createdTimestamp / 1000
            )}:R>\n` +
            `**Joined At:** <t:${Math.floor(
              guild.joinedTimestamp! / 1000
            )}:R>\n` +
            `**Owner:** ${ownerTag}\n` +
            `**Member Count:** ${guild.memberCount} Members\n` +
            `**Shard ID:** ${guild.shardId}`,
        },
        {
          name: "Bot Stats",
          value:
            `**Server Count:** ${await this.client.cluster
              .broadcastEval((c) => c.guilds.cache.size)
              .then((res) =>
                res.reduce((acc: number, count: number) => acc + count, 0)
              )}\n` +
            `**User Count:** ${await this.client.cluster
              .broadcastEval((c) =>
                c.guilds.cache.reduce(
                  (total, guild) => total + guild.memberCount,
                  0
                )
              )
              .then((res) =>
                res.reduce((acc: number, count: number) => acc + count, 0)
              )}`,
        }
      );

    web.send({ embeds: [statsEmbed] });
  }
}
