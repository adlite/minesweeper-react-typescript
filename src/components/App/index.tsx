import {useState} from 'react';
import Game from '../Game';
import Settings from '../Settings';
import {SettingsLevel} from '../../types';
import style from './style.module.css';

export default function App() {
  const [settingsLevel, setSettingsLevel] = useState<SettingsLevel>(SettingsLevel.Beginner);

  return (
    <main className={style.App}>
      <div className={style.container}>
        <Settings level={settingsLevel} onLevelChange={setSettingsLevel} />
        <Game settingsLevel={settingsLevel} />
      </div>
    </main>
  );
}
