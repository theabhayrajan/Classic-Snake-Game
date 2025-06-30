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



const scale = 20;
const boardSize = 480;

const App = () => {
  const [snake, setSnake] = useState([{ x: boardSize / 2, y: boardSize / 2 }]);
  const [food, setFood] = useState(generateFood([{ x: boardSize / 2, y: boardSize / 2 }]));
  const [dx, setDx] = useState(scale);
  const [dy, setDy] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("highScore")) || 0
  );

  const gameLoopRef = useRef(null);

  const startGame = () => {
    setSnake([{ x: boardSize / 2, y: boardSize / 2 }]);
    setFood(generateFood([{ x: boardSize / 2, y: boardSize / 2 }]));
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
      setFood(generateFood(newSnake));
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
      <GameBoard>
        {snake.map((segment, idx) => (
          <Segment key={idx} style={{ left: segment.x, top: segment.y }} />
        ))}
        <Food style={{ left: food.x, top: food.y }} />
      </GameBoard>
      <Button onClick={startGame} disabled={isRunning}>
        {isRunning ? "Game Running..." : score > 0 ? "Play Again!" : "Start Game"}
      </Button>
      {!isRunning && score > 0 && <GameOver>Game Over! Your score: {score}</GameOver>}
    </Container>
  );
};

const generateFood = (snake) => {
  let x, y;
  do {
    x = Math.floor(Math.random() * (boardSize / scale)) * scale;
    y = Math.floor(Math.random() * (boardSize / scale)) * scale;
  } while (snake.some((s) => s.x === x && s.y === y));
  return { x, y };
};

export default App;
