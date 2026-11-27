import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import "./App.css";

import {
initialGameState,
allLifeEvents,
drawLifeEvent,
applyEventChoice,
buildLifeJournal,
} from "./gameEngine";

import type {
GameState,
LifeEvent,
} from "./gameEngine";

const boardCells = [
"START",
"CAREER",
"EVENT",
"INCOME",
"FAMILY",
"OPPORTUNITY",
"EXPENSE",
"BUSINESS",
"CRISIS",
"INVESTMENT",
"REST",
"MILESTONE",
];

const colors = {
background: "#101827",
panel: "#1b293b",
panelLight: "#24364c",
text: "#f5f7fb",
muted: "#a9b7c9",
accent: "#75d6b3",
gold: "#f3c969",
danger: "#ef8585",
};

const pageStyle: CSSProperties = {
minHeight: "100vh",
background: colors.background,
color: colors.text,
padding: "28px 16px 50px",
fontFamily: "Arial, sans-serif",
boxSizing: "border-box",
};

const containerStyle: CSSProperties = {
maxWidth: "1050px",
margin: "0 auto",
};

const panelStyle: CSSProperties = {
background: colors.panel,
border: "1px solid #34465c",
borderRadius: "16px",
padding: "20px",
boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
background: colors.accent,
color: "#10251f",
border: "none",
borderRadius: "10px",
padding: "14px 22px",
fontSize: "16px",
fontWeight: 700,
cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
...buttonStyle,
background: colors.panelLight,
color: colors.text,
border: "1px solid #52647a",
};

function formatMoney(value: number) {
return "$" + Math.round(value).toLocaleString("en-US");
}

function StatCard({
label,
value,
color = colors.text,
}: {
label: string;
value: string;
color?: string;
}) {
return (
<div
style={{
...panelStyle,
padding: "16px",
minWidth: 0,
}}
>
<div
style={{
color: colors.muted,
fontSize: "11px",
letterSpacing: "1px",
marginBottom: "9px",
}}
>
{label}
</div>
<div
style={{
color,
fontSize: "clamp(19px, 3vw, 25px)",
fontWeight: 700,
overflowWrap: "anywhere",
}}
>
{value}
</div>
</div>
);
}

