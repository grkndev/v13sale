const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { Client, MessageEmbed } = require('discord.js');
const client = new Client({ intents: 919 });
const fs = require("fs");
const mongoose = require("mongoose");
const { token, mongoDB} = require("./ayarlar.json");

mongoose.connect(mongoDB)
  .then(() => console.log("MongoDB bağlantısı başarılı"))
  .catch(err => console.log("Mongo bağlantısı başarısız oldu: " + err));

global.client = client;
client.commands = (global.commands = []);
//#region KOMUTLAR LOAD
fs.readdir("./komutlar/", (err, files) => {
  if (err) throw err;

  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    let props = require(`./komutlar/${file}`);

    client.commands.push({
      name: props.name.toLowerCase(),
      description: props.description,
      options: props.options ? props.options : [],
      type: 1,
      dm_permission: false,
    })
    console.log(`👌 Slash Komut Yüklendi: ${props.name}`);
  });
});
//#endregion
//#region EVENTS LOAD
fs.readdir("./events/", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];

    console.log(`👌 Event yüklendi: ${eventName}`);
    client.on(eventName, (...args) => {
      event(client, ...args);
    });
  });
});
//#endregion
//#region KOMUTLAR SET
client.on("ready", async () => {

  console.log("Ready!");
  client.user.setActivity("RabeL 💖 discord", { type: "WATCHING" });
  const rest = new REST({ version: "10" }).setToken(token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    })
  } catch (error) {
    console.error(error);
  }
});
//#endregion
client.login(token);