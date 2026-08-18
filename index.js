require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

// =====================================================
// BOT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =====================================================
// DEPARTMENT AUTO ROLES
// =====================================================

const SHARED_ROLE_ID = '1536591583787491328';

const DEPARTMENTS = [

    {
        name: 'MPD',
        serverId: '1521605419150082191',
        teamRoleId: '1535505826150744115',
        hubRoleId: '1524945436429910176'
    },

    {
        name: 'MFD',
        serverId: '1520740141289963541',
        teamRoleId: '1520776044649512980',
        hubRoleId: '1524945343928860795'
    },

    {
        name: 'MSP',
        serverId: '1534619164600172685',
        teamRoleId: '1534629268510871603',
        hubRoleId: '1524945242116198543'
    },

    {
        name: 'HSCO',
        serverId: '1521605689393549404',
        teamRoleId: '1528230113358118972',
        hubRoleId: '1524945125736841347'
    },

    {
        name: 'MNDOT',
        serverId: '1525583924481229021',
        teamRoleId: '1525583924636418107',
        hubRoleId: '1524945525349028011'
    }

];

// =====================================================
// MPD TICKET CONFIG
// =====================================================

const MPD_SUPPORT_CHANNEL_ID =
    '1522331186234392677';

const MPD_GENERAL_ROLE_ID =
    '1535494229894365194';

const MPD_HIGH_RANKING_ROLE_ID =
    '1536814483656147044';

const MPD_GENERAL_CATEGORY_ID =
    '1526369213835378708';

const MPD_HIGH_RANKING_CATEGORY_ID =
    '1536815915830874222';

// =====================================================
// BOT READY
// =====================================================

client.once('ready', async () => {

    console.log('====================================');
    console.log(`🤖 ${client.user.tag}`);
    console.log('🟢 Bot is online');
    console.log('====================================');

    await sendMPDPanel();

});

// =====================================================
// MPD SUPPORT PANEL
// =====================================================

async function sendMPDPanel() {

    try {

        const channel =
            await client.channels.fetch(
                MPD_SUPPORT_CHANNEL_ID
            );

        if (!channel) {

            console.log(
                '❌ MPD support channel not found.'
            );

            return;

        }

        const embed =
            new EmbedBuilder()

                .setTitle(
                    'Minneapolis Police Department Support'
                )

                .setDescription(

                    'Welcome to the **Minneapolis Police Department** support desk. Below are listed the types of tickets you can open. Misusing this support system will result in punishment, please do not ping any staff members when opening a ticket.\n\n' +

                    '### 🛠️ General Support\n\n' +

                    '- For all other department-related assistance.\n' +
                    '- Questions & Information\n' +
                    '- Department Support\n' +
                    '- Division Support\n' +
                    '- Technical Assistance\n' +
                    '- Other Requests\n\n' +

                    '### ⭐ High Ranking Support\n\n' +

                    '- Major Department Issues\n' +
                    '- Appeals\n' +
                    '- Reinstatements\n' +
                    '- Fast Pass Requests\n' +
                    '- Executive Staff Assistance'

                )

                .setColor(0xED4245)

                .setFooter({
                    text:
                        'Minneapolis Police Department'
                });

        const buttons =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            'mpd_general_ticket'
                        )
                        .setLabel(
                            'General Support'
                        )
                        .setEmoji('🛠️')
                        .setStyle(
                            ButtonStyle.Danger
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            'mpd_hr_ticket'
                        )
                        .setLabel(
                            'High Ranking Support'
                        )
                        .setEmoji('⭐')
                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

        const messages =
            await channel.messages.fetch({
                limit: 50
            });

        const existing =
            messages.find(
                message =>
                    message.author.id ===
                        client.user.id &&
                    message.embeds.length > 0 &&
                    message.embeds[0].title ===
                        'Minneapolis Police Department Support'
            );

        if (!existing) {

            await channel.send({

                embeds: [
                    embed
                ],

                components: [
                    buttons
                ]

            });

            console.log(
                '✅ MPD support panel created.'
            );

        } else {

            console.log(
                '✅ MPD support panel already exists.'
            );

        }

    } catch (error) {

        console.error(
            '❌ MPD PANEL ERROR:',
            error
        );

    }

}

