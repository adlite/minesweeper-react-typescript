import {useCallback, useEffect, useState} from 'react';
import {IField, SettingsLevel, FieldsMap, FieldCoords} from '../types';
import useSettings from './useSettings';
import {randomNumber} from '../utils/helpers';

// function generateFieldsWithBombs(firstClicked: IField): FieldsMap {
//   const fields: FieldsMap = generateEmptyFields();
//   const fieldsWithBombsIds: Set<number> = new Set();
//
//   // Generate reserved fields which can't have bombs due to the first clicked field
//   const reservedIdsAround = findCoordsAround(firstClicked.coords.x, firstClicked.coords.y).map(
//     ([x, y]) => findFieldByCoords(fields, x, y)?.id as number,
//   );
//   const reservedIds = new Set<number>([firstClicked.id, ...reservedIdsAround]);
//
//   // Random recursive generator for bombs IDs
//   const generateRandomBombs = () => {
//     if (fieldsWithBombsIds.size >= settings.bombsCount) {
//       return;
//     }
//
//     const randomBombId = randomNumber(1, Math.pow(settings.fieldsInRow, 2));
//
//     if (!reservedIds.has(randomBombId)) {
//       fieldsWithBombsIds.add(randomBombId);
//     }
//
//     // Jump into new recursion
//     generateRandomBombs();
//   };
//
//   generateRandomBombs();
//
//   for (const field of fields) {
//     field.hasBomb = fieldsWithBombsIds.has(field.id);
//
//     if (field.hasBomb) {
//       const {x, y} = field.coords;
//       findCoordsAround(x, y)
//         .map(([x, y]) => findFieldByCoords(fields, x, y))
//         .forEach((field) => field && field.bombsAround++);
//     }
//   }
//
//   return fields;
// };

function coordsToString([x, y]: FieldCoords) {
  return `[${x},${y}]`;
}

export default function useGame() {
  // Use game settings hook
  const {settings, setSettingsByLevel} = useSettings(SettingsLevel.Beginner);
  // Array of game fields
  const [fields, setFields] = useState<FieldsMap>(new Map());
  // Array of game fields which has been opened
  const [fieldsOpened, setFieldsOpened] = useState<number>(0);

  // Private methods
  // Checks if given X and Y coordinates are in game field boundaries
  const areCoordsInBoundaries = useCallback(
    ([x, y]: FieldCoords): boolean => {
      return x >= 1 && x <= settings.xFieldsCount && y >= 1 && y <= settings.yFieldsCount;
    },
    [settings],
  );

  const findCoordsAround = useCallback(
    ([x, y]: FieldCoords): FieldCoords[] => {
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

      return coords.filter(([x, y]) => areCoordsInBoundaries([x, y])) as FieldCoords[];
    },
    [areCoordsInBoundaries],
  );

  const generateEmptyFields = useCallback((): FieldsMap => {
    const fields: FieldsMap = new Map();

    for (let y = 0; y < settings.yFieldsCount; y++) {
      for (let x = 0; x < settings.xFieldsCount; x++) {
        const coords: FieldCoords = [x + 1, y + 1];
        fields.set(coordsToString(coords), {
          id: x + 1 + settings.xFieldsCount * y,
          coords,
          isOpened: false,
          hasBomb: false,
          hasFlag: false,
          bombsAround: 0,
        });
      }
    }

    return fields;
  }, [settings]);

  const generateFieldsWithBombs = useCallback(
    (firstClicked: IField): FieldsMap => {
      const fields: FieldsMap = generateEmptyFields();
      const fieldsWithBombsIds: Set<number> = new Set();

      // Generate reserved fields which can't have bombs due to the first clicked field
      const reservedIdsAround = findCoordsAround(firstClicked.coords).map(
        (coords) => fields.get(coordsToString(coords))?.id as number,
      );
      const reservedIds = new Set<number>([firstClicked.id, ...reservedIdsAround]);

      // Random recursive generator for bombs IDs
      while (fieldsWithBombsIds.size < settings.bombsCount) {
        const randomBombId = randomNumber(1, settings.xFieldsCount * settings.yFieldsCount);

        if (!reservedIds.has(randomBombId)) {
          fieldsWithBombsIds.add(randomBombId);
        }
      }

      for (const field of fields.values()) {
        field.hasBomb = fieldsWithBombsIds.has(field.id);

        if (field.hasBomb) {
          findCoordsAround(field.coords)
            .map((coords) => fields.get(coordsToString(coords)))
            .forEach((field) => field && field.bombsAround++);
        }
      }

      return fields;
    },
    [findCoordsAround, generateEmptyFields, settings],
  );

  // Public methods
  const prepareGame = useCallback(() => {
    setFields(generateEmptyFields());
  }, [generateEmptyFields]);

  const openField = useCallback(
    (clickedField: IField) => {
      if (clickedField.isOpened) {
        return;
      }

      if (fieldsOpened === 0) {
        setFields(generateFieldsWithBombs(clickedField));
      }
    },
    [fieldsOpened],
  );

  // Initialize game on mount
  useEffect(() => {
    prepareGame();
  }, [prepareGame]);

  // Regenerate game fields when settings changed
  useEffect(() => {
    prepareGame();
  }, [settings, prepareGame]);

  return {
    settings,
    setSettingsByLevel,
    fields,
    openField,
    prepareGame,
  };
}
