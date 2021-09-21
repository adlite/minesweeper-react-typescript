import React, {useCallback} from 'react';
import cn from 'classnames';

import Panel from '../Panel';
import {SettingsLevel} from '../../types';
import style from './style.module.css';

interface IProps {
  className?: string;
  level: SettingsLevel;
  onLevelChange: (level: SettingsLevel) => void;
}

function Settings({className = '', level, onLevelChange}: IProps) {
  const handleLevelChange = useCallback(
    (settingsLevel: SettingsLevel) => () => onLevelChange(settingsLevel),
    [onLevelChange],
  );

  return (
    <Panel className={cn(style.Settings, className)}>
      <button
        className={cn(style.button, {[style.isActive]: level === SettingsLevel.Beginner})}
        onClick={handleLevelChange(SettingsLevel.Beginner)}
      >
        Beginner
      </button>
      <button
        className={cn(style.button, {[style.isActive]: level === SettingsLevel.Intermediate})}
        onClick={handleLevelChange(SettingsLevel.Intermediate)}
      >
        Intermediate
      </button>
      <button
        className={cn(style.button, {[style.isActive]: level === SettingsLevel.Expert})}
        onClick={handleLevelChange(SettingsLevel.Expert)}
      >
        Expert
      </button>
    </Panel>
  );
}

export default React.memo(Settings);
