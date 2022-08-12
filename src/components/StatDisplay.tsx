import "./StatDisplay.css";
import Stat from "../Stat";

function StatDisplay({ name, stat, color }: Stat) {
  return (
    <span className={`stat ${color ?? ""}`}>
      {name}: {stat}
    </span>
  );
}

export default StatDisplay;
