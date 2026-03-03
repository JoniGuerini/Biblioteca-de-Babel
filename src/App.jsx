import { GameProvider } from './hooks/useGameState';
import { Game } from './components/Game';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
