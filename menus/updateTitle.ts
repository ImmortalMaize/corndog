import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ReadableCommand } from "../classes";
import net from "../net";
import { getMessage } from "../utils/getMessage";
import { channels } from "../config";

export default new ReadableCommand(new ContextMenuCommandBuilder()
    .setName("Update Title").setType(ApplicationCommandType.Message)
    , async (interaction: ContextMenuCommandInteraction) => {
        const { targetId } = interaction;
        const beep = await net.getBeepById(targetId)
        const message = await getMessage(interaction.channel.messages, targetId);

        if (message.channelId !== channels["finished-beeps"]) {
            interaction.reply({
                ephemeral: true,
                content: "You can only update the title of beeps in the <#"+channels["finished-beeps"]+"> channel!"
            });
        }

        if (message.author.id !== interaction.user.id) {
            interaction.reply({
                ephemeral: true,
                content: "You can only update the title of your own beeps!"
            });
            return;
        }
        
        const titleInput = new TextInputBuilder()
            .setLabel("Title")
            .setStyle(TextInputStyle.Short)
            .setCustomId("title")
            .setRequired(true)
            .setValue(beep.title ?? "");

        const titleRow = new ActionRowBuilder().addComponents(titleInput);
        const modal = new ModalBuilder()
            .setCustomId("updateTitleModal")
            .setTitle("Update Title")
        //@ts-ignore
        await interaction.showModal(modal.addComponents(titleRow)).then(async () => {
            interaction.awaitModalSubmit({
                filter: (modal) => modal.customId === "updateTitleModal",
                time: 60000
            }).then(async modal => {
                const title = modal.fields.getTextInputValue("title");
                await net.updateBeepTitle(targetId, title);
                modal.reply({
                    ephemeral: true,
                    content: "Okay! I updated the title to: " + title + "!"
                });
            });
        })
    })