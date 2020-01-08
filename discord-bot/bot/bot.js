// Libraries
const Discord = require("discord.js")
const config = require("./config.json")
const GroupInventory = require("./api/getClothes")
const client = new Discord.Client()

// Env settings
const GROUP_ID = config.groupId
const PREFIX = config.prefix
const ROLES = config.roleNames

client.on("ready", () => {
    console.log("Clothing bot now loaded.")
})

client.on("message", async(message) => {
    if (message.author.bot) return
    if (!message.member.roles.some(role => ROLES.includes(role.name))) return

    if (message.content.startsWith(PREFIX + "count ")) {
        let username = message.content.split(PREFIX + "count ").pop()

        let msg = await message.channel.send("⏱️ Please wait...")

        let inventory = new GroupInventory(GROUP_ID)
        
        try {
            await inventory.setIdFromUsername(username)

            let owned = await inventory.getOwned()
            if (!owned) 
                return msg.edit(`${username} doesn't own any group items.`)

            return msg.edit(`${username} owns: **${owned}** group items.`)
        } catch (err) {
            if (err.message === "User not found")
                return msg.edit("User not found.")

            return msg.edit("Failure getting clothing count for user.")
        }
    }
})

// Prevent the bot from crashing.
client.on("error", console.error)

client.login(config.token)