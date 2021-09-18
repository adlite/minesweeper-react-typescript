import React from 'react';
import cn from 'classnames';
import {GameState, IField} from '../types';

import style from './style.module.css';

interface IProps {
  field: IField;
  gameState: GameState;
  onOpen: (field: IField) => void;
  onSetFlag: (field: IField) => void;
  onDeleteFlag: (field: IField) => void;
}

export default function Field({field, gameState, onOpen, onSetFlag, onDeleteFlag}: IProps) {
  const isDisabled = gameState !== GameState.Playing;
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
    [style.isDisabled]: isDisabled,
    [style.hasOpenedBomb]: field.isOpened && field.hasBomb,
  });

  // Handlers
  const handleClick = () => {
    if (!field.hasFlag) {
      onOpen(field);
    }
  };

  const handleContextMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Disable context menu
    event.preventDefault();

    if (gameState === GameState.Playing) {
      if (field.hasFlag) {
        onDeleteFlag(field);
      } else {
        onSetFlag(field);
      }
    }
  };

  return (
    <button className={classes} disabled={isDisabled} onClick={handleClick} onContextMenu={handleContextMenuClick}>
      {label}
    </button>
  );
}
