import {
  ButtonBuilder,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder
} from "@discordjs/builders";

import type {
  CreateContainerOptions,
  SectionDto
} from "@utilities/components/types/containerComponent.js";
import { hashText } from "@utilities/hash.js";

const resolveId = (id: string | number): number =>
  typeof id === "number" ? id : hashText(id);

const resolveColor = (color: string | number): number => {
  if (typeof color === "number") return color;
  const value = color.startsWith("#") ? color.slice(1) : color;
  return Number.parseInt(value, 16);
};

const buildSection = (section: SectionDto): SectionBuilder | TextDisplayBuilder => {
  if (!section.button) {
    return new TextDisplayBuilder().setContent(section.text);
  }
  const builder = new SectionBuilder();
  builder.addTextDisplayComponents(new TextDisplayBuilder().setContent(section.text));
  const button = new ButtonBuilder()
    .setCustomId(section.button.id)
    .setStyle(section.button.style);
  if (section.button.label !== undefined) button.setLabel(section.button.label);
  if (section.button.emoji !== undefined) button.setEmoji({ name: section.button.emoji });
  builder.setButtonAccessory(button);
  return builder;
};

export const createContainer = (options: CreateContainerOptions): ContainerBuilder => {
  const container = new ContainerBuilder();
  if (options.id !== undefined)
    container.setId(resolveId(options.id));
  if (options.accentColor !== undefined)
    container.setAccentColor(resolveColor(options.accentColor));
  const sections = options.components ?? [];
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    if (!section) continue;
    const built = buildSection(section);
    if (built instanceof SectionBuilder) container.addSectionComponents(built);
    else container.addTextDisplayComponents(built);
    if (
      (options.autoSeparators ?? false) &&
      index < sections.length - 1
    ) {
      container.addSeparatorComponents(new SeparatorBuilder());
    }
  }
  return container;
};
