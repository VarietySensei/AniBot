const { Message } = require('discord.js')
const memberSchema = require('../schemas/member-schema')

module.exports = client => {
    client.on('message', message => {
        if (message.author.bot) return
        const { guild, member } = message
        addXP(guild.id, member.id, 23, message)
    })
}

/**
 * @param {number} level 
 * @returns {number} 
 */
const getNeededXP = level => level * level * 100

/**
 * 
 * @param {string} guildId 
 * @param {string} userId 
 * @param {number} xpToAdd 
 * @param {Message} message 
 */
const addXP = async (guildId, userId, xpToAdd, message) => {
    const result = await memberSchema.findOneAndUpdate(
        {
            guildId,
            userId,
        },
        {
            guildId,
            userId,
            $inc: {
                xp: xpToAdd,
            },
        },
        {
            upsert: true,
            new: true,
        }
    )
    
    let { xp, level } = result
    const needed = getNeededXP(level)
    if (xp >= needed) {
        level++
        xp -= needed

        message.reply(`You just advanced to level ${level}!`)

        await memberSchema.updateOne(
            {
                guildId,
                userId,
            },
            {
                level,
                xp,
            }
        )
    }
}

module.exports.addXP = addXP

module.exports.config = {
    displayName: 'levels',
    dbName: 'levels',
    loadDBFirst: true,
}