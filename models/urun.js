const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    name: { type: String, default: "" },
    desc: { type: String, default: "" },
    ktgry: { type: String, default: "" },
    fiyat: { type: Number, default: 0 },
    foto: { type: String, default: null },
    urunKodu: { type: Number, default: 0 }
});

module.exports = mongoose.model("mals", guildSh);