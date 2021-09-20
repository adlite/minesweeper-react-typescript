import React from 'react';
import Panel from '../Panel';
import Field from '../Field';
import useMinesGame from '../../hooks/useMinesGame';
import {GameState, Settings} from '../../types';

import style from './style.module.css';

export default function Game() {
  const {
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
  function getPlayButtonLabel(): string {
    switch (gameState) {
      case GameState.Idle:
        return 'Play';
      default:
        return 'Play again';
    }
  }

  function getPauseButtonLabel(): string {
    switch (gameState) {
      case GameState.Pause:
        return 'Continue';
      default:
        return 'Pause';
    }
  }

  // Event handlers
  function handlePauseButtonClick() {
    if (gameState === GameState.Pause) {
      continuePlaying();
    } else {
      pause();
    }
  }

  return (
    <Panel className={style.Game}>
      <section className={style.fields}>
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
              {freeFlagsCount}/{Settings.BombsCount}
            </div>
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
  );
}
