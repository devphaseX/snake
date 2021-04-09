import { useState, useCallback, useEffect } from 'react';
import Style from './Board.module.css';
import {
  getNextDirection,
  mapInputToKey,
  MappedDirectionKey,
  handleFoodPickCell,
  getGrowthNodeCoord,
  keyDirection,
  getNextNodeDirection,
  getOppositeDirection,
} from './snake';

import type { Snake, SnakeCells } from './snake';
import {
  createBoard,
  randomlyPickSnakeCell,
  SinglyLinkedList,
  LinkedListNode,
  reverseLinkList,
  getCellClassName,
} from '../util/index';

import { useInterval } from '../hooks/useInterval';

const BOARD_SIZE = 10;
const boardInternal = createBoard(BOARD_SIZE);
const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;

const Board = () => {
  const autoPickedSnakeCeil = randomlyPickSnakeCell(boardInternal);
  const [score, setScore] = useState(0);
  const [snakeCells, setSnakeCells] = useState(new Set([autoPickedSnakeCeil]));
  const [foodCell, setFoodCell] = useState(
    handleFoodPickCell(boardInternal, { row: BOARD_SIZE, col: BOARD_SIZE })
  );
  const [snake, setSnake] = useState(
    new SinglyLinkedList(autoPickedSnakeCeil, null)
  );
  const [direction, setDirection] = useState<MappedDirectionKey>(
    keyDirection.ArrowRight
  );
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] = useState(
    false
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let enteredKey = mapInputToKey(e.key);
      if (enteredKey === '') return;

      const snakeWillRunIntoItSelf =
        getOppositeDirection(enteredKey) === direction && snakeCells.size > 1;

      if (snakeWillRunIntoItSelf) return;
      setDirection(enteredKey);
    },
    [direction, snakeCells.size]
  );

  function moveSnake(): void {
    const nextSnakeCell = getNextDirection({
      key: direction,
      currentCeil: snake.head!.value,
      board: boardInternal,
    });

    if (!nextSnakeCell || snakeCells.has(nextSnakeCell)) {
      return handleGameOver();
    }

    let shorterSnake = snake.detachHeadAndTail();
    let biggerSnake = new SinglyLinkedList(nextSnakeCell, null);

    if (shorterSnake) {
      let { newHead, newTail } = shorterSnake;
      if (newTail) {
        biggerSnake.tail = newTail;
      }
      if (newHead) {
        newHead.next = biggerSnake.head;
      }
    }

    let newSnakeCells = new Set([nextSnakeCell, ...snakeCells]);
    newSnakeCells.delete(snake.tail!.value);

    const foodConsumed = nextSnakeCell === foodCell;

    if (foodConsumed) {
      const grownSnake = growSnake(biggerSnake, newSnakeCells);
      [biggerSnake, newSnakeCells] = grownSnake;
      if (foodShouldReverseDirection) reverseSnake();
      handleFoodConsumption();
    }

    setSnake(biggerSnake);
    setSnakeCells(newSnakeCells);
  }

  function growSnake(
    biggerSnake: Snake<number>,
    prevSnakeCells: SnakeCells<number>
  ): [Snake<number>, SnakeCells<number>] {
    const growthCell = getGrowthNodeCoord(
      boardInternal,
      biggerSnake.tail!,
      direction
    );

    if (!growthCell) return [biggerSnake, prevSnakeCells];
    // Snake is positioned such that it can't grow; don't do anything.
    const newTail = new LinkedListNode(growthCell);
    newTail.next = biggerSnake.tail;
    biggerSnake.tail = newTail;
    return [biggerSnake, new Set([...prevSnakeCells, growthCell])];
  }

  useInterval(moveSnake, 200);

  useEffect(() => {
    const keydownHandler = (e: any) => handleKeyDown(e);
    window.addEventListener('keydown', keydownHandler);
    return () => {
      window.removeEventListener('keydown', keydownHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reverseSnake(): void {
    const tailNextNodeDirection = getNextNodeDirection(snake.tail!, direction);
    if (tailNextNodeDirection === '') return;
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);

    // The tail of the snake is really the head of the linked list, which
    // is why we have to pass the snake's tail to `reverseLinkedList`.
    const reversedSnakeDetail = reverseLinkList(snake.tail);
    if (reversedSnakeDetail && 'head' in reversedSnakeDetail) {
      const { head, tail } = reversedSnakeDetail;
      snake.head = head;
      snake.tail = tail;
    }
  }

  function handleFoodConsumption(): void {
    let nextFoodCell = randomlyPickSnakeCell(boardInternal);
    let isFoodOnSnake =
      snakeCells.has(nextFoodCell) || foodCell === nextFoodCell;
    while (isFoodOnSnake) {
      nextFoodCell = randomlyPickSnakeCell(boardInternal);
      isFoodOnSnake = snakeCells.has(nextFoodCell) || foodCell === nextFoodCell;
    }

    const nextFoodShouldReverseDirection =
      Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setFoodCell(nextFoodCell);
    setScore(score + 1);
  }

  const handleGameOver = (): void => {
    setScore(0);
    const snakeLLStartingValue = randomlyPickSnakeCell(boardInternal);
    setSnake(new SinglyLinkedList(snakeLLStartingValue, null));
    setFoodCell(handleFoodPickCell(boardInternal, snakeLLStartingValue));
    setSnakeCells(new Set([snakeLLStartingValue]));
    setDirection(keyDirection.ArrowRight);
  };

  return (
    <>
      <h1 className={Style.Score}>Score: {score}</h1>
      <div>
        <div className={Style.Board}>
          {boardInternal.map((row, rowIdx) => (
            <div key={rowIdx} className={Style.Row}>
              {row.map((col, colIdx) => {
                const className = getCellClassName(
                  Style,
                  col,
                  foodCell,
                  foodShouldReverseDirection,
                  snakeCells
                );
                return <div key={colIdx} className={className}></div>;
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export { Board };
