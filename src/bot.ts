import { Bot } from "./structures/index.js";
import config from "./config/token.js";

const client = new Bot();
client.start(config.token);