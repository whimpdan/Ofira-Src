import { Event, type Bot } from "../../structures/index.js";

export default class Raw extends Event {
  constructor(client: Bot, file: string) {
    super(client, file, {
      name: "raw",
    });
  }

  public async run(d: any): Promise<void> {
    this.client.manager.sendRawData(d);
  }
}
