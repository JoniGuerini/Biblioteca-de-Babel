import { useGameState } from '../hooks/useGameState';

export function BuyModeToggle() {
  const { buyMode, setBuyMode, BUY_MODES } = useGameState();

  const cycleMode = () => {
    const i = BUY_MODES.indexOf(buyMode);
    const next = (i + 1) % BUY_MODES.length;
    setBuyMode(BUY_MODES[next]);
  };

  return (
    <button
      type="button"
      className="buy-mode-toggle"
      onClick={cycleMode}
      title="Multicompra: clique para alternar"
      aria-label={`Multicompra: ${buyMode}. Clique para alternar.`}
    >
      {buyMode}
    </button>
  );
}
