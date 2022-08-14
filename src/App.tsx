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
    name: "Best Time",
    stat: Number(localStorage.getItem("bestTime")) || 0,
    color: "yellow",
  });

  // This effect handles saving the best time after a game is completed.
  // It only launches on first render and whenever we achieve tenzies.
  useEffect(() => {
    const noRecord = bestTime.stat === 0; // No previous record in storage.
    const validTime = currentTime.stat > 0; // The player has taken at least a second to play.
    const newRecord = currentTime.stat < bestTime.stat; // The current time is better than the stored one.
    // Check first if we have a valid record, 0 seconds is impossible to achieve
    if (tenzies && (noRecord || (validTime && newRecord))) {
      // Update the value in storage.
      localStorage.setItem("bestTime", `${currentTime.stat}`);
      // Update the value in state.
      setBestTime({
        ...bestTime,
        stat: currentTime.stat,
      });
    }
  }, [tenzies]);

  // This effect handles the timer.
  // It sets a time out that increases our current time every second.
  // It only launches while we haven't achieved tenzies and the timer changes.
  useEffect(() => {
    if (!tenzies) {
      setTimeout(
        () =>
          setCurrentTime((prevTime) => ({
            ...prevTime,
            stat: prevTime.stat + 1,
          })),
        1000,
      );
    }
  }, [currentTime]);

  // This effect checks for our winning condition; all dice must be held on the same value.
  // It updates tenzies to true as soon as all dice meet the requirement.
  // It launches every time our dice change; when we reroll, freeze or start a new game.
  useEffect(() => {
    const allHeld = dice.every(({ isHeld }) => isHeld); // All dice must be frozen/held.
    const firstValue = dice[0].value; // Use the first dice value as our condition.
    const allSame = dice.every(({ value }) => value === firstValue); // All dice are the same.
    if (allHeld && allSame) {
      setTenzies(true);
    }
  }, [dice]);

  // Resets our game to the initial state.
  // Generates new dice, resets our rolls, timer and tenzies status.
  function startOver() {
    // Generate new dice.
    setDice(allNewDice());
    // Reset our tenzies status.
    setTenzies(false);
    // Reset our total rolls.
    setTotalRolls((prevTotalRolls) => ({
      ...prevTotalRolls,
      stat: 0,
    }));
    // Reset our timer.
    setCurrentTime((prevCurrentTime) => ({
      ...prevCurrentTime,
      stat: 0,
    }));
  }

  // Changes the value of any of our die that aren't considered held.
  // Every roll counts towards our rolls counter.
  function rollUnheld() {
    // Reroll unheld dice
    setDice((prevDice) =>
      prevDice.map((die) => {
        if (!die.isHeld) {
          return { ...die, value: Math.ceil(Math.random() * 6) };
        }
        return die;
      }),
    );
    // Increase our roll count.
    setTotalRolls((prevTotalRolls) => ({
      ...prevTotalRolls,
      stat: prevTotalRolls.stat + 1,
    }));
  }

  // Generate a new set of dice with new values; from 1 - 6, inclusive.
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

  // Marks a given dice as held, based on its id.
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

  // Build the JSX containing the set of dice.
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
