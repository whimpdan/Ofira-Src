import type { Player, Track } from "lavalink-client";
import serverPremium from "../db/serverPremium.js";
import Bot from "./client.js";
import { ChannelType } from "discord.js";

/**
 *
 * @param {Player} player
 * @param {Track} lastTrack
 * @returns {Promise<void>}
 */
export async function autoPlayFunction(
  player: Player,
  lastTrack?: Track
): Promise<void> {
  if (!player.get("autoplay")) return;
  if (!lastTrack) return;

  if (lastTrack.info.sourceName === "spotify") {
    const filtered = player.queue.previous
      .filter((v) => v.info.sourceName === "spotify")
      .slice(0, 5);
    const ids = filtered.map(
      (v) =>
        v.info.identifier ||
        v.info.uri.split("/")?.reverse()?.[0] ||
        v.info.uri.split("/")?.reverse()?.[1]
    );
    if (ids.length >= 2) {
      const res = await player
        .search(
          {
            query: `seed_tracks=${ids.join(",")}`,
            source: "sprec",
          },
          lastTrack.requester
        )
        .then((response: any) => {
          response.tracks = response.tracks.filter(
            (v: { info: { identifier: string } }) =>
              v.info.identifier !== lastTrack.info.identifier
          );
          return response;
        })
        .catch(console.warn);
      if (res && res.tracks.length > 0)
        await player.queue.add(
          res.tracks
            .slice(0, 5)
            .map((track: { pluginInfo: { clientData: any } }) => {
              track.pluginInfo.clientData = {
                ...(track.pluginInfo.clientData || {}),
                fromAutoplay: true,
              };
              return track;
            })
        );
    }
    return;
  }
  if (
    lastTrack.info.sourceName === "youtube" ||
    lastTrack.info.sourceName === "youtubemusic"
  ) {
    const res = await player
      .search(
        {
          query: `https://www.youtube.com/watch?v=${lastTrack.info.identifier}&list=RD${lastTrack.info.identifier}`,
          source: "youtube",
        },
        lastTrack.requester
      )
      .then((response: any) => {
        response.tracks = response.tracks.filter(
          (v: { info: { identifier: string } }) =>
            v.info.identifier !== lastTrack.info.identifier
        );
        return response;
      })
      .catch(console.warn);
    if (res && res.tracks.length > 0)
      await player.queue.add(
        res.tracks
          .slice(0, 5)
          .map((track: { pluginInfo: { clientData: any } }) => {
            track.pluginInfo.clientData = {
              ...(track.pluginInfo.clientData || {}),
              fromAutoplay: true,
            };
            return track;
          })
      );
    return;
  }
  if (lastTrack.info.sourceName === "jiosaavn") {
    const res = await player.search(
      { query: `jsrec:${lastTrack.info.identifier}`, source: "jsrec" },
      lastTrack.requester
    );
    if (res.tracks.length > 0) {
      const track = res.tracks.filter(
        (v) => v.info.identifier !== lastTrack.info.identifier
      )[0];
      await player.queue.add(track);
    }
    return;
  }

  if (lastTrack.info.sourceName === "deezer") {
    const res = await player.search(
      { query: `dzrec:${lastTrack.info.identifier}`, source: "deezer" },
      lastTrack.requester
    );
    if (res.tracks.length > 0) {
      const track = res.tracks.filter(
        (v) => v.info.identifier !== lastTrack.info.identifier
      )[0];
      await player.queue.add(track);
    }
  }
  return;
}

export async function checkAndRemoveExpiredPremiums(
  client: Bot
): Promise<void> {
  try {
    const now = new Date();

    const expiredServers = await serverPremium.find({
      expiryDate: { $lte: now },
    });

    if (expiredServers.length === 0) {
      client.logger.info("No expired premium servers found.");
      return;
    }

    const deleteResult = await serverPremium.deleteMany({
      expiryDate: { $lte: now },
    });

    client.logger.success(
      `Successfully removed ${deleteResult.deletedCount} expired premium servers.`
    );
  } catch (error) {
    client.logger.error(
      `Error checking and removing expired premiums: ${error}`
    );
  }
}

export async function updateVoiceStatus(player: Player, client: Bot) {
  const voiceChannel = client.channels.cache.get(player.voiceChannelId);

  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) return;

  if (!voiceChannel.permissionsFor(client.user.id)?.has(281474976710656n))
    return;

  const title = player?.queue.current?.info.title || "No music playing";
  const author = player?.queue.current?.info.author || "Unknown author";

  if (player?.playing) {
    client.rest
      .put(`/channels/${voiceChannel.id}/voice-status`, {
        auth: true,
        body: {
          status:
            title.length > 45
              ? `**♬ • ${title.slice(0, 45)}...**`
              : `**♬ • ${title} - ${author}**`,
        },
      })
      .catch(() => null);
  } else {
    client.rest
      .put(`/channels/${voiceChannel.id}/voice-status`, {
        auth: true,
        body: {
          status: null,
        },
      })
      .catch(() => null);
  }
}

import noPrefix from "../db/noPrefix.js";

export async function checkAndRemoveExpiredNoPrefix(client) {
  try {
    const now = Date.now();

    const expiredUsers = await noPrefix.find({
      lifetime: false,
      expiresAt: { $ne: null, $lt: now },
    });

    if (expiredUsers.length === 0) return;

    for (const entry of expiredUsers) {
      await noPrefix.deleteOne({ userId: entry.userId });
      client.logger?.info(`Removed expired NoPrefix from user ${entry.userId}`);
    }
  } catch (err) {
    console.error("Error while removing expired NoPrefix users:", err);
  }
}