export default function App() {
const [game, setGame] = useState<GameState>(initialGameState);
const [started, setStarted] = useState(false);
const [position, setPosition] = useState(0);
const [lastRoll, setLastRoll] = useState(0);
const [isRolling, setIsRolling] = useState(false);
const [diceFace, setDiceFace] = useState(1);
const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
const eventCardRef = useRef<HTMLElement | null>(null);
const messageRef = useRef<HTMLParagraphElement | null>(null);
const [finished, setFinished] = useState(false);
const [message, setMessage] = useState(
"Start your journey and discover what life has in store."
);

const rollDice = () => {
if (!started || currentEvent || finished || isRolling) return;

setIsRolling(true);

const roll = Math.floor(Math.random() * 6) + 1;

window.setTimeout(() => {
setDiceFace(roll);
setLastRoll(roll);

const moveToken = (stepsLeft: number) => {
  if (stepsLeft <= 0) {
    const event = drawLifeEvent(game);

    if (event) {
      setCurrentEvent(event);
      setMessage("A new chapter is waiting for your decision.");
    } else {
      setMessage("There are no more available events.");
    }

    setIsRolling(false);
    return;
  }

  setPosition((previous) => (previous + 1) % boardCells.length);

  window.setTimeout(() => {
    moveToken(stepsLeft - 1);
  }, 180);
};

moveToken(roll);
}, 1100);
};

const chooseOption = (index: 0 | 1) => {
  if (!currentEvent || finished) return;

  const updatedGame = applyEventChoice(game, currentEvent, index);

  setGame(updatedGame);
  setMessage(currentEvent.choices[index].result);
  setCurrentEvent(null);

  if (updatedGame.stats.age >= 80) {
    setFinished(true);
    setMessage("Your journey has reached its final chapter.");
  }

  window.setTimeout(() => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 150);
};

const startGame = () => {
setStarted(true);
setMessage("Your life begins. Roll the dice.");
};

const restartGame = () => {
setGame(initialGameState);
setStarted(false);
setPosition(0);
setLastRoll(0);
setCurrentEvent(null);
setFinished(false);
setMessage("Start your journey and discover what life has in store.");
};

const journal = buildLifeJournal(game);return (
<main style={pageStyle}>
<div style={containerStyle}>
<header
style={{
textAlign: "center",
marginBottom: "28px",
}}
>
<div
style={{
color: colors.accent,
fontSize: "12px",
letterSpacing: "4px",
marginBottom: "10px",
}}
>
THE GAME OF LIFE
</div>

      <h1
        style={{
          fontSize: "clamp(36px, 7vw, 58px)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        YOUR LIFE
      </h1>

      <p style={{ color: colors.muted, marginTop: "12px" }}>
        Every choice changes your story.
      </p>
    </header>

    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      <StatCard label="AGE" value={game.stats.age + " YEARS"} />
      <StatCard
        label="MONEY"
        value={formatMoney(game.stats.money)}
        color={colors.accent}
      />
      <StatCard
        label="ENERGY"
        value={game.stats.energy + " / 100"}
        color={colors.gold}
      />
      <StatCard
        label="HAPPINESS"
        value={game.stats.happiness + " / 100"}
        color="#f3a6bd"
      />
      <StatCard
        label="YEARLY INCOME"
        value={formatMoney(game.stats.annualIncome)}
      />
      <StatCard
        label="YEARLY EXPENSES"
        value={formatMoney(game.stats.annualExpenses)}
      />
    </section>

    <section style={{ ...panelStyle, marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px" }}>
          YOUR LIFE BOARD
        </h2>

        <span style={{ color: colors.muted, fontSize: "13px" }}>
          {allLifeEvents.length} life events in the game
        </span>
      </div>

      <div
  className="board-grid"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "6px",
  }}
>
      
        {boardCells.map((cell, index) => {
const active = position === index && started;

return (
<div
key={cell}
style={{
minHeight: "48px",
borderRadius: "10px",
padding: "5px 3px",
background: active
? "linear-gradient(145deg, #a8f0d0, #54c99d)"
: colors.panelLight,
color: active ? "#10251f" : colors.text,
border: active
? "2px solid #d5ffeb"
: "1px solid #3a5069",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
textAlign: "center",
boxSizing: "border-box",
transition: "all 0.25s ease",
transform: active ? "scale(1.07)" : "scale(1)",
boxShadow: active
? "0 0 22px rgba(80, 220, 170, 0.55)"
: "none",
position: "relative",
zIndex: active ? 2 : 1,
}}
>
<span
style={{
fontSize: "9px",
opacity: active ? 0.8 : 0.55,
marginBottom: "3px",
}}
>
{String(index + 1).padStart(2, "0")}
</span>

  <strong
    style={{
      fontSize: "clamp(9px, 1.8vw, 12px)",
      overflowWrap: "anywhere",
    }}
  >
    {cell}
  </strong>

  {active && (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 900,
        marginTop: "3px",
        letterSpacing: "0.3px",
        animation: "playerPulse 0.7s infinite alternate",
      }}
    >
      ◆ YOU ARE HERE
    </span>
  )}
</div>
);
})}
</div>

      <p
        style={{
          color: colors.muted,
          fontSize: "12px",
          textAlign: "center",
          marginBottom: 0,
        }}
      >
        Roll the dice, move around the board and face life's decisions.
      </p>
    </section>

    <section
      style={{
        ...panelStyle,
        marginBottom: "18px",
        textAlign: "center",
      }}
    >
      <div style={{ color: colors.muted, fontSize: "13px" }}>
        LAST DICE ROLL
      </div>

      <div
  style={{
    width: "90px",
    height: "90px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "12px auto",
    fontSize: "48px",
    fontWeight: 800,
    color: colors.gold,
    background: "#18243b",
    border: "2px solid #d6ad55",
    borderRadius: "18px",
    boxShadow: "0 0 22px rgba(214, 173, 85, 0.2)",
    transform: isRolling
      ? "rotate(720deg) scale(1.15)"
      : "rotate(0deg) scale(1)",
    transition: "transform 1.1s ease-in-out",
  }}
>
  {isRolling ? "🎲" : lastRoll ? diceFace : "—"}
</div>

      <p 
      ref={messageRef}
      style={{ color: colors.muted, margin: "8px 0 18px" }}>
        {message}
      </p>

      {!started && !finished && (
        <button style={buttonStyle} onClick={startGame}>
          START YOUR LIFE
        </button>
      )}

      {started && !finished && (
        <button
          style={buttonStyle}
          onClick={rollDice}
          disabled={Boolean(currentEvent)}
        >
          ROLL THE DICE
        </button>
      )}
    </section>

    {currentEvent && !finished && (
      <section
      ref={eventCardRef}
        style={{
          ...panelStyle,
          marginBottom: "18px",
          border: "1px solid " + colors.accent,
          animation: "eventReveal 0.5s ease-out",
        }}
      >
        <div
          style={{
            color: colors.accent,
            fontSize: "11px",
            letterSpacing: "2px",
            marginBottom: "10px",
          }}
        >
          {currentEvent.category} EVENT
        </div>

        <h2 style={{ fontSize: "26px", margin: "0 0 12px" }}>
          {currentEvent.title}
        </h2>

        <p
          style={{
            color: colors.muted,
            lineHeight: 1.6,
            marginBottom: "22px",
          }}
        >
          {currentEvent.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {currentEvent.choices.map((choice, index) => (
            <button
              key={choice.label}
              onClick={() => chooseOption(index as 0 | 1)}
            style={{
  ...secondaryButtonStyle,
  textAlign: "left",
  padding: "18px",
  minHeight: "110px",
  borderRadius: "12px",
  border: "1px solid " + colors.accent,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "8px",
  transition: "transform 0.2s ease",
}}
            >
              <strong style={{ display: "block", marginBottom: "8px" }}>
                {index + 1}. {choice.label}
              </strong>

              <span
                style={{
                  color: colors.muted,
                  fontSize: "12px",
                  fontWeight: 400,
                }}
              >
                {choice.result}
              </span>
            </button>
          ))}
        </div>
      </section>
    )}{finished && (
      <section
        style={{
          ...panelStyle,
          marginBottom: "18px",
          border: "1px solid " + colors.gold,
        }}
      >
        <div
          style={{
            color: colors.gold,
            fontSize: "12px",
            letterSpacing: "3px",
            marginBottom: "12px",
          }}
        >
          YOUR LIFE JOURNAL
        </div>

        <h2 style={{ fontSize: "28px", marginTop: 0 }}>
          The Story of Your Life
        </h2>

        <p style={{ color: colors.muted, lineHeight: 1.6 }}>
          Every decision brought you here. This is the story of your journey.
        </p>

        <div style={{ marginTop: "22px" }}>
          {journal.map((line, index) => (
            <p
              key={index}
              style={{
                padding: "12px 14px",
                background: colors.panelLight,
                borderRadius: "8px",
                lineHeight: 1.5,
                margin: "8px 0",
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <h3 style={{ marginTop: "26px" }}>Your Life Decisions</h3>

        {game.history.map((entry, index) => (
          <div
            key={index}
            style={{
              borderLeft: "3px solid " + colors.accent,
              padding: "8px 14px",
              margin: "12px 0",
              background: colors.panelLight,
              borderRadius: "0 8px 8px 0",
            }}
          >
            <div style={{ color: colors.accent, fontSize: "12px" }}>
              AGE {entry.age} · {entry.category}
            </div>

            <strong style={{ display: "block", margin: "5px 0" }}>
              {entry.eventTitle}
            </strong>

            <div style={{ color: colors.muted, fontSize: "13px" }}>
              Choice: {entry.choice}
            </div>

            <div style={{ fontSize: "13px", marginTop: "5px" }}>
              {entry.result}
            </div>
          </div>
        ))}
      </section>
    )}

    {started && !finished && (
      <section style={{ ...panelStyle, marginBottom: "18px" }}>
        <h3 style={{ marginTop: 0 }}>Your Life So Far</h3>

        <p style={{ color: colors.muted, marginBottom: "12px" }}>
          Important decisions: {game.history.length}
        </p>

        {game.history.length === 0 ? (
          <p style={{ color: colors.muted }}>
            Your story is just beginning.
          </p>
        ) : (
          game.history.slice(-3).reverse().map((entry, index) => (
            <div
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #34465c",
              }}
            >
              <strong>{entry.eventTitle}</strong>
              <div style={{ color: colors.muted, fontSize: "13px" }}>
                Age {entry.age} · {entry.choice}
              </div>
            </div>
          ))
        )}
      </section>
    )}

    {finished && (
      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <button style={buttonStyle} onClick={restartGame}>
          START A NEW LIFE
        </button>
      </div>
    )}

    <footer
      style={{
        textAlign: "center",
        color: colors.muted,
        fontSize: "12px",
        marginTop: "30px",
      }}
    >
      YOUR LIFE · Every choice has a consequence.
    </footer>
  </div>
</main>
);
}