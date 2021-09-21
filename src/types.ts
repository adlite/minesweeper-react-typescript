export interface ICoords {
  y: number;
  x: number;
}

export interface IField {
  id: number;
  coords: ICoords;
  isOpened: boolean;
  hasBomb: boolean;
  hasFlag: boolean;
  bombsAround: number;
}

export interface ISettings {
  level: SettingsLevel;
  fieldsInRow: number;
  bombsCount: number;
}

export enum SettingsLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Expert = 'Expert',
}

export enum GameState {
  Idle = 'Idle',
  Playing = 'Playing',
  Pause = 'Pause',
  GameOver = 'GameOver',
}
