import {useCallback, useEffect, useState} from 'react';
import {GameState, IField, SettingsLevel} from '../types';
import {formatSeconds} from '../utils/helpers';
import useSettings from './useSettings';
import useGame from './useGame';
import useInterval from './useInterval';

export default function useGameController() {
  // Use game settings hook
  const {settings, setSettingsByLevel} = useSettings(SettingsLevel.Beginner);
  // Game main logic hook
  const {fields, fieldsOpened, openField, initFields} = useGame(settings);
  // Time in seconds spent on the game
  const [timer, setTimer] = useState<number>(0);
  // Formatted HH:MM:SS `timer`
  const [formattedTimer, setFormattedTimer] = useState<string>('00:00');
  // Current state of the game
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);

  // Public methods
  const prepareGame = useCallback(() => {
    initFields();
    setTimer(0);
    setGameState(GameState.Idle);
  }, [initFields]);

  const continuePlaying = useCallback(() => {
    setGameState(GameState.Playing);
  }, []);

  const pause = useCallback(() => {
    setGameState(GameState.Pause);
  }, []);

  const onFieldOpen = useCallback(
    (clickedField: IField) => {
      if (clickedField.hasBomb) {
        // Handle click on field with bomb
        setGameState(GameState.GameOver);
      } else if (fieldsOpened === 0) {
        // Handle first click.
        // Set game state to `Playing`
        setGameState(GameState.Playing);
      }

      // Open field with `useGame` handler
      openField(clickedField);
    },
    [fieldsOpened, openField],
  );

  // Run `setInterval` every time when `gameState` is GameState.Playing
  useInterval(
    () => {
      setTimer(timer + 1);
    },
    gameState === GameState.Playing ? 1000 : null,
  );

  // Initialize game on mount
  useEffect(() => {
    prepareGame();
  }, [prepareGame]);

  // Regenerate game fields when settings changed
  useEffect(() => {
    prepareGame();
  }, [settings, prepareGame]);

  // Format seconds on each `timer` change
  useEffect(() => {
    setFormattedTimer(formatSeconds(timer));
  }, [timer]);

  // Check game win state
  useEffect(() => {
    if (fieldsOpened + settings.bombsCount === settings.xFieldsCount * settings.yFieldsCount) {
      alert('Congratulations! You won!');
      setGameState(GameState.GameOver);
    }
  }, [fieldsOpened, settings]);

  return {
    settings,
    setSettingsByLevel,
    fields,
    fieldsOpened,
    timer,
    formattedTimer,
    gameState,
    prepareGame,
    continuePlaying,
    pause,
    onFieldOpen,
  };
}
