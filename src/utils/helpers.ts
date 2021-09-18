/**
 * Generates random number from `min` to `max`
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
