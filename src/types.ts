export type FieldCoords = [number, number];
export type FieldsMap = Map<string, IField>;

export interface IField {
  id: number;
  coords: FieldCoords;
  isOpened: boolean;
  hasBomb: boolean;
  hasFlag: boolean;
  bombsAround: number;
}

export interface ISettings {
  level: SettingsLevel;
  bombsCount: number;
  xFieldsCount: number;
  yFieldsCount: number;
}

export enum SettingsLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
  SuperExpert = 'SuperExpert',
}

export enum GameState {
  Idle = 'Idle',
  Playing = 'Playing',
  Pause = 'Pause',
  GameOver = 'GameOver',
}
