import { Decimal } from './Decimal';
import { getCycleMsWithUpgrade, getProductionWithUpgrade, getMaxSpeedRanks } from './upgrades';

export class Generator {
  constructor(level, name, baseCost, costMultiplier, produces, flavorText, cycleDurationMs, quantityPerCycle, minPreviousTier = 0, costPreviousTier = null, scribesRequired = null) {
    this.level = level;
    this.name = name;
    this.scribesRequired = scribesRequired != null ? scribesRequired : level;
    this.baseCost = new Decimal(baseCost);
    this.costMultiplier = new Decimal(costMultiplier);
    this.produces = produces;
    this.count = new Decimal(0);
    this.flavorText = flavorText;
    this.baseCycleDurationMs = cycleDurationMs;
    this.cycleDurationMs = cycleDurationMs;
    this.baseQuantityPerCycle = new Decimal(quantityPerCycle);
    this.quantityPerCycle = new Decimal(quantityPerCycle);
    this.minPreviousTier = minPreviousTier;
    this.costPreviousTier = costPreviousTier != null ? new Decimal(costPreviousTier) : null;
    this.speedRank = 0;
    this.productionRank = 0;
  }

  applyUpgrades(speedRank, productionRank) {
    this.speedRank = speedRank;
    this.productionRank = productionRank;
    this.cycleDurationMs = getCycleMsWithUpgrade(this.baseCycleDurationMs, speedRank);
    this.quantityPerCycle = getProductionWithUpgrade(this.baseQuantityPerCycle, productionRank);
  }

  getMaxSpeedRanks() {
    return getMaxSpeedRanks(this.baseCycleDurationMs);
  }

  getCost() {
    return this.baseCost;
  }

  /** Marco: quantidade do gerador anterior que é preciso TER para desbloquear este. */
  getMinPreviousTierToUnlock() {
    return this.minPreviousTier;
  }

  /** Custo: quantidade do gerador anterior que é GASTA ao comprar. */
  getPreviousTierRequired() {
    if (!this.produces) return null;
    if (this.costPreviousTier != null) return this.costPreviousTier;
    const letterCost = this.getCost();
    return letterCost.div(this.produces.baseCost).ceil();
  }

  /** Duração do ciclo em milissegundos */
  getCycleDurationMs() {
    return this.cycleDurationMs;
  }

  /** Quantidade produzida por unidade por ciclo */
  getQuantityPerCycle() {
    return this.quantityPerCycle;
  }

  /** Quantidade total por ciclo (quantityPerCycle * count) */
  getTotalPerCycle() {
    return this.quantityPerCycle.mul(this.count);
  }

  /** Taxa efetiva por segundo (para exibição no header) */
  getEffectivePerSecond() {
    if (this.count.lte(0)) return new Decimal(0);
    const perCycle = this.getTotalPerCycle();
    const cyclesPerSecond = 1000 / this.cycleDurationMs;
    return perCycle.mul(cyclesPerSecond);
  }

  produce(deltaTime, cycleProgress) {
    if (this.count.lte(0)) return null;

    /* Ciclo fixo: avança 1/cycleDurationMs por ms, independente da quantidade */
    const newProgress = (cycleProgress || 0) + (deltaTime / this.cycleDurationMs);
    if (newProgress < 1) {
      return { type: this.produces === null ? 'letters' : 'generator', generator: this.produces, amount: new Decimal(0), cycleProgress: newProgress };
    }

    const completed = Math.floor(newProgress);
    const amount = this.quantityPerCycle.mul(this.count).mul(completed);
    const remainder = newProgress - completed;

    if (this.produces === null) {
      return { type: 'letters', amount, cycleProgress: remainder };
    }
    return { type: 'generator', generator: this.produces, amount, cycleProgress: remainder };
  }

  buy() {
    this.count = this.count.plus(1);
  }
}
