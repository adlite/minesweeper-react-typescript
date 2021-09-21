import React from 'react';
import cn from 'classnames';

import Panel from '../Panel';
import {SettingsLevel} from '../../types';
import style from './style.module.css';

interface IProps {
  className?: string;
  level: SettingsLevel;
  onLevelChange: (settingsLevel: SettingsLevel) => void;
}

export default function Settings({className = '', level, onLevelChange}: IProps) {
  // const handleLevelChange = (settingsLevel: SettingsLevel) => () => {
  //   switch (settingsLevel) {
  //     case SettingsLevel.Beginner:
  //       onLevelChange({
  //         xFieldsCount: 8,
  //         yFieldsCount: 8,
  //         bombsCount: 10,
  //       });
  //       break;
  //     case SettingsLevel.Intermediate:
  //       onLevelChange({
  //         xFieldsCount: 16,
  //         yFieldsCount: 16,
  //         bombsCount: 40,
  //       });
  //       break;
  //     case SettingsLevel.Expert:
  //       onLevelChange({
  //         xFieldsCount: 16,
  //         yFieldsCount: 30,
  //         bombsCount: 99,
  //       });
  //       break;
  //   }
  // };

  return (
    <Panel className={cn(style.Settings, className)}>
      <button
        className={cn(style.button, {[style.isActive]: level === SettingsLevel.Beginner})}
        onClick={() => onLevelChange(SettingsLevel.Beginner)}
      >
        Beginner
      </button>
      <button
        className={cn(style.button, {[style.isActive]: level === SettingsLevel.Intermediate})}
        onClick={() => onLevelChange(SettingsLevel.Intermediate)}
      >
        Intermediate
      </button>
      <button
        className={cn(style.button, {[style.isActive]: level === SettingsLevel.Expert})}
        onClick={() => onLevelChange(SettingsLevel.Expert)}
      >
        Expert
      </button>
    </Panel>
  );
}
