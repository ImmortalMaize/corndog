import { config } from "../config";

export const hasSauce = new RegExp("/(" + config.modWhitelist.map(mod => mod).join("|") + ")\/.+" + "/g")