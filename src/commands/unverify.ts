import { SparkCommand, CommandType, Plugins } from '@spark.ts/handler';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import fs from 'fs';

export default new SparkCommand({
  type: CommandType.Slash,
  description: 'Verify your steam key',
  options: [
    {
      name: 'key',
      description: 'The key you would like to verify',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  plugins: [Plugins.Publish()],
  async run({ interaction, args }) {
    if (!interaction.inCachedGuild()) return;

    const key = args.getString('key')!;

    const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    const dataKey: string | undefined = data[key];

    const verifyRole = (await interaction.guild?.roles.fetch())?.find((role) => role.name === 'Club Member');

    if (!verifyRole) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Could not find the role `Club Member`!');

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (!dataKey) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('This key could not be found!');

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    if (dataKey === 'Not Claimed') {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('This key is not claimed!');

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    const newData = {
      ...data,
      [key]: "Not Claimed",
    };

    fs.writeFileSync('data.json', JSON.stringify(newData, null, 2), 'utf-8');

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('✅ Success')
      .setDescription('Successfully unverified you!\nYou no longer the `Club Member` role.');

    try {
      await interaction.member.roles.remove(verifyRole);
    } catch (e) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Error')
        .setDescription('Unable to remove the role `Club Member` to you!');

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
});
