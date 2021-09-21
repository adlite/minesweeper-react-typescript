import Game from '../Game';
import Settings from '../Settings';
import {SettingsLevel} from '../../types';
import style from './style.module.css';

export default function App() {
  return (
    <main className={style.App}>
      <div className={style.container}>
        <Settings level={SettingsLevel.Beginner} onLevelChange={(s) => console.log(s)} />
        <Game />
      </div>
    </main>
  );
}
