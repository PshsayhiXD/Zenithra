export interface PublicShip {
  team_name: string;
  color: string;
  hex_code: string;
  icon_path: string;
  saved: boolean;
  player_count: number;
  time: number;
  owned: boolean;
}

export interface PublicShipList {
  is_muted: boolean;
  max_player_count: number;
  player_count: number;
  ships: Record<number, PublicShip>;
}

export type PublicPersistentShips = PublicShipList;

export type PublicEphemeralShips = PublicShipList;

export interface ShipFromLink {
  valid: true;
  shipName: string;
  shipImage: string | null;
}