import { useGameState } from '../hooks/useGameState';
import { GeneratorButton } from './GeneratorButton';

export function GeneratorsList({ productionLine = 'letters' }) {
  const { displayState } = useGameState();
  const state = displayState.current;

  const generators = state.generators?.[productionLine] ?? [];

  const firstLockedIndex = generators.findIndex((g) => g.isLocked);
  const visibleGenerators =
    firstLockedIndex === -1
      ? generators
      : generators.slice(0, firstLockedIndex + 1);

  return (
    <div className="generators-list">
      {visibleGenerators.map((gen) => (
        <GeneratorButton key={gen.name} data={gen} productionLine={productionLine} />
      ))}
    </div>
  );
}
