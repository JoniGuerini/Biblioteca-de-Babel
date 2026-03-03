import { useGameState } from '../hooks/useGameState';
import { GeneratorButton } from './GeneratorButton';

export function GeneratorsList() {
  const { displayState } = useGameState();
  const state = displayState.current;

  const firstLockedIndex = state.generators?.findIndex((g) => g.isLocked);
  const visibleGenerators =
    firstLockedIndex === -1
      ? state.generators ?? []
      : state.generators?.slice(0, firstLockedIndex + 1) ?? [];

  return (
    <div className="generators-list">
      {visibleGenerators.map((gen) => (
        <GeneratorButton key={gen.name} data={gen} />
      ))}
    </div>
  );
}
