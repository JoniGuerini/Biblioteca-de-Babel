import { useGameState } from '../hooks/useGameState';

export function LetterCounter() {
  const { displayState } = useGameState();
  const state = displayState.current;

  return (
    <div className="header-counters">
      <div className="header-counter">
        <span className="counter-label">Letras</span>
        <div className="letter-counter">{state.letters}</div>
        <p className="production-rate">
          Produção: <span>{state.productionRate}</span>/s
        </p>
      </div>
      <div className="header-counter">
        <span className="counter-label">Escribas</span>
        <div className="letter-counter">{state.scribes}</div>
        <p className="production-rate">
          Produção: <span>{state.scribesProductionRate ?? 0}</span>/s
        </p>
      </div>
    </div>
  );
}
