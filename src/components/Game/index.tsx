import React, {useCallback, useMemo} from 'react';
import Panel from '../Panel';
import Field from '../Field';
import Settings from '../Settings';
import useGameController from '../../hooks/useGameController';
import {GameState, SettingsLevel} from '../../types';

import style from './style.module.css';

export default function Game() {
  const {
    settings,
    setSettingsByLevel,
    fields,
    onFieldOpen,
    fieldsOpened,
    formattedTimer,
    prepareGame,
    continuePlaying,
    pause,
    gameState,
  } = useGameController();

  // Button labels getters
  const playButtonLabel = useMemo(() => {
    switch (gameState) {
      case GameState.Idle:
        return 'Play';
      default:
        return 'Play again';
    }
  }, [gameState]);

  const pauseButtonLabel = useMemo(() => {
    switch (gameState) {
      case GameState.Pause:
        return 'Continue';
      default:
        return 'Pause';
    }
  }, [gameState]);

  // Grid styles for specific settings
  const fieldsStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${settings.xFieldsCount}, 1fr)`,
      gridTemplateRows: `repeat(${settings.yFieldsCount}, 1fr)`,
    }),
    [settings],
  );

  // Event handlers
  const handlePauseButtonClick = useCallback(() => {
    if (gameState === GameState.Pause) {
      continuePlaying();
    } else {
      pause();
    }
  }, [gameState, pause, continuePlaying]);

  return (
    <>
      <Settings level={settings.level} onLevelChange={setSettingsByLevel} />
      <Panel className={style.Game}>
        <section className={style.fields} style={fieldsStyle}>
          {Array.from(fields.values()).map((field) => (
            <Field
              key={field.id}
              field={field}
              gameState={gameState}
              onOpen={onFieldOpen}
              isSmall={settings.level !== SettingsLevel.Beginner}
            />
          ))}
        </section>
        <aside className={style.aside}>
          <div className={style.stats}>
            <div className={style.statBlock} title="Timer">
              <div className={style.statEmoji}>🕑</div>
              <div className={style.statValue}>{formattedTimer}</div>
            </div>
            <div className={style.statBlock} title="Opened fields">
              <div className={style.statEmoji}>✅</div>
              <div className={style.statValue}>
                {fieldsOpened}/{settings.xFieldsCount * settings.yFieldsCount - settings.bombsCount}
              </div>
            </div>
            <div className={style.statBlock} title="Bombs count">
              <div className={style.statEmoji}>💣</div>
              <div className={style.statValue}>{settings.bombsCount}</div>
            </div>

            <div className={style.statBlock} title="Cells count">
              <div className={style.statEmoji}>📐</div>
              <div className={style.statValue}>
                {settings.xFieldsCount}x{settings.yFieldsCount}
              </div>
            </div>
          </div>
          <div className={style.buttonWrapper}>
            {gameState === GameState.Playing || gameState === GameState.Idle || (
              <button className={style.button} onClick={prepareGame}>
                {playButtonLabel}
              </button>
            )}
            {(gameState === GameState.Playing || gameState === GameState.Pause) && (
              <button className={style.button} onClick={handlePauseButtonClick}>
                {pauseButtonLabel}
              </button>
            )}
          </div>
        </aside>
      </Panel>
    </>
  );
}
