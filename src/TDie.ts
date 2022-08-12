export default interface TDie {
  key: string;
  value: number;
  isHeld: boolean;
  holdDice: (() => void) | undefined;
}
