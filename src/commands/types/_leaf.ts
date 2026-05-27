declare const leafSymbol: unique symbol;

export interface Leaf<T> {
  readonly [leafSymbol]: T;
};