// =====================================================
// AUTO ROLE SYSTEM
// =====================================================

client.on(
    'guildMemberUpdate',
    async (oldMember, newMember) => {

        try {

            const department =
                DEPARTMENTS.find(
                    dept =>
                        dept.serverId ===
                        newMember.guild.id
                );

            if (!department) return;

            const hadTeamRole =
                oldMember.roles.cache.has(
                    department.teamRoleId
                );

            const hasTeamRole =
                newMember.roles.cache.has(
                    department.teamRoleId
                );

            if (
                hadTeamRole ===
                hasTeamRole
            ) {

                return;

            }

            console.log(
                `🔄 ${department.name} role changed for ${newMember.user.tag}`
            );

            // Find Hub
            const hub =
                client.guilds.cache.find(
                    guild =>
                        guild.roles.cache.has(
                            department.hubRoleId
                        )
                );

            if (!hub) {

                console.log(
                    `❌ Hub not found for ${department.name}`
                );

                return;

            }

            let hubMember;

            try {

                hubMember =
                    await hub.members.fetch(
                        newMember.id
                    );

            } catch {

                console.log(
                    `⚠️ ${newMember.user.tag} is not in the Department Hub.`
                );

                return;

            }

            const departmentRole =
                hub.roles.cache.get(
                    department.hubRoleId
                );

            const sharedRole =
                hub.roles.cache.get(
                    SHARED_ROLE_ID
                );

            if (!departmentRole) {

                console.log(
                    `❌ ${department.name} Hub role not found.`
                );

                return;

            }

            // =================================================
            // ADD ROLE
            // =================================================

            if (
                !hadTeamRole &&
                hasTeamRole
            ) {

                if (
                    !hubMember.roles.cache.has(
                        department.hubRoleId
                    )
                ) {

                    await hubMember.roles.add(
                        departmentRole
                    );

                    console.log(
                        `✅ Added ${department.name} role to ${newMember.user.tag}`
                    );

                }

                if (
                    sharedRole &&
                    !hubMember.roles.cache.has(
                        SHARED_ROLE_ID
                    )
                ) {

                    await hubMember.roles.add(
                        sharedRole
                    );

                    console.log(
                        `✅ Added shared department role`
                    );

                }

                return;

            }

            // =================================================
            // REMOVE ROLE
            // =================================================

            if (
                hadTeamRole &&
                !hasTeamRole
            ) {

                if (
                    hubMember.roles.cache.has(
                        department.hubRoleId
                    )
                ) {

                    await hubMember.roles.remove(
                        departmentRole
                    );

                    console.log(
                        `🗑️ Removed ${department.name} role`
                    );

                }

                // Check other departments
                let stillInDepartment = false;

                for (
                    const other of DEPARTMENTS
                ) {

                    if (
                        other.name ===
                        department.name
                    ) {

                        continue;

                    }

                    const otherGuild =
                        client.guilds.cache.get(
                            other.serverId
                        );

                    if (!otherGuild) continue;

                    try {

                        const otherMember =
                            await otherGuild.members.fetch(
                                newMember.id
                            );

                        if (
                            otherMember.roles.cache.has(
                                other.teamRoleId
                            )
                        ) {

                            stillInDepartment = true;

                            break;

                        }

                    } catch {}

                }

                // Remove shared role if no departments remain
                if (
                    !stillInDepartment &&
                    sharedRole &&
                    hubMember.roles.cache.has(
                        SHARED_ROLE_ID
                    )
                ) {

                    await hubMember.roles.remove(
                        sharedRole
                    );

                    console.log(
                        `🗑️ Removed shared department role`
                    );

                }

            }

        } catch (error) {

            console.error(
                '❌ AUTO ROLE ERROR:',
                error
            );

        }

    }
);

// =====================================================
// MPD TICKET CREATION
// =====================================================

