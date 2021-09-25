import React, {useCallback, useEffect, useState} from 'react';
import cn from 'classnames';
import {GameState, IField} from '../../types';

import style from './style.module.css';

interface IProps {
  field: IField;
  isSmall: boolean;
  gameState: GameState;
  onOpen: (field: IField) => void;
}

function Field({field, isSmall, gameState, onOpen}: IProps) {
  const [hasFlag, setFlag] = useState<boolean>(false);

  // Delete flag when new game started
  useEffect(() => {
    if (gameState === GameState.Idle && hasFlag) {
      setFlag(false);
    }
  }, [gameState, hasFlag]);

  const isDisabled = gameState === GameState.Pause || gameState === GameState.GameOver;
  let label: number | string = '';

  if (field.isOpened) {
    if (field.hasBomb) {
      label = '💣';
    } else if (field.bombsAround) {
      label = field.bombsAround;
    }
  } else if (hasFlag) {
    label = '🚩';
  }

  const classes = cn({
    [style.Field]: true,
    [style.isOpened]: field.isOpened,
    [style.isSmall]: isSmall,
    [style.hasOpenedBomb]: field.isOpened && field.hasBomb,
    [style.dangerLevel1]: field.isOpened && field.bombsAround === 1,
    [style.dangerLevel2]: field.isOpened && field.bombsAround === 2,
    [style.dangerLevel3]: field.isOpened && field.bombsAround === 3,
    [style.dangerLevel4]: field.isOpened && field.bombsAround === 4,
    [style.dangerLevel5]: field.isOpened && field.bombsAround === 5,
    [style.dangerLevel6]: field.isOpened && field.bombsAround >= 6,
  });

  // Handlers
  const handleClick = useCallback(() => {
    if (!hasFlag) {
      onOpen(field);
    }
  }, [field, onOpen, hasFlag]);

  const handleContextMenuClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // Disable context menu
      event.preventDefault();

      if (gameState === GameState.Playing && !field.isOpened) {
        if (hasFlag) {
          setFlag(false);
        } else {
          setFlag(true);
        }
      }
    },
    [field, gameState, hasFlag],
  );

  return (
    <button className={classes} disabled={isDisabled} onClick={handleClick} onContextMenu={handleContextMenuClick}>
      {label}
    </button>
  );
}

export default React.memo(Field);
