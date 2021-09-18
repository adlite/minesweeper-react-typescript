import React from 'react';
import cn from 'classnames';
import {GameState, IField} from '../types';

import style from './style.module.css';

interface Props {
  field: IField;
  gameState: GameState;
  onClick: (field: IField) => void;
}

export default function Field({field, gameState, onClick}: Props) {
  const isDisabled = gameState !== GameState.Playing;
  let label: number | string = '';

  if (field.isOpened) {
    if (field.hasBomb) {
      label = '💣';
    } else if (field.bombsAround) {
      label = field.bombsAround;
    }
  }

  const classes = cn({
    [style.Field]: true,
    [style.isOpened]: field.isOpened,
    [style.isDisabled]: isDisabled,
    [style.hasOpenedBomb]: field.isOpened && field.hasBomb,
  });

  return (
    <button className={classes} onClick={() => onClick(field)} disabled={isDisabled}>
      {label}
    </button>
  );
}
