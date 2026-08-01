import { Event, type Bot } from "../../structures/index.js";
import { LavalinkNode } from "lavalink-client";

export default class Disconnect extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "disconnect",
    });
  }
  public async run(node: LavalinkNode): Promise<void> {
    this.client.logger.warn(`The Lavalink Node ${node.id} Disconnected!`);
  }
}
