import React from 'react';
import Field from '../Field';
import {GameState, IField, Settings, TimerID} from '../types';
import {formatSeconds, randomNumber} from '../../utils/helpers';

import style from './style.module.css';

interface IProps {}

interface IState {
  fields: IField[];
  timer: number;
  gameState: GameState;
  freeFlagsCount: number;
}

export default class Game extends React.PureComponent<IProps, IState> {
  state = {
    fields: this.generateFields(),
    timer: 0,
    gameState: GameState.Idle,
    freeFlagsCount: 10, // TODO: change it from settings
  };

  timerId!: TimerID;

  get playButtonLabel(): string {
    switch (this.state.gameState) {
      case GameState.Idle:
        return 'Play';
      default:
        return 'Play again';
    }
  }

  get pauseButtonLabel(): string {
    switch (this.state.gameState) {
      case GameState.Pause:
        return 'Continue';
      default:
        return 'Pause';
    }
  }

  play(regenerate: boolean): void {
    // Init game state
    this.setState((state) => ({
      fields: regenerate ? this.generateFields() : state.fields,
      timer: 0,
      gameState: GameState.Playing,
      freeFlagsCount: Settings.BombsCount,
    }));
    // Start timer
    clearInterval(this.timerId);
    this.timerId = setInterval(this.tick.bind(this), 1000);
  }

  continue(): void {
    this.setState((state) => ({
      gameState: GameState.Playing,
    }));
    this.timerId = setInterval(this.tick.bind(this), 1000);
  }

  pause(): void {
    clearInterval(this.timerId);
    this.setState((state) => ({
      gameState: GameState.Pause,
    }));
  }

  tick(): void {
    this.setState((state) => ({
      timer: state.timer + 1,
    }));
  }

  /**
   * Find field in given array of fields by coordinates
   */
  findFieldByCoords(fields: IField[], x: number, y: number): IField | undefined {
    return fields.find((field) => field.coords.y === y && field.coords.x === x);
  }

  /**
   * Checks if given X and Y coordinates are in game field boundaries
   */
  areCoordsInBoundaries(x: number, y: number): boolean {
    return x >= 1 || x <= Settings.FieldsConstraintsX || y >= 1 || y <= Settings.FieldsConstraintsY;
  }

  findAllCoordsAroundField(x: number, y: number): number[][] {
    return [
      [x - 1, y - 1],
      [x, y - 1],
      [x + 1, y - 1],
      [x - 1, y],
      [x + 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x + 1, y + 1],
    ];
  }

  generateFields(): IField[] {
    const fieldsWithBombsIds: Set<number> = new Set();
    const fields: IField[] = [];

    // Random recursive generator for bombs IDs
    const generateRandomBombs = () => {
      fieldsWithBombsIds.add(randomNumber(1, Settings.FieldsCount));
      if (fieldsWithBombsIds.size < Settings.BombsCount) {
        generateRandomBombs();
      }
    };

    generateRandomBombs();

    // Create basic fields with coords
    Array.from(Array(Settings.FieldsCount).keys()).forEach((index) => {
      // Find the coordinates dependent on the index
      const y = Math.floor(index / Settings.FieldsConstraintsY) + 1;
      const x = (index % Settings.FieldsConstraintsX) + 1;
      const id = index + 1;

      // Push basic field
      fields.push({
        id,
        coords: {y, x},
        isOpened: false,
        hasBomb: fieldsWithBombsIds.has(id),
        hasFlag: false,
        bombsAround: 0,
      });
    });

    // Create bombsAround logic
    for (const field of fields) {
      if (field.hasBomb) {
        const {x, y} = field.coords;
        const foundFields: Array<IField | undefined> = [];
        const coordsAroundField = this.findAllCoordsAroundField(x, y);

        for (const [x, y] of coordsAroundField) {
          if (this.areCoordsInBoundaries(x, y)) {
            foundFields.push(this.findFieldByCoords(fields, x, y));
          }
        }

        foundFields.forEach((field) => field && field.bombsAround++);
      }
    }

    return fields;
  }

