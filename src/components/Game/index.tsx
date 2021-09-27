import React, {useCallback, useMemo} from 'react';
import cn from 'classnames';
import Panel from '../Panel';
import Field from '../Field';
import Settings from '../Settings';
import Statistics from '../Statistics';
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
    flagsCount,
    setFlag,
    deleteFlag,
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
              onSetFlag={setFlag}
              onDeleteFlag={deleteFlag}
              isSmall={settings.level !== SettingsLevel.Beginner}
            />
          ))}
        </section>
        <aside className={style.aside}>
          <div className={style.stats}>
            <Statistics value={formattedTimer} icon="🕑" title="Timer" />
            <Statistics
              value={`${fieldsOpened}/${settings.xFieldsCount * settings.yFieldsCount - settings.bombsCount}`}
              icon="✅"
              title="Opened fields"
            />
            <Statistics
              value={`${settings.bombsCount - flagsCount}/${settings.bombsCount}`}
              icon="🚩"
              title="Free flags count"
            />
            <Statistics value={`${settings.xFieldsCount}x${settings.yFieldsCount}`} icon="📐" title="Cells count" />
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
            <a
              href="https://github.com/adlite/minesweeper-react-typescript"
              className={cn(style.button, style.buttonGitHub)}
              target="_blank"
              rel="noreferrer"
            >
              <img src="/assets/img/github.svg" alt="View source on GitHub" className={style.githubIcon} />
              View source
            </a>
          </div>
        </aside>
      </Panel>
    </>
  );
}
