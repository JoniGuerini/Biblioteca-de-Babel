import { useGameState } from '../hooks/useGameState';
import { Tooltip } from './Tooltip';

export function BuyModeToggle() {
  const { buyMode, setBuyMode, BUY_MODES } = useGameState();

  const cycleMode = () => {
    const i = BUY_MODES.indexOf(buyMode);
    const next = (i + 1) % BUY_MODES.length;
    setBuyMode(BUY_MODES[next]);
  };

  return (
    <Tooltip text="Multicompra: clique para alternar" align="right">
      <button
        type="button"
        className="buy-mode-toggle"
        onClick={cycleMode}
        aria-label={`Multicompra: ${buyMode}. Clique para alternar.`}
      >
        {buyMode}
      </button>
    </Tooltip>
  );
}
