import { useState, useEffect } from "react";
import "./App.css";
import Die from "./components/Die";
import TDie from "./TDie";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import StatDisplay from "./components/StatDisplay";
import Stat from "./Stat";

function App() {
  const [dice, setDice] = useState(allNewDice());
  const [tenzies, setTenzies] = useState(false);
  const [totalRolls, setTotalRolls] = useState<Stat>({
    name: "Rolls",
    stat: 0,
  });
  const [currentTime, setCurrentTime] = useState<Stat>({
    name: "Time",
    stat: 0,
    color: "red",
  });
  const [bestTime, setBestTime] = useState<Stat>({
    name: "BestTime",
    stat: Number(localStorage.getItem("bestTime")) || 0,
    color: "yellow",
  });

  useEffect(() => {
    // Save the highest score
    const noRecord = Number(bestTime) === 0;
    const validTime = currentTime.stat > 0;
    const newRecord = currentTime.stat < Number(bestTime);
    if (tenzies && (noRecord || (validTime && newRecord))) {
      localStorage.setItem("bestTime", `${currentTime.stat}`);
      setBestTime({ ...bestTime, stat: currentTime.stat });
    }
  }, [tenzies]);

  useEffect(() => {
    if (!tenzies) {
      // Increase the timer every second
      setTimeout(
        () =>
          setCurrentTime((prevTime) => ({
            ...prevTime,
            stat: prevTime.stat++,
          })),
        1000,
      );
    }
  }, [currentTime]);

  useEffect(() => {
    // Check everything is held
    const allHeld = dice.every(({ isHeld }) => isHeld);
    const firstValue = dice[0].value;
    // Check for same value
    const allSame = dice.every(({ value }) => value === firstValue);
    if (allHeld && allSame) {
      setTenzies(true);
    }
  }, [dice]);

  function startOver() {
    setDice(allNewDice());
    setTenzies(false);
    setTotalRolls({
      name: "Rolls",
      stat: 0,
    });
    setCurrentTime({
      name: "Time",
      stat: 0,
    });
  }

  function rollUnheld() {
    setDice((prevDice) =>
      prevDice.map((die) => {
        if (!die.isHeld) {
          return { ...die, value: Math.ceil(Math.random() * 6) };
        }
        return die;
      }),
    );
    setTotalRolls((prevTotalRolls) => ({
      ...prevTotalRolls,
      stat: prevTotalRolls.stat++,
    }));
  }

  function allNewDice() {
    const newDice: TDie[] = [];
    for (let i = 1; i <= 10; i++) {
      let dice: TDie = {
        key: nanoid(),
        value: Math.ceil(Math.random() * 6),
        isHeld: false,
        holdDice: undefined,
      };
      dice.holdDice = () => holdDice(dice.key);
      newDice.push(dice);
    }
    return newDice;
  }

  function holdDice(id: string) {
    setDice((prevDice) => {
      return prevDice.map((die) => {
        if (die.key === id) {
          return { ...die, isHeld: !die.isHeld };
        }
        return die;
      });
    });
  }

  const dieElements = dice.map((die) => <Die {...die} />);

  return (
    <div className="App">
      {tenzies ? <Confetti /> : ""}
      <main className="main">
        <h1 className="main--title">Tenzies</h1>
        <p className="main--instructions">
          Roll until all dice are the same. Click each die to freeze it at its
          current value between rolls.
        </p>
        <div className="main--board">{dieElements}</div>
        <button
          className={tenzies ? "main--restart" : "main--reroll"}
          onClick={tenzies ? startOver : rollUnheld}
        >
          {tenzies ? "New Game" : "Reroll"}
        </button>
        <div className="main--stats">
          <StatDisplay {...totalRolls} />
          <StatDisplay {...bestTime} />
          <StatDisplay {...currentTime} />
        </div>
      </main>
    </div>
  );
}

export default App;
