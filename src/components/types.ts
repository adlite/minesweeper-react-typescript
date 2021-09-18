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

export enum Settings {
  FieldsCount = 64,
  FieldsConstraintsX = 8,
  FieldsConstraintsY = 8,
  BombsCount = 10,
}

export enum GameState {
  Idle = 'Idle',
  Playing = 'Playing',
  Pause = 'Pause',
  GameOver = 'GameOver',
}

export type TimerID = ReturnType<typeof setTimeout>;
