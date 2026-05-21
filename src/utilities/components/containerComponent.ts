import {
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder
} from "discord.js";
import type { CreateContainerOptions } from "@utilities/components/types/containerComponent.js";
import { hashText } from "@utilities/crypto.js";

const resolveId = (id: string | number): number => {
  if (typeof id === "number") return id;
  return hashText(id);
};

export const createContainer = (options: CreateContainerOptions): ContainerBuilder => {
  const container = new ContainerBuilder();
  if (options.id !== undefined) container.setId(resolveId(options.id));
  if (options.accentColor !== undefined) {
    const resolvedColor = typeof options.accentColor === "string"
      ? Number.parseInt(options.accentColor.replace("#", ""), 16)
      : options.accentColor;
    container.setAccentColor(resolvedColor);
  }

  if ((options.components?.length) !== undefined) {
    for (const [index, component] of options.components.entries()) {
      if (component instanceof SectionBuilder) container.addSectionComponents(component);
      else if (component instanceof SeparatorBuilder) container.addSeparatorComponents(component);
      else if (component instanceof TextDisplayBuilder) container.addTextDisplayComponents(component);
      if ((options.autoSeparators ?? false) && index < options.components.length - 1) container.addSeparatorComponents(new SeparatorBuilder());
    }
  }

  return container;
};

export default createContainer;