  handlePlayButtonClick = () => {
    const {gameState} = this.state;
    this.play(gameState === GameState.GameOver || gameState === GameState.Pause);
  };

  handlePauseButtonClick = () => {
    if (this.state.gameState === GameState.Pause) {
      this.continue();
    } else {
      this.pause();
    }
  };

  handleFieldClick = (clickedField: IField) => {
    if (clickedField.hasBomb) {
      // Set game over if clicked field has bomb and open all fields with bombs
      this.setState((state) => ({
        gameState: GameState.GameOver,
        fields: state.fields.map((field) => ({
          ...field,
          isOpened: field.isOpened || field.hasBomb,
        })),
      }));
    } else if (clickedField.bombsAround === 0) {
      const emptiesStack: IField[] = [clickedField];
      const verifiedEmptiesIds = new Set<number>();
      const fieldIdsToOpen = new Set<number>();

      // Recursively check all empty fields around clicked field
      // and save their IDs into fieldIdsToOpen set
      const verifyEmptiesAround = (field: IField) => {
        const {x, y} = field.coords;
        const coordsAround = this.findAllCoordsAroundField(x, y);

        for (const [x, y] of coordsAround) {
          if (this.areCoordsInBoundaries(x, y)) {
            const sibling = this.findFieldByCoords(this.state.fields, x, y);

            if (sibling) {
              fieldIdsToOpen.add(sibling.id);

              if (
                sibling.bombsAround === 0 &&
                !emptiesStack.find(({id}) => id === sibling.id) &&
                !verifiedEmptiesIds.has(sibling.id)
              ) {
                emptiesStack.push(sibling);
              }
            }
          }
        }

        verifiedEmptiesIds.add(field.id);
        emptiesStack.shift();

        if (emptiesStack.length > 0) {
          verifyEmptiesAround(emptiesStack[0]);
        }
      };

      verifyEmptiesAround(clickedField);

      this.setState((state) => ({
        fields: state.fields.map((field) => ({
          ...field,
          isOpened: field.isOpened || fieldIdsToOpen.has(field.id),
        })),
      }));
    } else {
      this.setState((state) => ({
        fields: state.fields.map((field) => ({
          ...field,
          isOpened: field.isOpened || clickedField.id === field.id,
        })),
      }));
    }
  };

  handleSetFlag = (clickedField: IField) => {
    if (this.state.freeFlagsCount === 0) {
      return;
    }

    this.setState((state) => ({
      fields: state.fields.map((field) => ({
        ...field,
        hasFlag: clickedField.id === field.id || field.hasFlag,
      })),
      freeFlagsCount: state.freeFlagsCount - 1,
    }));
  };

  handleDeleteFlag = (clickedField: IField) => {
    this.setState((state) => ({
      fields: state.fields.map((field) => ({
        ...field,
        hasFlag: field.hasFlag && clickedField.id === field.id ? false : field.hasFlag,
      })),
      freeFlagsCount: state.freeFlagsCount + 1,
    }));
  };

  renderFields() {
    return this.state.fields.map((field) => (
      <Field
        key={field.id}
        field={field}
        gameState={this.state.gameState}
        onOpen={this.handleFieldClick}
        onSetFlag={this.handleSetFlag}
        onDeleteFlag={this.handleDeleteFlag}
      />
    ));
  }

  render() {
    const {freeFlagsCount, gameState, timer} = this.state;

    return (
      <div className={style.Game}>
        <section className={style.fields}>{this.renderFields()}</section>
        <aside className={style.aside}>
          <div className={style.stats}>
            <p>Time: {formatSeconds(timer)}</p>
            <p>
              Flags: {freeFlagsCount}/{Settings.BombsCount}
            </p>
          </div>
          <div className={style.buttonWrapper}>
            {gameState === GameState.Playing || (
              <button className={style.button} onClick={this.handlePlayButtonClick}>
                {this.playButtonLabel}
              </button>
            )}
            {(gameState === GameState.Playing || gameState === GameState.Pause) && (
              <button className={style.button} onClick={this.handlePauseButtonClick}>
                {this.pauseButtonLabel}
              </button>
            )}
          </div>
        </aside>
      </div>
    );
  }
}
