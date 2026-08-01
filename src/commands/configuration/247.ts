import { Command, type Context, type Bot } from "../../structures/index.js";
import reconnectAuto from "../../db/247.js";
import { GuildMember } from "discord.js";

export default class _247 extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "247",
      description: {
        content: "Set the bot to stay in the voice channel 24/7.",
        examples: ["247"],
        usage: "247",
      },
      category: "Configuration",
      aliases: ["stay", "24/7"],
      cooldown: 3,
      args: false,
      premium: true,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: ["ManageGuild"],
      },
      check: {
        inVc: true,
        sameVc: true,
        connect: true,
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    try {
      const member = ctx.member as GuildMember;
      const data = await reconnectAuto.findOne({ GuildId: ctx.guild.id });

      if (data) {
        await reconnectAuto.findOneAndDelete({ GuildId: ctx.guild.id });
        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setDescription(
                `${client.emoji.tick} 24/7 Mode has been **disabled** in **${ctx.guild.name}**.`
              )
              .setColor(client.color.main),
          ],
        });
      } else {
        if (!member.voice.channelId) {
          return ctx.sendMessage({
            embeds: [
              client
                .embed()
                .setDescription(
                  `${client.emoji.cross} You need to be in a voice channel to enable 24/7 mode.`
                )
                .setColor(client.color.red),
            ],
          });
        }

        await reconnectAuto.create({
          GuildId: ctx.guild.id,
          TextId: ctx.channel.id,
          VoiceId: member.voice.channelId,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        let player = await client.manager.players.get(ctx.guild.id);
        if (!player) {
          player = await client.manager.createPlayer({
            guildId: ctx.guild?.id,
            voiceChannelId: member.voice?.channelId,
            textChannelId: ctx.channel?.id,
            selfDeaf: true,
            volume: 80,
          });
        }
        if (!player?.connected) {
          await player?.connect();
        }

        return ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setDescription(
                `${client.emoji.tick} 24/7 Mode has been **enabled** in **${ctx.guild.name}**.`
              )
              .setColor(client.color.main),
          ],
        });
      }
    } catch (error) {
      console.error(error);
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setDescription(
              `${client.emoji.cross} An error occurred while toggling 24/7 mode.`
            )
            .setColor(client.color.red),
        ],
      });
    }
  }
}
