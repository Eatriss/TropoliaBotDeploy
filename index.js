require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

// ====== SERVEUR WEB POUR RENDER ======
app.get('/', (req, res) => {
    res.send('TropoliaBot is running 🚀');
});

app.listen(PORT, () => {
    console.log(`Web server started on port ${PORT}`);
});

// ====== BOT DISCORD ======
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
    const roleName = "Membre Vérifié";
    const role = member.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
        console.log("Rôle introuvable.");
        return;
    }

    try {
        await member.roles.add(role);
        console.log(`Rôle ajouté à ${member.user.tag}`);
    } catch (error) {
        console.error("Erreur lors de l'ajout du rôle :", error);
    }
});

client.login(process.env.DISCORD_TOKEN);