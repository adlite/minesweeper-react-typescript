import React, {useCallback, useMemo} from 'react';
import Panel from '../Panel';
import Field from '../Field';
import Settings from '../Settings';
import useMinesGame from '../../hooks/useMinesGame';
import {GameState} from '../../types';

import style from './style.module.css';

export default function Game() {
  const {
    settings,
    setSettingsByLevel,
    fields,
    formattedTimer,
    gameState,
    freeFlagsCount,
    prepareGame,
    continuePlaying,
    pause,
    openField,
    setFlag,
    deleteFlag,
  } = useMinesGame();

  // Button labels getters
  const getPlayButtonLabel = useCallback(() => {
    switch (gameState) {
      case GameState.Idle:
        return 'Play';
      default:
        return 'Play again';
    }
  }, [gameState]);

  const getPauseButtonLabel = useCallback(() => {
    switch (gameState) {
      case GameState.Pause:
        return 'Continue';
      default:
        return 'Pause';
    }
  }, [gameState]);

  // Event handlers
  const handlePauseButtonClick = useCallback(() => {
    if (gameState === GameState.Pause) {
      continuePlaying();
    } else {
      pause();
    }
  }, [gameState, pause, continuePlaying]);

  const fieldsStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${settings.fieldsInRow}, 1fr)`,
      gridTemplateRows: `repeat(${settings.fieldsInRow}, 1fr)`,
    }),
    [settings.fieldsInRow],
  );

  return (
    <>
      <Settings level={settings.level} onLevelChange={setSettingsByLevel} />
      <Panel className={style.Game}>
        <section className={style.fields} style={fieldsStyle}>
          {fields.map((field) => (
            <Field
              key={field.id}
              field={field}
              gameState={gameState}
              onOpen={openField}
              onSetFlag={setFlag}
              onDeleteFlag={deleteFlag}
            />
          ))}
        </section>
        <aside className={style.aside}>
          <div className={style.stats}>
            <div className={style.statBlock}>
              <div className={style.statEmoji}>🕑</div>
              <div className={style.statValue}>{formattedTimer}</div>
            </div>
            <div className={style.statBlock}>
              <div className={style.statEmoji}>🚩</div>
              <div className={style.statValue}>
                {freeFlagsCount}/{settings.bombsCount}
              </div>
            </div>
            <div className={style.statBlock}>
              <div className={style.statValue}>{settings.level}</div>
            </div>
          </div>
          <div className={style.buttonWrapper}>
            {gameState === GameState.Playing || gameState === GameState.Idle || (
              <button className={style.button} onClick={prepareGame}>
                {getPlayButtonLabel()}
              </button>
            )}
            {(gameState === GameState.Playing || gameState === GameState.Pause) && (
              <button className={style.button} onClick={handlePauseButtonClick}>
                {getPauseButtonLabel()}
              </button>
            )}
          </div>
        </aside>
      </Panel>
    </>
  );
}
