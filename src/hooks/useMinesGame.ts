import {useEffect, useState} from 'react';
import {GameState, IField, Settings} from '../types';
import {formatSeconds, randomNumber} from '../utils/helpers';
import useInterval from './useInterval';

export default function useMinesGame() {
  // State of the game
  const [fields, setFields] = useState<IField[]>(generateFields()); // array of game fields
  const [fieldsOpened, setFieldsOpened] = useState<number>(0); // array of game fields which has been opened
  const [timer, setTimer] = useState<number>(0); // time in seconds spent on the game
  const [formattedTimer, setFormattedTimer] = useState<string>('00:00'); // formatted HH:MM:SS `timer`
  const [gameState, setGameState] = useState<GameState>(GameState.Idle); // current state of the game
  const [freeFlagsCount, setFreeFlagsCount] = useState<number>(10); // the number of flags remaining with the player

  // Run `setInterval` every time when `gameState` is GameState.Playing
  useInterval(
    () => {
      setTimer(timer + 1);
    },
    gameState === GameState.Playing ? 1000 : null,
  );

  // Format seconds on each `timer` change
  useEffect(() => {
    setFormattedTimer(formatSeconds(timer));
  }, [timer]);

  // Check game win state
  useEffect(() => {
    if (fieldsOpened + Settings.BombsCount === Settings.FieldsCount) {
      alert('Congratulations! You won!');
      setGameState(GameState.GameOver);
    }
  }, [fieldsOpened]);

  // Public methods
  function play(regenerate: boolean): void {
    setFields(regenerate ? generateFields() : fields);
    setFieldsOpened(0);
    setTimer(0);
    setGameState(GameState.Playing);
    setFreeFlagsCount(Settings.BombsCount);
  }

  function continuePlaying(): void {
    setGameState(GameState.Playing);
  }

  function pause(): void {
    setGameState(GameState.Pause);
  }

  function openField(clickedField: IField): void {
    if (clickedField.isOpened) {
      return;
    }

    if (clickedField.hasBomb) {
      openBombsAndGameOver();
    } else if (clickedField.bombsAround === 0) {
      openEmptyFields(clickedField);
    } else {
      openFieldWithBombsAround(clickedField);
    }
  }

  function setFlag(clickedField: IField): void {
    if (freeFlagsCount === 0) {
      return;
    }

    setFields(
      fields.map((field) => ({
        ...field,
        hasFlag: clickedField.id === field.id || field.hasFlag,
      })),
    );

    setFreeFlagsCount(freeFlagsCount - 1);
  }

  function deleteFlag(clickedField: IField): void {
    setFields(
      fields.map((field) => ({
        ...field,
        hasFlag: field.hasFlag && clickedField.id === field.id ? false : field.hasFlag,
      })),
    );

    setFreeFlagsCount(freeFlagsCount + 1);
  }

  // Private methods
  function openBombsAndGameOver(): void {
    setGameState(GameState.GameOver);
    setFields(
      fields.map((field) => ({
        ...field,
        isOpened: field.isOpened || field.hasBomb,
      })),
    );
  }

  function openEmptyFields(clickedField: IField): void {
    const emptiesStack: IField[] = [clickedField];
    const fieldIdsToOpen = new Set<number>([clickedField.id]);
    const verifiedEmptiesIds = new Set<number>();

    // Recursively check all empty fields around clicked field
    // and save their IDs into fieldIdsToOpen set
    const verifyEmptiesAround = (field: IField) => {
      const {x, y} = field.coords;
      const coordsAround = findAllCoordsAroundField(x, y);

      for (const [x, y] of coordsAround) {
        if (isFieldInBoundaries(x, y)) {
          const sibling = findFieldByCoords(fields, x, y);

          if (sibling && !sibling.isOpened) {
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

    setFieldsOpened(fieldsOpened + fieldIdsToOpen.size);
    setFields(
      fields.map((field) => ({
        ...field,
        isOpened: field.isOpened || fieldIdsToOpen.has(field.id),
      })),
    );
  }

  function openFieldWithBombsAround(clickedField: IField): void {
    setFieldsOpened(fieldsOpened + 1);
    setFields(
      fields.map((field) => ({
        ...field,
        isOpened: field.isOpened || clickedField.id === field.id,
      })),
    );
  }

  // Find field in given array of fields by coordinates
  function findFieldByCoords(fields: IField[], x: number, y: number): IField | undefined {
    return fields.find((field) => field.coords.y === y && field.coords.x === x);
  }

  // Checks if given X and Y coordinates are in game field boundaries
  function isFieldInBoundaries(x: number, y: number): boolean {
    return x >= 1 || x <= Settings.FieldsConstraintsX || y >= 1 || y <= Settings.FieldsConstraintsY;
  }

  function findAllCoordsAroundField(x: number, y: number): number[][] {
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

  function generateFields(): IField[] {
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
        const coordsAroundField = findAllCoordsAroundField(x, y);

        for (const [x, y] of coordsAroundField) {
          if (isFieldInBoundaries(x, y)) {
            foundFields.push(findFieldByCoords(fields, x, y));
          }
        }

        foundFields.forEach((field) => field && field.bombsAround++);
      }
    }

    return fields;
  }

  return {
    fields,
    timer,
    formattedTimer,
    gameState,
    freeFlagsCount,
    play,
    continuePlaying,
    pause,
    openField,
    setFlag,
    deleteFlag,
  };
}
