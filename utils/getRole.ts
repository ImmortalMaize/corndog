import { RoleManager } from "discord.js";

export const getRole = async (roles: RoleManager, id: string) => roles.cache.get(id) ?? await roles.fetch(id) 