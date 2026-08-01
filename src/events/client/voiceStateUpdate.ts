import {
  ChannelType,
  type VoiceState,
  type GuildMember,
  Collection,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";
import { Event, type Bot } from "../../structures/index.js";
import AutoReconnect from "../../db/247.js";

export default class VoiceStateUpdate extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "voiceStateUpdate",
    });
  }

  public async run(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const guild = newState.guild;
    if (!guild) return;

    const player = this.client.manager.getPlayer(guild.id);
    if (!player || !player.voiceChannelId) return;

    const botVoiceState = guild.members.me?.voice;

    if (
      !botVoiceState?.channelId ||
      botVoiceState.channelId !== player.voiceChannelId
    ) {
      await player.destroy();
      return;
    }

    let type: "join" | "leave" | "move" | null = null;

    if (!oldState.channelId && newState.channelId) {
      type = "join";
    } else if (oldState.channelId && !newState.channelId) {
      type = "leave";
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      type = "move";
    }

    if (type === "join") {
      this.handlers.join(newState, this.client);
    } else if (type === "leave") {
      this.handlers.leave(oldState, this.client);
    } else if (type === "move") {
      this.handlers.move(newState, this.client);
    }
  }

  handlers = {
    async join(newState: VoiceState, client: Bot) {
      await new Promise((r) => setTimeout(r, 3000));
      const bot = newState.guild.members.me?.voice;
      if (!bot?.channelId) return;

      const player = client.manager.getPlayer(newState.guild.id);
      if (!player || player.voiceChannelId !== bot.channelId) return;

      if (
        bot.channel?.type === ChannelType.GuildStageVoice &&
        bot.suppress &&
        bot.channel.permissionsFor(bot.member!)?.has("MuteMembers")
      ) {
        await bot.setSuppressed(false);
      }

      if (newState.id === client.user.id && !newState.serverDeaf) {
        const permissions = bot.channel?.permissionsFor(
          newState.guild.members.me!
        );
        if (permissions?.has("DeafenMembers")) {
          await newState.setDeaf(true);
        }
      }

      if (newState.id === client.user.id) {
        if (newState.serverMute && !player.paused) player.pause();
        else if (!newState.serverMute && player.paused) player.resume();
      }
    },

    async leave(oldState: VoiceState, client: Bot) {
      const player = client.manager.getPlayer(oldState.guild.id);
      if (!player || !player.voiceChannelId) return;

      const vc = oldState.guild.channels.cache.get(player.voiceChannelId);
      if (!vc?.isVoiceBased()) return;

      const members = vc.members as Collection<string, GuildMember>;
      const nonBots = members.filter((m) => !m.user.bot);

      if (nonBots.size === 0) {
        setTimeout(async () => {
          const updatedVC = oldState.guild.channels.cache.get(
            player.voiceChannelId
          );
          if (!updatedVC?.isVoiceBased()) return;

          const updatedMembers = updatedVC.members as Collection<
            string,
            GuildMember
          >;
          const updatedNonBots = updatedMembers.filter((m) => !m.user.bot);

          if (updatedNonBots.size === 0) {
            const data = await AutoReconnect.findOne({
              GuildId: oldState.guild.id,
            });

            if (!data) {
              player.destroy();

              const channel = oldState.guild.channels.cache.get(
                player.textChannelId!
              );

              const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel("Invite Me")
                  .setURL(`${client.config.invite}`)
                  .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                  .setLabel("Support Server")
                  .setURL(`${client.config.ssLink}`)
                  .setStyle(ButtonStyle.Link)
              );

              if (channel?.isTextBased()) {
                channel.send({
                  embeds: [
                    client
                      .embed()
                      .setColor(client.color.red)
                      .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL(),
                      })
                      .setDescription(
                        "The bot has been disconnected from the voice channel because there were no users for last **3 minutes**.\n\nTo keep the bot in VC, enable **24/7 mode** using the `247` command."
                      ),
                  ],
                  components: [row],
                });
              }
            } else {
              player.stopPlaying(true, false);
            }
          }
        }, 3 * 60 * 1000);
      }
    },

    async move(newState: VoiceState, client: Bot) {
      await new Promise((r) => setTimeout(r, 3000));
      const bot = newState.guild.members.me?.voice;
      if (!bot?.channelId) return;

      if (
        bot.channel?.type === ChannelType.GuildStageVoice &&
        bot.suppress &&
        bot.channel.permissionsFor(bot.member!)?.has("MuteMembers")
      ) {
        await bot.setSuppressed(false);
      }
    },
  };
}
