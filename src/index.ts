import { ClusterManager, HeartbeatManager } from "discord-hybrid-sharding";
import config from "./config/token.js";
import Logger from "./structures/logger.js";

const logger = new Logger();

const manager = new ClusterManager(`dist/src/bot.js`, {
  totalShards: "auto",
  shardsPerClusters: 2,
  mode: "process",
  token: config.token,
});

manager.extend(
  new HeartbeatManager({
    interval: 2000,
    maxMissedHeartbeats: 5,
  })
);

manager.on("clusterCreate", (cluster) => {
  logger.success(`Cluster ${cluster.id} has been created.`);
});

manager.on("debug", (info) => {
  logger.debug(`${info}`);
});

manager.on("error", (error) => {
  logger.error(`[Error] ${error}`);
});

manager.on("shardReady", (shardId) => {
  logger.info(`Shard ${shardId} is ready.`);
});

manager.on("shardDisconnect", (event, shardId) => {
  logger.warn(`Shard ${shardId} disconnected. Event: ${event}`);
});

manager.on("shardReconnecting", (shardId) => {
  logger.info(`Shard ${shardId} is reconnecting.`);
});

manager.on("shardResume", (shardId, replayedEvents) => {
  logger.info(`Shard ${shardId} resumed. Replayed events: ${replayedEvents}`);
});

manager.on("shardError", (error, shardId) => {
  logger.error(`Error on shard ${shardId}: ${error}`);
});

manager
  .spawn({ timeout: -1 })
  .then(() => logger.success("Clusters spawned successfully."))
  .catch((error) => logger.error(`Error while spawning clusters: ${error}`));
