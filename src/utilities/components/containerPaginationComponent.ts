import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputStyle,
} from "discord.js";
import { addButtonRecord } from "@handlers/interaction/buttonInteractionHandler.js";
import { createContainer } from "@utilities/components/containerComponent.js";
import { createModalComponent } from "@utilities/components/modalComponent.js";
import type { ParsedCustomId } from "@handlers/interaction/types/persistentInteraction.js";
import type {
  ContainerPaginationIds,
  ContainerPaginationOptions,
  ContainerPaginationResult,
} from "@utilities/components/types/containerPaginationComponent.js";

const buildIds = (instanceId: string): ContainerPaginationIds => ({
  firstId: `cpag-first:${instanceId}`,
  prevId: `cpag-prev:${instanceId}`,
  nextId: `cpag-next:${instanceId}`,
  lastId: `cpag-last:${instanceId}`,
  pageIndicatorId: `cpag-page:${instanceId}`,
  pageModalId: `cpag-page-modal:${instanceId}`,
  pageInputId: `cpag-page-input:${instanceId}`,
});

const buildParsedCustomId = (
  id: string,
  action: string,
): ParsedCustomId => ({
  raw: id,
  segments: [],
  namespace: "cpag",
  action,
  args: [],
  handlerKey: id,
});

const buildResult = (
  options: ContainerPaginationOptions,
  ids: ContainerPaginationIds,
  page: number,
): ContainerPaginationResult => {
  const totalPages = options.pages.length;
  const components = options.pages[page] ?? [];

  const container = createContainer({
    ...(options.accentColor === undefined ? {} : { accentColor: options.accentColor }),
    components,
  });

  const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ids.firstId)
      .setLabel("⇐")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),
    new ButtonBuilder()
      .setCustomId(ids.prevId)
      .setLabel(options.previousLabel ?? "←")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),
    new ButtonBuilder()
      .setCustomId(ids.pageIndicatorId)
      .setLabel(`Page ${String(page + 1)} / ${String(totalPages)}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(ids.nextId)
      .setLabel(options.nextLabel ?? "→")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId(ids.lastId)
      .setLabel("⇒")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
  );

  return { container, nav, currentPage: page, totalPages };
};

export const createContainerPagination = async (
  options: ContainerPaginationOptions,
): Promise<void> => {
  const ids = buildIds(options.instanceId);
  let currentPage = options.initialPage ?? 0;

  await options.onBuild(buildResult(options, ids, currentPage));

  addButtonRecord({
    customId: ids.firstId,
    onClick: async ({ interaction }) => {
      currentPage = 0;
      await options.onUpdate(
        { interaction, parsedCustomId: buildParsedCustomId(ids.firstId, "first") },
        buildResult(options, ids, currentPage),
      );
    },
  });

  addButtonRecord({
    customId: ids.pageIndicatorId,
    onClick: async ({ interaction }) => {
      const modal = createModalComponent({
        customId: ids.pageModalId,
        title: "Go to page",
        components: [
          {
            customId: ids.pageInputId,
            label: `Page number (1-${String(options.pages.length)})`,
            style: TextInputStyle.Short,
            placeholder: String(currentPage + 1),
            value: String(currentPage + 1),
            minLength: 1,
            maxLength: String(options.pages.length).length,
          },
        ],
        onSubmit: async ({ interaction: modalInteraction }) => {
          const rawPage = modalInteraction.fields.getTextInputValue(ids.pageInputId).trim();
          const requestedPage = Number.parseInt(rawPage, 10);
          if (Number.isNaN(requestedPage)) {
            await modalInteraction.reply({
              content: "Please enter a valid page number.",
              ephemeral: true,
            });
            return;
          }

          currentPage = Math.min(Math.max(requestedPage - 1, 0), options.pages.length - 1);
          await options.onUpdate(
            {
              interaction: modalInteraction,
              parsedCustomId: buildParsedCustomId(ids.pageModalId, "page"),
            },
            buildResult(options, ids, currentPage),
          );
        },
      });
      await interaction.showModal(modal);
    },
  });

  addButtonRecord({
    customId: ids.prevId,
    onClick: async ({ interaction }) => {
      currentPage = Math.max(0, currentPage - 1);
      await options.onUpdate(
        { interaction, parsedCustomId: buildParsedCustomId(ids.prevId, "prev") },
        buildResult(options, ids, currentPage),
      );
    },
  });

  addButtonRecord({
    customId: ids.nextId,
    onClick: async ({ interaction }) => {
      currentPage = Math.min(options.pages.length - 1, currentPage + 1);
      await options.onUpdate(
        { interaction, parsedCustomId: buildParsedCustomId(ids.nextId, "next") },
        buildResult(options, ids, currentPage),
      );
    },
  });

  addButtonRecord({
    customId: ids.lastId,
    onClick: async ({ interaction }) => {
      currentPage = options.pages.length - 1;
      await options.onUpdate(
        { interaction, parsedCustomId: buildParsedCustomId(ids.lastId, "last") },
        buildResult(options, ids, currentPage),
      );
    },
  });
};
