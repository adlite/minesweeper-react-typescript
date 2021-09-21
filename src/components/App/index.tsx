import Game from '../Game';
import style from './style.module.css';

export default function App() {
  return (
    <main className={style.App}>
      <div className={style.container}>
        <Game />
      </div>
    </main>
  );
}
