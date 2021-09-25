import React, {useMemo} from 'react';
import Panel from '../Panel';
import Field from '../Field';
import Settings from '../Settings';
import useGame from '../../hooks/useGame';
import {GameState, SettingsLevel} from '../../types';

import style from './style.module.css';

export default function Game() {
  const {settings, setSettingsByLevel, fields, openField, fieldsOpened} = useGame();

  const fieldsStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${settings.xFieldsCount}, 1fr)`,
      gridTemplateRows: `repeat(${settings.yFieldsCount}, 1fr)`,
    }),
    [settings],
  );

  return (
    <>
      <Settings level={settings.level} onLevelChange={setSettingsByLevel} />
      <Panel className={style.Game}>
        <section className={style.fields} style={fieldsStyle}>
          {Array.from(fields.values()).map((field) => (
            <Field
              key={field.id}
              field={field}
              gameState={GameState.Playing}
              onOpen={openField}
              onSetFlag={console.log} // TODO: replace with state
              onDeleteFlag={console.log} // TODO: replace with state
              isSmall={settings.level !== SettingsLevel.Beginner}
            />
          ))}
        </section>
        <aside className={style.aside}>
          <div className={style.stats}>
            {/*<div className={style.statBlock} title="Timer">*/}
            {/*  <div className={style.statEmoji}>🕑</div>*/}
            {/*  <div className={style.statValue}>{formattedTimer}</div>*/}
            {/*</div>*/}
            {/*<div className={style.statBlock} title="Remaining flags">*/}
            {/*  <div className={style.statEmoji}>🚩</div>*/}
            {/*  <div className={style.statValue}>*/}
            {/*    {freeFlagsCount}/{settings.bombsCount}*/}
            {/*  </div>*/}
            {/*</div>*/}
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
          </div>
          {/*<div className={style.buttonWrapper}>*/}
          {/*  {gameState === GameState.Playing || gameState === GameState.Idle || (*/}
          {/*    <button className={style.button} onClick={prepareGame}>*/}
          {/*      {getPlayButtonLabel()}*/}
          {/*    </button>*/}
          {/*  )}*/}
          {/*  {(gameState === GameState.Playing || gameState === GameState.Pause) && (*/}
          {/*    <button className={style.button} onClick={handlePauseButtonClick}>*/}
          {/*      {getPauseButtonLabel()}*/}
          {/*    </button>*/}
          {/*  )}*/}
          {/*</div>*/}
        </aside>
      </Panel>
    </>
  );
}
