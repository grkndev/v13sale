const {
  MessageEmbed,
  Client,
  CommandInteraction,Permissions,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");
const data = require("../models/kodlar");
module.exports = {
  name: "kod-üret",
  // default_member_permissions:0x0000000000000008,
  description: "Rastgele kod üretir",
  type: 1,
  options: [
    {
      name: "kullanım",
      description: "Kodu kaç kez kullanılabilir?",
      type: 4,
      required: true,
    },
    {
      name: "değer",
      description: "kod değeri (TL Cinsinden)",
      type: 4,
      required: true,
    },
    {
      name: "limit",
      description: "minimum alışveriş tutarı",
      type: 4,
      required: true,
    },
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({content:"Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısınız.",ephemeral:true});
    await interaction.reply({content:"Kod üretiliyor..."});
    var randomPsw = "";
    var kullanım = interaction.options.getInteger("kullanım");
    var deger = interaction.options.getInteger("değer");
    var limit = interaction.options.getInteger("limit");
    do {
      var character = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      var lengthPsw = 7;
      for (var i = 0; i < lengthPsw; i++) {
        var numPws = Math.floor(Math.random() * character.length);
        randomPsw += character.substring(numPws, numPws + 1);
      }
    } while (await data.findOne({ kod: randomPsw }));

    await data.create({kod:randomPsw,maxKullanım:kullanım,deger,limit,authorId:interaction.member.id,durum:true,tarih:new Date()});
    interaction.editReply({ content: `Kod Üretildi: ${randomPsw}` });
  },
};
