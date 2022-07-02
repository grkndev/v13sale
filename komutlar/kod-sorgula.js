const { MessageEmbed, Client, CommandInteraction,MessageActionRow,MessageButton,MessageSelectMenu } = require("discord.js");
const data = require("../models/kodlar");
const moment = require("moment");
const { Permissions } = require("discord.js");
require("moment/locale/tr")
moment.locale("tr");
module.exports = {
  name: "kod-sorgula",
  // default_member_permissions:0x0000000000000008,
  description: "Girdiğiniz promosyon kodunun değerini sorgular",
  type: 1,
  options: [
    {
      name:"kod",description:"Sorgulamak istediğiniz kodu giriniz",type:3,required:true,
    }
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({content:"Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısınız.",ephemeral:true});
    await interaction.reply({embeds:[{title:"Kod sorgulanıyor..."}]});
    var kod = interaction.options.getString("kod");
    var sonuc = await data.findOne({kod});
    if(!sonuc) return interaction.editReply({embeds:[{title:"Kod bulunamadı!"}]});

    interaction.editReply({embeds:[{
      title:"Kod Bulundu: "+kod,
      fields:[
        {name:"Durum",value:sonuc.durum ? "Aktif" : "Pasif",inline:true},
        {name:"Kullanım",value:`${sonuc.kullanım}`,inline:true},
        {name:"Kalan Kullanım Hakkı",value:`${sonuc.maxKullanım-sonuc.kullanım}`,inline:true},
        {name:"Oluşturan Kişi",value:`<@${sonuc.authorId}>`,inline:true},
        {name:"Kod Değeri",value:`${sonuc.deger}TL`,inline:true},
        {name:"Kod Limiti",value:`${sonuc.limit}TL`,inline:true},
        {name:"Oluşturulma tarihi",value:`${moment(sonuc.tarih).format("DD MMM YYYY HH:mm:ss")}\n<t:${parseInt(sonuc.tarih / 1000)}:R>`,inline:false}
      ]
    }]})
  },
};