import { createButtonComponent } from "@utilities/components/buttonComponent.js";
import { createContainer } from "@utilities/components/containerComponent.js";
import { createEmbed } from "@utilities/components/embedComponent.js";
import { createModalComponent } from "@utilities/components/modalComponent.js";
import { createPaginationComponent } from "@utilities/components/paginationComponent.js";
import { createSelectComponent } from "@utilities/components/selectComponent.js";

import type {
  AnyContainerComponent,
  ButtonComponentOptions,
  CreateContainerOptions,
  CreateEmbedOptions,
  ModalComponentOptions,
  PaginationOptions,
  SelectComponentOptions,
} from "@utilities/components/types/index.js";

export {
  createButtonComponent,
  createContainer,
  createEmbed,
  createModalComponent,
  createPaginationComponent,
  createSelectComponent,
};

export const components = {
  createButtonComponent,
  createContainer,
  createEmbed,
  createModalComponent,
  createPaginationComponent,
  createSelectComponent,
};
export type Components = typeof components;


export type {
  AnyContainerComponent,
  ButtonComponentOptions,
  CreateContainerOptions,
  CreateEmbedOptions,
  ModalComponentOptions,
  PaginationOptions,
  SelectComponentOptions,
};

export interface ComponentTypes {
  AnyContainerComponent: AnyContainerComponent;
  ButtonComponentOptions: ButtonComponentOptions;
  CreateContainerOptions: CreateContainerOptions;
  CreateEmbedOptions: CreateEmbedOptions;
  ModalComponentOptions: ModalComponentOptions;
  PaginationOptions: PaginationOptions;
  SelectComponentOptions: SelectComponentOptions;
};
