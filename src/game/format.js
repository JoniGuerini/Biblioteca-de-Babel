import { Decimal } from './Decimal';

const FORMAT_SUFFIXES = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dec'];

export function formatNumber(value) {
  if (!value || (value.eq && value.eq(0))) return '0';
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (d.lt(1000)) return d.toFixed(1).replace(/\.0$/, '');
  const magnitude = Math.floor(d.log10().toNumber() / 3);
  const suffixIndex = Math.min(magnitude, FORMAT_SUFFIXES.length - 1);
  const divisor = Decimal.pow(10, suffixIndex * 3);
  const scaled = d.div(divisor);
  const formatted = scaled.toFixed(1);
  return formatted.replace(/\.0$/, '') + FORMAT_SUFFIXES[suffixIndex];
}

export function formatBigNumber(value) {
  if (!value || (value.eq && value.eq(0))) return '0';
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (d.layer === 0 && d.mag < 9e15) return formatNumber(d);
  if (d.layer === 1 && d.mag >= 3 && d.mag <= 33) {
    const mag = d.mag;
    const suffixIndex = Math.min(Math.floor(mag / 3), FORMAT_SUFFIXES.length - 1);
    const divisorExp = suffixIndex * 3;
    const scaled = Math.pow(10, mag - divisorExp);
    const formatted = scaled >= 1000 ? Math.floor(scaled).toString() : scaled.toFixed(1).replace(/\.0$/, '');
    return formatted + FORMAT_SUFFIXES[suffixIndex];
  }
  return d.toStringWithDecimalPlaces(2);
}

/** Formata número como inteiro (sem decimais). Usado para Escribas. */
export function formatInteger(value) {
  if (!value || (value.eq && value.eq(0))) return '0';
  const d = value instanceof Decimal ? value : new Decimal(value);
  const floored = d.floor();
  if (floored.lt(1000)) return floored.toString();
  const magnitude = Math.floor(floored.log10().toNumber() / 3);
  const suffixIndex = Math.min(magnitude, FORMAT_SUFFIXES.length - 1);
  const divisor = Decimal.pow(10, suffixIndex * 3);
  const scaled = floored.div(divisor).floor();
  return scaled.toString() + FORMAT_SUFFIXES[suffixIndex];
}
