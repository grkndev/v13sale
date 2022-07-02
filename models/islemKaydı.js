const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    memberId: { type: String, default: null },
    sepet: { type: Array, default: [] },
    toplam: { type: Number, default: 0 },
    sonTarih: { type: Date, default: null },
});

module.exports = mongoose.model("islemKaydı", guildSh);