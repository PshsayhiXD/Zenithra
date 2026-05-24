import type {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ContainerBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import type { RoutedInteractionContext } from "@handlers/interaction/types/persistentInteraction.js";
import type { CreateContainerOptions } from "@utilities/components/types/containerComponent.js";

export type ContainerPaginationUpdateContext =
  | RoutedInteractionContext<ButtonInteraction>
  | RoutedInteractionContext<ModalSubmitInteraction>;

export interface ContainerPaginationOptions {
  instanceId: string;
  pages: CreateContainerOptions["components"][];
  accentColor?: CreateContainerOptions["accentColor"];
  previousLabel?: string;
  nextLabel?: string;
  initialPage?: number;
  onBuild: (result: ContainerPaginationResult) => Promise<void>;
  onUpdate: (context: ContainerPaginationUpdateContext, result: ContainerPaginationResult) => Promise<void>;
}

export interface ContainerPaginationResult {
  container: ContainerBuilder;
  nav: ActionRowBuilder<ButtonBuilder>;
  currentPage: number;
  totalPages: number;
}

export interface ContainerPaginationIds {
  firstId: string;
  prevId: string;
  nextId: string;
  lastId: string;
  pageIndicatorId: string;
  pageModalId: string;
  pageInputId: string;
}
