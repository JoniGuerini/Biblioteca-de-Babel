import { useGameState } from '../hooks/useGameState';
import { GeneratorButton } from './GeneratorButton';

export function GeneratorsList() {
  const { displayState } = useGameState();
  const state = displayState.current;

  return (
    <div className="generators-list">
      {state.generators?.map((gen) => (
        <GeneratorButton key={gen.name} data={gen} />
      ))}
    </div>
  );
}
