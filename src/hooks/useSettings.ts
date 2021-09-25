import {useCallback, useState} from 'react';
import {ISettings, SettingsLevel} from '../types';

const settingsSet: ISettings[] = [
  {
    level: SettingsLevel.Beginner,
    fieldsInRow: 8,
    xFieldsCount: 16, // TODO: return to 8
    yFieldsCount: 8,
    bombsCount: 40,
  },
  {
    level: SettingsLevel.Intermediate,
    fieldsInRow: 16,
    xFieldsCount: 16,
    yFieldsCount: 16,
    bombsCount: 40,
  },
  {
    level: SettingsLevel.Expert,
    fieldsInRow: 22,
    xFieldsCount: 22,
    yFieldsCount: 22,
    bombsCount: 99,
  },
];

function getSettingsByLevel(level: SettingsLevel): ISettings {
  return settingsSet.find((s) => s.level === level) || settingsSet[0];
}

export default function useSettings(initialLevel: SettingsLevel) {
  const [settings, setSettings] = useState<ISettings>(getSettingsByLevel(initialLevel));

  const setSettingsByLevel = useCallback((level: SettingsLevel) => {
    setSettings(getSettingsByLevel(level));
  }, []);

  return {
    settings,
    setSettings,
    setSettingsByLevel,
  };
}