async function createMPDTicket(
    interaction,
    type
) {

    const isHR =
        type === 'hr';

    const categoryId =
        isHR
            ? MPD_HIGH_RANKING_CATEGORY_ID
            : MPD_GENERAL_CATEGORY_ID;

    const staffRoleId =
        isHR
            ? MPD_HIGH_RANKING_ROLE_ID
            : MPD_GENERAL_ROLE_ID;

    const ticketName =
        isHR
            ? 'High Ranking'
            : 'General Support';

    try {

        const existing =
            interaction.guild.channels.cache.find(
                channel =>
                    channel.type ===
                        ChannelType.GuildText &&
                    channel.topic ===
                        `MPD-${type}-${interaction.user.id}`
            );

        if (existing) {

            return interaction.reply({

                content:
                    `❌ You already have an MPD ticket: ${existing}`,

                ephemeral: true

            });

        }

        const ticket =
            await interaction.guild.channels.create({

                name:
                    `mpd-${type}-${interaction.user.username}`
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9-]/g,
                            ''
                        )
                        .substring(0, 80),

                type:
                    ChannelType.GuildText,

                parent:
                    categoryId,

                topic:
                    `MPD-${type}-${interaction.user.id}`,

                permissionOverwrites: [

                    {
                        id:
                            interaction.guild.roles
                                .everyone.id,

                        deny: [
                            PermissionsBitField.Flags
                                .ViewChannel
                        ]

                    },

                    {
                        id:
                            interaction.user.id,

                        allow: [
                            PermissionsBitField.Flags
                                .ViewChannel,

                            PermissionsBitField.Flags
                                .SendMessages,

                            PermissionsBitField.Flags
                                .ReadMessageHistory
                        ]

                    },

                    {
                        id:
                            staffRoleId,

                        allow: [
                            PermissionsBitField.Flags
                                .ViewChannel,

                            PermissionsBitField.Flags
                                .SendMessages,

                            PermissionsBitField.Flags
                                .ReadMessageHistory
                        ]

                    }

                ]

            });

        const description =
            isHR

                ?

                `Welcome ${interaction.user}!\n\n` +

                '**Member Information**\n' +
                `Username: ${interaction.user.tag}\n` +
                `User ID: ${interaction.user.id}\n\n` +

                '**High Ranking Support**\n' +
                'Please provide **everything** related to your request.\n\n' +

                'Include:\n' +
                '• What happened\n' +
                '• What you are requesting\n' +
                '• Relevant dates/times\n' +
                '• People involved\n' +
                '• Supporting evidence\n' +
                '• Any other relevant information\n\n' +

                '**Requests Include:**\n' +
                '• Major Department Issues\n' +
                '• Appeals\n' +
                '• Reinstatements\n' +
                '• Fast Pass Requests\n' +
                '• Executive Staff Assistance\n\n' +

                '**Status:** 🟡 Unclaimed'

                :

                `Welcome ${interaction.user}!\n\n` +

                '**Member Information**\n' +
                `Username: ${interaction.user.tag}\n` +
                `User ID: ${interaction.user.id}\n\n` +

                '**General Support**\n' +
                'Please explain what you need help with.\n\n' +

                'You may use this ticket for:\n' +
                '• Questions & Information\n' +
                '• Department Support\n' +
                '• Division Support\n' +
                '• Technical Assistance\n' +
                '• Other Requests\n\n' +

                '**Status:** 🟡 Unclaimed';

        const embed =
            new EmbedBuilder()

                .setTitle(
                    isHR
                        ? '⭐ MPD High Ranking Support'
                        : '🛠️ MPD General Support'
                )

                .setDescription(
                    description
                )

                .setColor(
                    0xED4245
                )

                .setTimestamp();

        const buttons =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `mpd_claim_${type}`
                        )
                        .setLabel(
                            'Claim'
                        )
                        .setEmoji('📌')
                        .setStyle(
                            ButtonStyle.Primary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `mpd_close_${type}`
                        )
                        .setLabel(
                            'Close'
                        )
                        .setEmoji('🔒')
                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

        // Ping staff
        await ticket.send({

            content:
                `<@&${staffRoleId}>`,

            allowedMentions: {

                roles: [
                    staffRoleId
                ]

            },

            embeds: [
                embed
            ],

            components: [
                buttons
            ]

        });

        await interaction.reply({

            content:
                `✅ Your MPD ${ticketName} ticket has been created: ${ticket}`,

            ephemeral: true

        });

        console.log(
            `✅ MPD ${ticketName} ticket created.`
        );

    } catch (error) {

        console.error(
            '❌ MPD TICKET ERROR:',
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                content:
                    `❌ Ticket creation failed:\n\`${error.message}\``,

                ephemeral: true

            });

        }

    }

}

