const { MessageEmbed, Client, CommandInteraction,MessageActionRow,MessageButton,MessageSelectMenu } = require("discord.js");
const sepet = require("../models/sepet");
module.exports = {
  name: "ping",
  description: "botun gecikme değeri",
  type: 1,
  options: [],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    interaction.reply({content:`${client.ws.ping}ms`})
  },
};
