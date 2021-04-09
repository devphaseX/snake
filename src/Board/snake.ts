import { genRandomNumber, SinglyLinkedList } from '../util';
import type { Board, LinkedListNode, Cell, Coordinate2D } from '../util';

type KeyDirection = {
  readonly ArrowUp: 'UP';
  readonly ArrowDown: 'DOWN';
  readonly ArrowRight: 'RIGHT';
  readonly ArrowLeft: 'LEFT';
};

export type Snake<T> = SinglyLinkedList<Cell<T>>;
export type SnakeCells<T> = Set<Cell<T>>;

export const keyDirection: KeyDirection = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowRight: 'RIGHT',
  ArrowLeft: 'LEFT',
};

type Direction = keyof KeyDirection;
export type MappedDirectionKey = KeyDirection[Direction];

export function isKeyAllowedForMovement(key: string): key is Direction {
  return key in keyDirection;
}

export function mapInputToKey(key: string): MappedDirectionKey | '' {
  if (isKeyAllowedForMovement(key)) {
    return keyDirection[key];
  }
  return '';
}

type GetNextDirection<T> = {
  key: MappedDirectionKey;
  board: Board<T>;
  currentCeil: Omit<Cell<T>, 'cell'>;
};

export function getNextDirection<T>({
  key,
  board,
  currentCeil,
}: GetNextDirection<T>): Cell<T> | null {
  const { row, col } = currentCeil;
  switch (key) {
    case 'UP':
      return getCeil({ row: row - 1, col }, board);
    case 'DOWN':
      return getCeil({ row: row + 1, col }, board);
    case 'RIGHT':
      return getCeil({ row: row, col: col + 1 }, board);
    case 'LEFT':
      return getCeil({ row: row, col: col - 1 }, board);
  }
}

function getCeil<T>(coord: Coordinate2D, board: Board<T>): Cell<T> | null {
  return board[coord.row]?.[coord.col] ?? null;
}

export function handleFoodPickCell<T>(board: Board<T>, coord: Coordinate2D) {
  const newRow = genRandomNumber(
    0,
    Math.trunc(Math.random() * (coord.row - 2))
  );
  const newCol = genRandomNumber(
    1,
    Math.trunc(Math.random() * (coord.col - 3))
  );
  return board[newRow][newCol];
}

export const getNextNodeDirection = <T>(
  node: LinkedListNode<Cell<T>>,
  currentDirection: MappedDirectionKey
) => {
  if (node.next === null) return currentDirection;
  const { row: currentRow, col: currentCol } = node.value;
  const { row: nextRow, col: nextCol } = node.next.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) {
    return keyDirection[`ArrowRight` as Direction];
  }

  if (nextRow === currentRow && nextCol === currentCol - 1) {
    return keyDirection['ArrowLeft' as Direction];
  }
  if (nextCol === currentCol && nextRow === currentRow + 1) {
    return keyDirection['ArrowDown' as Direction];
  }

  if (nextCol === currentCol && nextRow === currentRow - 1) {
    return keyDirection['ArrowUp' as Direction];
  }
  return '';
};

export const getOppositeDirection = (
  direction: MappedDirectionKey
): MappedDirectionKey => {
  switch (direction) {
    case 'UP':
      return 'DOWN';
    case 'DOWN':
      return 'UP';
    case 'LEFT':
      return 'RIGHT';
    case 'RIGHT':
      return 'LEFT';
    default:
      throw new TypeError(
        `Unable to handle direction: Direction key has be of the type ${Object.values(
          keyDirection
        ).join(',')}`
      );
  }
};

export function getGrowthNodeCoord<T>(
  board: Board<T>,
  snakeTail: LinkedListNode<Cell<T>>,
  currentDirection: MappedDirectionKey
) {
  const tailNextNodeDirection = getNextNodeDirection(
    snakeTail,
    currentDirection
  );

  if (tailNextNodeDirection !== '') {
    const growthDirection = getOppositeDirection(tailNextNodeDirection);
    const growthNodeCoord = getNextDirection({
      currentCeil: snakeTail.value,
      board,
      key: growthDirection,
    });
    return growthNodeCoord;
  }

  throw new TypeError(
    `Unable to handle direction: Direction
     key has be of the type ${Object.values(keyDirection).join(',')}`
  );
}
