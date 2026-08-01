import {
  ActionRowBuilder,
  type AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  CommandInteraction,
  type GuildMember,
  InteractionType,
  PermissionFlagsBits,
  type TextChannel,
  WebhookClient,
} from "discord.js";
import { Context, Event, type Bot } from "../../structures/index.js";
import PremiumServer from "../../db/serverPremium.js";
import IgnoreChannel from "../../db/ignoreChannelSchema.js";

export default class InteractionCreate extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "interactionCreate",
    });
  }

  public async run(
    interaction: CommandInteraction | AutocompleteInteraction
  ): Promise<any> {
    const guild = interaction.guild;
    if (!interaction.inGuild()) return;

    if (
      interaction instanceof CommandInteraction &&
      interaction.type === InteractionType.ApplicationCommand
    ) {
      const { commandName } = interaction;
      const command = this.client.commands.get(interaction.commandName);
      if (!command) return;

      const ctx = new Context(
        interaction as any,
        (interaction as any).options.data
      );
      ctx.setArgs((interaction as any).options.data);

      const requiredPerms = [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.EmbedLinks,
      ];

      const channelPerms = interaction.channel.permissionsFor(
        interaction.guild.members.me!
      );
      const missingPerms = requiredPerms.filter(
        (perm) => !channelPerms?.has(perm)
      );

      if (missingPerms.length > 0) {
        const permNames = missingPerms
          .map((perm) =>
            Object.keys(PermissionFlagsBits).find(
              (key) =>
                PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] ===
                perm
            )
          )
          .join(", ");

        try {
          return await interaction.reply({
            content: `I'm missing the following permissions: **${permNames}**`,
          });
        } catch {
          return await interaction.user
            .send({
              content: `I'm missing permissions in \`${interaction.guild.name}\`: **${permNames}**\nChannel: <#${interaction.channelId}>`,
            })
            .catch(() => null);
        }
      }

      const guildData = await IgnoreChannel.findOne({
        GuildId: interaction.guild.id,
      });
      if (
        guildData &&
        guildData.IgnoredChannels.includes(interaction.channel.id)
      ) {
        return interaction.reply({
          embeds: [
            {
              description:
                "This channel is ignored. Commands cannot be used here.",
              color: 0xff0000,
            },
          ],
          flags: 64,
        });
      }

      if (command.permissions) {
        if (command.permissions.client) {
          if (
            !interaction.guild.members.me.permissions.has(
              command.permissions.client
            )
          )
            return await interaction.reply({
              content:
                "I don't have enough permissions to execute this command.",
            });
        }
        if (command.permissions.user) {
          if (
            !(interaction.member as GuildMember).permissions.has(
              command.permissions.user
            )
          ) {
            return await interaction.reply({
              content: "You don't have enough permissions to use this command.",
              flags: 64,
            });
          }
        }
        if (command.permissions.dev) {
          if (this.client.config.owners) {
            const findDev = this.client.config.owners.find(
              (x) => x === interaction.user.id
            );
            if (!findDev) return;
          }
        }
      }

      if (command.check) {
        const member = ctx.member as GuildMember;
        const guild = ctx.guild;
        const player = this.client.manager.getPlayer(guild.id);
        if (command.check.inVc) {
          if (!member.voice.channel) {
            const embed = this.client
              .embed()
              .setColor(this.client.color.red)
              .setDescription(
                `${this.client.emoji.cross} You need to be in a voice channel to use this command.`
              );
            return ctx.sendMessage({ embeds: [embed] });
          }
        }

        if (command.check.player) {
          if (!player || !player.queue.current) {
            const embed = this.client
              .embed()
              .setColor(this.client.color.red)
              .setDescription(
                `${this.client.emoji.cross} There is no music currently playing.`
              );
            return ctx.sendMessage({ embeds: [embed] });
          }
        }

        if (command.check.sameVc) {
          const clientMember = interaction.guild.members.resolve(
            this.client.user!
          )!;
          if (
            clientMember.voice.channel &&
            clientMember.voice.channelId !== member.voice.channelId
          ) {
            const embed = this.client
              .embed()
              .setColor(this.client.color.red)
              .setDescription(
                `${this.client.emoji.cross} You need to be in the same voice channel as the bot.`
              );
            return ctx.sendMessage({ embeds: [embed] });
          }
        }

        if (command.check.connect) {
          const botPermissions = member.voice.channel.permissionsFor(
            ctx.guild.members.me!
          );
          if (
            !botPermissions?.has("Connect") ||
            !botPermissions?.has("Speak") ||
            !botPermissions?.has("ViewChannel")
          ) {
            return ctx.sendMessage({
              embeds: [
                this.client
                  .embed()
                  .setColor(this.client.color.red)
                  .setDescription(
                    `${this.client.emoji.cross} I don't have permission to join or speak in **${member.voice.channel.name}**.`
                  ),
              ],
            });
          }
        }
      }

      if (command.premium && this.client.config.premium) {
        const premiumData = await PremiumServer.findOne({
          guildId: interaction.guild?.id,
        });
        if (!premiumData) {
          const embed = this.client
            .embed()
            .setDescription("This server does not have premium enabled.")
            .setColor(this.client.color.main);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("Get Premium")
              .setURL(`${this.client.config.pre}`)
              .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
              .setLabel("Support Server")
              .setURL(this.client.config.ssLink)
              .setStyle(ButtonStyle.Link)
          );
          return await interaction.reply({
            embeds: [embed],
            components: [row],
          });
        }
      }

      if (!this.client.cooldown.has(commandName)) {
        this.client.cooldown.set(commandName, new Collection());
      }

      const now = Date.now();
      const timestamps = this.client.cooldown.get(commandName);
      const cooldownAmount = Math.floor(command.cooldown || 5) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;

          if (!timestamps.get(`${interaction.user.id}-notified`)) {
            timestamps.set(`${interaction.user.id}-notified`, true);
            setTimeout(
              () => timestamps.delete(`${interaction.user.id}-notified`),
              cooldownAmount
            );

            return await interaction.reply({
              content: `Please wait ${timeLeft.toFixed(
                1
              )} more second(s) before reusing the \`${commandName}\` command.`,
              flags: 64,
            });
          }
          return;
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        const cname = interaction.channel as TextChannel;
        const commandlogs = new WebhookClient({
          url: `${this.client.config.cmd_log}`,
        });
        commandlogs.send({
          embeds: [
            this.client
              .embed()
              .setTitle(`Slash Command Logs`)
              .setColor(this.client.color.main)
              .setAuthor({
                name: `${this.client.user?.username}`,
                iconURL: this.client.user?.displayAvatarURL(),
              })
              .addFields([
                {
                  name: `Information`,
                  value: `Command Author: ${interaction.user.tag}\nCommand Name: \`${command.name}\`\nChannel Id: ${interaction.channel.id}\nChannel Name: ${cname.name}\nGuild Name: ${interaction.guild.name}\nGuild Id: ${interaction.guild.id}`,
                },
              ])
              .setThumbnail(interaction.guild.iconURL()!),
          ],
        });

        await command.run(this.client, ctx, ctx.args);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
