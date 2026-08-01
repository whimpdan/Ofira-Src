import { Command, type Context, type Bot } from "../../structures/index.js";
import { GuildMember } from "discord.js";

export default class Join extends Command {
  constructor(client: Bot) {
    super(client, {
      name: "join",
      description: {
        content: "Makes the bot join your voice channel.",
        examples: ["join"],
        usage: "join",
      },
      category: "Music",
      aliases: ["j"],
      cooldown: 3,
      args: false,

      permissions: {
        dev: false,
        client: [
          "Connect",
          "Speak",
          "SendMessages",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: [],
      },
      check: {
        inVc: true,
        connect: true,
      },
      slashCommand: true,
      options: [],
    });
  }

  public async run(client: Bot, ctx: Context): Promise<any> {
    const member = ctx.member as GuildMember;

    if (ctx.guild.members.me?.voice.channelId) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} I am already in a voice channel.`
            ),
        ],
      });
    }
    if (!member.voice.channel) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} You must be in a voice channel to use this command.`
            ),
        ],
      });
    }
    let player = client.manager.getPlayer(ctx.guild.id);
    if (player) {
      return ctx.sendMessage({
        embeds: [
          client
            .embed()
            .setColor(client.color.red)
            .setDescription(
              `${client.emoji.cross} I am already in a voice channel. <#${player.voiceChannelId}>`
            ),
        ],
      });
    }

    player = client.manager.createPlayer({
      guildId: ctx.guild?.id,
      voiceChannelId: member.voice?.channelId,
      textChannelId: ctx.channel?.id,
      selfDeaf: true,
      volume: 80,
    });

    if (!player?.connected) {
      await player?.connect().catch((error) => {
        client.logger.error(error);
      });
    }
    return ctx.sendMessage({
      embeds: [
        client
          .embed()
          .setColor(client.color.main)
          .setDescription(
            `${client.emoji.tick} Joined **${member.voice.channel.name}**.`
          ),
      ],
    });
  }
}
