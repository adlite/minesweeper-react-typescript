import {useEffect, useState, useCallback} from 'react';
import {GameState, IField, Settings} from '../types';
import {formatSeconds, randomNumber} from '../utils/helpers';
import useInterval from './useInterval';

export default function useMinesGame() {
  // Array of game fields
  const [fields, setFields] = useState<IField[]>([]);
  // Array of game fields which has been opened
  const [fieldsOpened, setFieldsOpened] = useState<number>(0);
  // Time in seconds spent on the game
  const [timer, setTimer] = useState<number>(0);
  // Formatted HH:MM:SS `timer`
  const [formattedTimer, setFormattedTimer] = useState<string>('00:00');
  // Current state of the game
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  // The number of flags remaining with the player
  const [freeFlagsCount, setFreeFlagsCount] = useState<number>(10);

  // Private methods
  // Find field in given array of fields by coordinates
  const findFieldByCoords = useCallback((fields: IField[], x: number, y: number): IField | undefined => {
    return fields.find((field) => field.coords.y === y && field.coords.x === x);
  }, []);

  // Checks if given X and Y coordinates are in game field boundaries
  const areCoordsInBoundaries = useCallback((x: number, y: number): boolean => {
    return x >= 1 && x <= Settings.FieldsConstraintsX && y >= 1 && y <= Settings.FieldsConstraintsY;
  }, []);

  const findCoordsAround = useCallback(
    (x: number, y: number): number[][] => {
      const coords = [
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x - 1, y],
        [x + 1, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1],
      ];

      return coords.filter(([x, y]) => areCoordsInBoundaries(x, y));
    },
    [areCoordsInBoundaries],
  );

  const openAllBombs = useCallback((fields: IField[]): IField[] => {
    return fields.map((field) => ({
      ...field,
      isOpened: field.isOpened || field.hasBomb,
    }));
  }, []);

  const openEmptyFields = useCallback(
    (clickedField: IField, fields: IField[]) => {
      const emptiesStack: IField[] = [clickedField];
      const fieldIdsToOpen = new Set<number>([clickedField.id]);
      const verifiedEmptiesIds = new Set<number>();

      // Recursively check all empty fields around clicked field
      // and save their IDs into fieldIdsToOpen set
      const verifyEmptiesAround = (field: IField) => {
        const {x, y} = field.coords;
        const coordsAround = findCoordsAround(x, y);

        for (const [x, y] of coordsAround) {
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

        verifiedEmptiesIds.add(field.id);
        emptiesStack.shift();

        if (emptiesStack.length > 0) {
          verifyEmptiesAround(emptiesStack[0]);
        }
      };

      verifyEmptiesAround(clickedField);

      return {
        opened: fieldIdsToOpen.size,
        fields: fields.map((field) => ({
          ...field,
          isOpened: field.isOpened || fieldIdsToOpen.has(field.id),
        })),
      };
    },
    [findCoordsAround, findFieldByCoords],
  );

  const openFieldWithBombsAround = useCallback(
    (clickedField: IField): IField[] => {
      return fields.map((field) => ({
        ...field,
        isOpened: field.isOpened || clickedField.id === field.id,
      }));
    },
    [fields],
  );

  const generateEmptyFields = useCallback((): IField[] => {
    return Array.from(Array(Settings.FieldsCount).keys()).map((index) => {
      // Find the coordinates dependent on the index
      const y = Math.floor(index / Settings.FieldsConstraintsY) + 1;
      const x = (index % Settings.FieldsConstraintsX) + 1;
      const id = index + 1;

      // Push basic field
      return {
        id,
        coords: {y, x},
        isOpened: false,
        hasBomb: false,
        hasFlag: false,
        bombsAround: 0,
      };
    });
  }, []);

  const generateFieldsWithBombs = useCallback(
    (firstClicked: IField): IField[] => {
      const fields: IField[] = generateEmptyFields();
      const fieldsWithBombsIds: Set<number> = new Set();

      // Generate reserved fields which can't have bombs due to the first clicked field
      const reservedIdsAround = findCoordsAround(firstClicked.coords.x, firstClicked.coords.y).map(
        ([x, y]) => findFieldByCoords(fields, x, y)?.id as number,
      );
      const reservedIds = new Set<number>([firstClicked.id, ...reservedIdsAround]);

      // Random recursive generator for bombs IDs
      const generateRandomBombs = () => {
        if (fieldsWithBombsIds.size >= Settings.BombsCount) {
          return;
        }

        const randomBombId = randomNumber(1, Settings.FieldsCount);

        if (!reservedIds.has(randomBombId)) {
          fieldsWithBombsIds.add(randomBombId);
        }

        // Jump into new recursion
        generateRandomBombs();
      };

      generateRandomBombs();

      for (const field of fields) {
        field.hasBomb = fieldsWithBombsIds.has(field.id);

        if (field.hasBomb) {
          const {x, y} = field.coords;
          findCoordsAround(x, y)
            .map(([x, y]) => findFieldByCoords(fields, x, y))
            .forEach((field) => field && field.bombsAround++);
        }
      }

      return fields;
    },
    [findCoordsAround, findFieldByCoords, generateEmptyFields],
  );

  // Public methods
  const prepareGame = useCallback(() => {
    setFields(generateEmptyFields());
    setFieldsOpened(0);
    setTimer(0);
    setGameState(GameState.Idle);
    setFreeFlagsCount(Settings.BombsCount);
  }, [generateEmptyFields]);

  const continuePlaying = useCallback(() => {
    setGameState(GameState.Playing);
  }, []);

  const pause = useCallback(() => {
    setGameState(GameState.Pause);
  }, []);

  const openField = useCallback(
    (clickedField: IField) => {
      if (clickedField.isOpened) {
        return;
      }

      if (clickedField.hasBomb) {
        // Handle click on field with bomb
        setGameState(GameState.GameOver);
        setFields(openAllBombs(fields));
      } else if (fieldsOpened === 0) {
        // Handle first click.
        // Set game state to `Playing`
        setGameState(GameState.Playing);
        // Regenerate fields with bombs and then open fields around first clicked field.
        // The first click in any game will never be a mine.
        const empties = openEmptyFields(clickedField, generateFieldsWithBombs(clickedField));
        setFields(empties.fields);
        // Add opened fields to counter
        setFieldsOpened(empties.opened);
      } else if (clickedField.bombsAround === 0) {
        // Handle click on empty field
        const empties = openEmptyFields(clickedField, fields);
        setFields(empties.fields);
        setFieldsOpened(fieldsOpened + empties.opened);
      } else {
        // Handle click with number of bombs around
        setFields(openFieldWithBombsAround(clickedField));
        setFieldsOpened(fieldsOpened + 1);
      }
    },
    [fieldsOpened, openAllBombs, fields, openEmptyFields, generateFieldsWithBombs, openFieldWithBombsAround],
  );

  const setFlag = useCallback(
    (clickedField: IField) => {
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
    },
    [fields, freeFlagsCount],
  );

  const deleteFlag = useCallback(
    (clickedField: IField) => {
      setFields(
        fields.map((field) => ({
          ...field,
          hasFlag: field.hasFlag && clickedField.id === field.id ? false : field.hasFlag,
        })),
      );

      setFreeFlagsCount(freeFlagsCount + 1);
    },
    [fields, freeFlagsCount],
  );

  // Initialize game on mount
  useEffect(() => {
    prepareGame();
  }, [prepareGame]);

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

  return {
    fields,
    timer,
    formattedTimer,
    gameState,
    freeFlagsCount,
    prepareGame,
    continuePlaying,
    pause,
    openField,
    setFlag,
    deleteFlag,
  };
}
