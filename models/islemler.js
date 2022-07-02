const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    memberId: { type: String, default: null },
    channelId: { type: String, default: null },
    sepet: { type: Array, default: [] },
    fiyat: { type: Number, default: 0 },
    yontem: { type: String, default: null },
    tarih: { type: Date, default: null },
    islemTuru: { type: String, default: null },
    islemKodu: { type: Number, default: 0 },
});

module.exports = mongoose.model("islemlers", guildSh);