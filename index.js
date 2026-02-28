require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, Events } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const REQUIRED_STATUS = "discord.gg/tropolia";
const GUILD_ID = "1160254392310714420";
const ROLE_NAME = "Membre Vérifié";

let cachedRole = null;

// ----------------- CLIENT READY -----------------
client.once('clientReady', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
        console.error("Serveur introuvable.");
        return;
    }

    const role = guild.roles.cache.find(r => r.name === ROLE_NAME);

    if (!role) {
        console.error(`Rôle "${ROLE_NAME}" introuvable.`);
        return;
    }

    cachedRole = role;
    console.log(`Rôle "${ROLE_NAME}" chargé avec succès.`);

    // 🔥 Scan complet au démarrage
    console.log("Scan des membres en cours...");

    await guild.members.fetch();

    guild.members.cache.forEach(async member => {

        if (member.user.bot) return;

        const presence = member.presence;
        if (!presence) return;

        const customStatus = presence.activities.find(
            activity => activity.type === ActivityType.Custom
        );

        const hasRequiredStatus = customStatus?.state?.toLowerCase().includes(REQUIRED_STATUS);

        try {

            if (cachedRole.position >= guild.members.me.roles.highest.position) return;
            if (member.roles.highest.position >= guild.members.me.roles.highest.position) return;

            if (hasRequiredStatus && !member.roles.cache.has(cachedRole.id)) {
                await member.roles.add(cachedRole);
                console.log(`Rôle ajouté à ${member.user.tag}`);
            }
            else if (!hasRequiredStatus && member.roles.cache.has(cachedRole.id)) {
                await member.roles.remove(cachedRole);
                console.log(`Rôle retiré à ${member.user.tag}`);
            }

        } catch (err) {
            console.error(`Erreur pour ${member.user.tag} :`, err);
        }
    });

    console.log("Scan terminé.");
});

// ----------------- PRESENCE UPDATE -----------------
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence) return;

    const member = newPresence.member;
    if (!member) return;

    if (member.guild.id !== GUILD_ID) return;
    if (!cachedRole) return;

    const customStatus = newPresence.activities.find(
        activity => activity.type === ActivityType.Custom
    );

    const hasRequiredStatus = customStatus?.state?.toLowerCase().includes(REQUIRED_STATUS);

    try {

        if (cachedRole.position >= member.guild.members.me.roles.highest.position) return;
        if (member.roles.highest.position >= member.guild.members.me.roles.highest.position) return;

        if (hasRequiredStatus && !member.roles.cache.has(cachedRole.id)) {
            await member.roles.add(cachedRole);
            console.log(`Rôle ajouté à ${member.user.tag}`);
        }
        else if (!hasRequiredStatus && member.roles.cache.has(cachedRole.id)) {
            await member.roles.remove(cachedRole);
            console.log(`Rôle retiré à ${member.user.tag}`);
        }

    } catch (err) {
        console.error(`Erreur pour ${member.user.tag} :`, err);
    }
});

client.login(process.env.TOKEN);