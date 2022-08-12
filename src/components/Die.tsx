import "./Die.css";
import TDie from "../TDie";

function Die({ value, isHeld, holdDice }: TDie) {
  return (
    <button className={`die ${isHeld ? "die-held" : ""}`} onClick={holdDice}>
      {value}
    </button>
  );
}

export default Die;