// =====================================================
// INTERACTIONS
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) {
            return;
        }

        // =================================================
        // GENERAL TICKET
        // =================================================

        if (
            interaction.customId ===
            'mpd_general_ticket'
        ) {

            await createMPDTicket(
                interaction,
                'general'
            );

            return;

        }

        // =================================================
        // HR TICKET
        // =================================================

        if (
            interaction.customId ===
            'mpd_hr_ticket'
        ) {

            await createMPDTicket(
                interaction,
                'hr'
            );

            return;

        }

        // =================================================
        // CLAIM
        // =================================================

        if (
            interaction.customId ===
                'mpd_claim_general' ||

            interaction.customId ===
                'mpd_claim_hr'
        ) {

            const isHR =
                interaction.customId ===
                'mpd_claim_hr';

            const staffRoleId =
                isHR
                    ? MPD_HIGH_RANKING_ROLE_ID
                    : MPD_GENERAL_ROLE_ID;

            if (
                !interaction.member.roles.cache.has(
                    staffRoleId
                )
            ) {

                return interaction.reply({

                    content:
                        '❌ You do not have permission to claim this ticket.',

                    ephemeral: true

                });

            }

            const oldEmbed =
                interaction.message.embeds[0];

            const oldDescription =
                oldEmbed.description || '';

            const newDescription =
                oldDescription.replace(
                    '🟡 Unclaimed',
                    `🟢 Claimed by ${interaction.user}`
                );

            const newEmbed =
                EmbedBuilder
                    .from(oldEmbed)
                    .setDescription(
                        newDescription
                    );

            await interaction.message.edit({

                embeds: [
                    newEmbed
                ]

            });

            await interaction.reply({

                content:
                    `📌 ${interaction.user} claimed this ticket.`

            });

            return;

        }

        // =================================================
        // CLOSE
        // =================================================

        if (
            interaction.customId ===
                'mpd_close_general' ||

            interaction.customId ===
                'mpd_close_hr'
        ) {

            const isHR =
                interaction.customId ===
                'mpd_close_hr';

            const staffRoleId =
                isHR
                    ? MPD_HIGH_RANKING_ROLE_ID
                    : MPD_GENERAL_ROLE_ID;

            if (
                !interaction.member.roles.cache.has(
                    staffRoleId
                )
            ) {

                return interaction.reply({

                    content:
                        '❌ You do not have permission to close this ticket.',

                    ephemeral: true

                });

            }

            await interaction.reply({

                content:
                    '🔒 Closing ticket...',

                ephemeral: true

            });

            setTimeout(
                async () => {

                    try {

                        await interaction.channel.delete();

                    } catch (error) {

                        console.error(
                            '❌ CLOSE ERROR:',
                            error
                        );

                    }

                },
                1500
            );

        }

    }
);

// =====================================================
// ERRORS
// =====================================================

client.on(
    'error',
    error => {

        console.error(
            '❌ DISCORD ERROR:',
            error
        );

    }
);

process.on(
    'unhandledRejection',
    error => {

        console.error(
            '❌ UNHANDLED ERROR:',
            error
        );

    }
);

// =====================================================
// LOGIN
// =====================================================

if (!process.env.TOKEN) {

    console.error(
        '❌ TOKEN IS MISSING FROM .env'
    );

    process.exit(1);

}

client.login(
    process.env.TOKEN
);