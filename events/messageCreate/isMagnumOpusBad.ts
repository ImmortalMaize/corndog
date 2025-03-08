import { Message, TextChannel, userMention } from "discord.js"
import { channels } from "../../config"
import { hasHeaders, hasSauce, hasUrl, tracer } from "../../utils"
import { request } from "undici"

/* 
If ya wanna talk about the files do it in this comment - choptop84 (2:43 PM EST 3/4/2025)
So right now it's just the same as isBeepBad but dw I'll make it work.

Magnum Opus is a channel where you can post only one song for every 1-3 months. During testing we'll have it set up to be 30 seconds.
How it should work is like this: 
Everytime a message is posted in the channel. If that person isn't already in the database, The UID of that person who just messaged should be stored, 

Alongside that, it then also gets the current date and then figures out what day it'll be in a month and stores that alongside the UID, 

Then when someone that's already in the database posts a message in #magnum-opus before the alloted time, it'll delete the message and post a warning 
in #bot-commands saying why their message was deleted. It should say something along the lines "Woopsies!! You can't post another Magnum Opus until [Date/Time] ( >ᨓ<)" or something.

In the off-chance that a person that is in the database posts a message AFTER the stored date, their entry is deleted from the database and then stored again like it was in step 1.
There's no need for us to add any moving parts in the code, just having the stuff happen when messages are posted that simplifies everything.

Here's the tasklist right now:
* When a message is posted, check the Messengers UID. If the message is valid and that UID isn't in the database yet then add them to it 
(Easy enough you can borrow from the yoink command for that)

* Alongside the UID, also find the current day/week/month and store what day it'll be in a months time, We don't need specific minutes or hours just the day and month.
(Should go without saying, but for longevity we should also store the year as well)


*/

const reply = async (message: Message, content: string) => {
    const botCommands = (await message.guild.channels.fetch()).get(channels["bot-commands"]) as TextChannel
    const reply = await botCommands.send({
        content: userMention(message.author.id) + content,
    })
    setTimeout(async () => {
        await reply?.delete()
    }, 20000)
}

/**
 * Detects whether or not a message fits within certain criteria. 
 * 
 * This one Specifically checks whether or not a message has a link, whether or not that link is a BeepBox link, 
 * and whether or not a specific user is allowed to post in that channel.
 * @param message The current message to check.
 */
export default async function isOpusBad(message: Message): Promise<boolean> {
    const { cleanContent, attachments } = message
    const urls = cleanContent.match(hasUrl)
    if (!urls) {
        tracer.log("No link = bad!")
        await reply(message, "Where's the link?! > _< (Make sure it starts with https://)")
        return true
    }

    const redirections = await Promise.all(urls?.map(async (url): Promise<string> => (await request(url)).headers.location as unknown as string ?? url))
    tracer.info(redirections)
    const sauce = redirections.some(redirection => redirection.match(hasSauce))
    console.log(sauce)
    const linebreaks = cleanContent.match(/\n/gm)
    const longLink = urls?.some(url => url.length > 100)
    const noAttachments = attachments.size === 0
    const tooLong = cleanContent.length > 450
    const headerFormatting = cleanContent.match(hasHeaders)
    const impatient = 0; // Insert check to see if user is in database and what date it is
    // Should say something like `= isUserInDatabase(message.author.id) ? isUserNotAllowedToPost(message.author.id) : false;` idk yet depends on how this pans out.
    const impatientTime = 0; // Do the same thing the above variable does but instead get the time that's stored.

    tracer.info("New finished beep! Alright let's see...")
    
    if (tooLong) {
        tracer.log("Message length is bad.")
        await reply(message, "The character limit is 450 or under. Yours is " + message.cleanContent.length + "! > _<")
        return true
    }

    if (linebreaks?.length >= 5) {
        tracer.log("Message line breaks are bad.")
        await reply(message, "Too many line breaks! > _<")
        return true
    }

    if (!sauce) {
        tracer.log("No sauce = bad!")
        await reply(message, "I ain't see no SAUCE???!!! > _< (Please link to a whitelisted mod.)")
        return true
    }

    if (longLink) {
        tracer.log("A link is too long. BAD.")
        await reply(message, "Shorten your link(s)...! > _<")
        return true
    }
    if (headerFormatting) {
        tracer.log("NO HEADERS >:(")
        await reply(message, "DON'T USE HEADERS...!!! > _<")
        return true
    }
    if (!noAttachments) {
        tracer.log("ATTACHMENTS ARE BAD!!!")
        await reply(message, "NO ATTACHMENTS RGRGHRHAAAAAAAARGRGHRGHRARHARRR...!!! > _<")
        return true
    }

    if (impatient) {
        tracer.log("WAIT YOUR TURN")
        await reply(message, "HEY YOU CAN'T POST YET RGRGHRHAAAAAAAARGRGHRGHRARHARRR...!!! WAIT UNTIL " + String(impatientTime) + " TO POST AGAIN ( >ᨓ <  )")
        return true
    }

    tracer.info("Looks good!")
    return false
}