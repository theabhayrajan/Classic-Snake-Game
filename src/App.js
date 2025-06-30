import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";

const Container = styled.div`
  text-align: center;
  width: 90vw;
  max-width: 520px;
  margin: auto;
`;

const Title = styled.h1`
  color: #fff;
  text-shadow: 2px 2px 8px #000;
  font-size: 2em;
`;

const GameBoard = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background-color: #75cfff;
  border: 10px dashed red;
  margin: 20px auto;
  box-sizing: border-box;
  touch-action: manipulation; /* allows better touch interaction */
`;

const Segment = styled.div`
  position: absolute;
  width: 4.2%;
  height: 4.2%;
  background: linear-gradient(to right, #e5ff00, #fbe203);
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const Food = styled.div`
  position: absolute;
  width: 4.2%;
  height: 4.2%;
  background-color: #ff4500;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const Button = styled.button`
  padding: 15px 30px;
  font-size: 1.2em;
  font-weight: bold;
  background-color: black;
  color: white;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover:enabled {
    background-color: red;
  }

  &:disabled {
    background-color: grey;
    cursor: not-allowed;
  }
`;

const ScoreBoard = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 3px #000;
`;

const Score = styled.div`
  font-size: 1.1em;
`;

const GameOver = styled.div`
  color: white;
  font-size: 1.3em;
  font-weight: bold;
  margin-top: 15px;
  text-shadow: 2px 2px 6px #000;
`;

const ControlBtn = styled.button`
  padding: 15px;
  margin: 5px;
  font-size: 1.8em;
  border: none;
  border-radius: 10px;
  background: white;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.4);
  cursor: pointer;
  &:active {
    background: #ff5252;
    color: white;
  }
`;

const scale = 20; // one grid cell size in px

const App = () => {
  const boardRef = useRef(null); // ✅ ref to measure GameBoard's real size
  const [boardSize, setBoardSize] = useState(null); // ✅ dynamic board size

  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState({ x: 0, y: 0 });
  const [dx, setDx] = useState(scale);
  const [dy, setDy] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(Number(localStorage.getItem("highScore")) || 0);
  const [isTouch, setIsTouch] = useState(false);

  const gameLoopRef = useRef(null);

  // ✅ Measure board size on mount & resize
  useEffect(() => {
    const measureBoard = () => {
      if (boardRef.current) {
        setBoardSize(boardRef.current.offsetWidth);
      }
    };
    measureBoard();
    window.addEventListener("resize", measureBoard);
    return () => window.removeEventListener("resize", measureBoard);
  }, []);

  useEffect(() => {
    setIsTouch("ontouchstart" in window);
  }, []);

  const startGame = () => {
    if (boardSize === null) return; // wait until board size is ready
    const startPos = Math.floor(boardSize / (2 * scale)) * scale; // center on grid
    const startSnake = [{ x: startPos, y: startPos }];
    setSnake(startSnake);
    setFood(generateFood(startSnake, boardSize));
    setDx(scale);
    setDy(0);
    setIsRunning(true);
    setScore(0);
  };

  const gameOver = () => {
    setIsRunning(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score);
    }
  };

  useEffect(() => {
    if (isRunning) {
      gameLoopRef.current = setTimeout(() => {
        moveSnake();
      }, 200);
    }
    return () => clearTimeout(gameLoopRef.current);
  }, [snake, isRunning]);

  const moveSnake = () => {
    if (boardSize === null) return;
    const newHead = { x: snake[0].x + dx, y: snake[0].y + dy };
    const newSnake = [newHead, ...snake];

    if (
      newHead.x < 0 ||
      newHead.x >= boardSize ||
      newHead.y < 0 ||
      newHead.y >= boardSize ||
      newSnake.slice(1).some((segment) => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      gameOver();
      return;
    }

    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood(newSnake, boardSize));
      setScore((prev) => prev + 1);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const changeDirection = (e) => {
    if (e.key === "ArrowUp" && dy === 0) {
      setDx(0);
      setDy(-scale);
    } else if (e.key === "ArrowDown" && dy === 0) {
      setDx(0);
      setDy(scale);
    } else if (e.key === "ArrowLeft" && dx === 0) {
      setDx(-scale);
      setDy(0);
    } else if (e.key === "ArrowRight" && dx === 0) {
      setDx(scale);
      setDy(0);
    }
  };

  const setDir = (newDx, newDy) => {
    if ((newDx !== 0 && dx === 0) || (newDy !== 0 && dy === 0)) {
      setDx(newDx);
      setDy(newDy);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", changeDirection);
    return () => window.removeEventListener("keydown", changeDirection);
  });

  return (
    <Container>
      <Title>Classic Snake Game 🐍</Title>
      <ScoreBoard>
        <Score>Current Score: {score}</Score>
        <Score>High Score: {highScore}</Score>
      </ScoreBoard>
      <GameBoard ref={boardRef}>
        {snake.map((segment, idx) => (
          <Segment key={idx} style={{ left: segment.x, top: segment.y }} />
        ))}
        <Food style={{ left: food.x, top: food.y }} />
      </GameBoard>

      {isTouch && isRunning && (
        <div style={{ margin: "20px 0" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ControlBtn onClick={() => setDir(0, -scale)}>⬆️</ControlBtn>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ControlBtn onClick={() => setDir(-scale, 0)}>⬅️</ControlBtn>
            <div style={{ width: "20px" }} />
            <ControlBtn onClick={() => setDir(scale, 0)}>➡️</ControlBtn>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ControlBtn onClick={() => setDir(0, scale)}>⬇️</ControlBtn>
          </div>
        </div>
      )}

      <Button onClick={startGame} disabled={isRunning || boardSize === null}>
        {isRunning ? "Game Running..." : score > 0 ? "Play Again!" : "Start Game"}
      </Button>

      {!isRunning && score > 0 && <GameOver>Game Over! Your score: {score}</GameOver>}
    </Container>
  );
};

const generateFood = (snake, boardSize) => {
  let x, y;
  const cells = Math.floor(boardSize / scale);
  do {
    x = Math.floor(Math.random() * cells) * scale;
    y = Math.floor(Math.random() * cells) * scale;
  } while (snake.some((s) => s.x === x && s.y === y));
  return { x, y };
};

export default App;
