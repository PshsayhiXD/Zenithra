export interface Item {
  id: number;
  iconPath?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  usable?: boolean;
  use?: (context: ItemContext) => Promise<void>;
}

export interface ItemContext {
  userId: string;
  item: Item;
  quantity?: number;
  args: string[];
}