const { MessageEmbed, Client, CommandInteraction,Permissions } = require("discord.js");
const data = require("../models/urun");
module.exports = {
  name: "ürün-sil",
  description: "Ürün siler",
  default_member_permissions:0x0000000000000008,
  type: 1,
  options: [
    {
      name: "ürün-kodu",
      description: "ürün kodu",
      type: 4,
      required: true,
    }
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({content:"Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısınız.",ephemeral:true});
    let kod = interaction.options.getInteger("ürün-kodu");
    let urun = await data.findOne({urunKodu:kod });
    if(!urun) return interaction.reply({content:"Ürün Bulunamadı"});

      await data.deleteOne({urunKodu:kod})
      interaction.reply({embeds:[{
        title: "Ürün Silindi",
        color:"GREEN",
        description: `${kod} kodlu ürün silindi.`,
      }]})
    
  },
};
