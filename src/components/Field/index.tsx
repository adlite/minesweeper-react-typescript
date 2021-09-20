import React from 'react';
import cn from 'classnames';
import {GameState, IField} from '../../types';

import style from './style.module.css';

interface IProps {
  field: IField;
  gameState: GameState;
  onOpen: (field: IField) => void;
  onSetFlag: (field: IField) => void;
  onDeleteFlag: (field: IField) => void;
}

export default function Field({field, gameState, onOpen, onSetFlag, onDeleteFlag}: IProps) {
  const isDisabled = gameState === GameState.Pause || gameState === GameState.GameOver;
  let label: number | string = '';

  if (field.isOpened) {
    if (field.hasBomb) {
      label = '💣';
    } else if (field.bombsAround) {
      label = field.bombsAround;
    }
  } else if (field.hasFlag) {
    label = '🚩';
  }

  const classes = cn({
    [style.Field]: true,
    [style.isOpened]: field.isOpened,
    [style.hasOpenedBomb]: field.isOpened && field.hasBomb,
    [style.dangerLevel1]: field.isOpened && field.bombsAround === 1,
    [style.dangerLevel2]: field.isOpened && field.bombsAround === 2,
    [style.dangerLevel3]: field.isOpened && field.bombsAround === 3,
    [style.dangerLevel4]: field.isOpened && field.bombsAround === 4,
    [style.dangerLevel5]: field.isOpened && field.bombsAround === 5,
    [style.dangerLevel6]: field.isOpened && field.bombsAround >= 6,
  });

  // Handlers
  function handleClick() {
    if (!field.hasFlag) {
      onOpen(field);
    }
  }

  function handleContextMenuClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    // Disable context menu
    event.preventDefault();

    if (gameState === GameState.Playing) {
      if (field.hasFlag) {
        onDeleteFlag(field);
      } else {
        onSetFlag(field);
      }
    }
  }

  return (
    <button className={classes} disabled={isDisabled} onClick={handleClick} onContextMenu={handleContextMenuClick}>
      {label}
    </button>
  );
}
