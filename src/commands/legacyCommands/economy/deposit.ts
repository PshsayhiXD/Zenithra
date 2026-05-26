import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "deposit",
  id: 7,
  category: "economy",
  description: "Deposit dredcoin into your bank (5% fee).",
  aliases: ["dep"],
  args: [
    {
      name: "amount",
      description: "The amount to deposit, or 'all'.",
      type: "string",
      required: true
    }
  ],
  permission: {},
  cooldown: 5,
  dependencies: [
    "tables",
    "components",
    "config.CURRENCY.BASE",
    "config.CURRENCY.FEE_PERCENT",
    "code",
    "currency"
  ],
  execute: async ({ args, deps, cmd, userId, responses, message, isDiscord, isDrednot }): Promise<CommandResult> => {
    const {
      tables,
      components,
      "config.CURRENCY.BASE": base,
      "config.CURRENCY.FEE_PERCENT": feePercent,
      code,
      currency
    } = deps;

    const wallet = tables.Economy.getWallet(userId);
    const bank = tables.Economy.getBank(userId);
    const amount = currency.parseCurrency(args.join(" "));

    if (amount.lte(0))
      return [code.UserDefinedError, "Please specify a valid amount to deposit."];
    if (amount.gt(wallet))
      return [
        code.UserDefinedError,
        `You only have **${currency.formatCurrency(wallet)}** in your wallet.`
      ];

    const feeAmount = amount.mul(feePercent).div(base).floor().mul(base);
    const netDeposit = amount.minus(feeAmount);

    if (bank.bank.plus(netDeposit).gt(bank.bankCapacity))
      return [
        code.UserDefinedError,
        `Your bank capacity is only **${currency.formatCurrency(bank.bankCapacity)}**.`
      ];

    const result = tables.Economy.deposit(userId, amount, feePercent);
    const feeDisplay = currency.decimalToString(feePercent.mul(100));
    const payload = {
      embeds: [
        components.createEmbed({
          title: cmd.name,
          description:
            `Deposited **${currency.formatCurrency(amount)}** (after ${feeDisplay}% fee).\n` +
            `Wallet: **${currency.formatCurrency(result.currency)}**\n` +
            `Bank: **${currency.formatCurrency(result.bank)}**`,
          color: "Green",
          options: {
            timestamp: new Date()
          }
        })
      ]
    };

    if (isDiscord && message) await message.reply(payload);
    if (isDrednot)
      responses?.push(
        `Deposited **${currency.formatCurrency(amount)}** (after ${feeDisplay}% fee).`
      );

    return code.Success;
  }
});
