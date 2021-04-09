export type Board<T> = Cell<T>[][];
export function genRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * max - min + 1) + min;
}

export class LinkedListNode<T = any> {
  next: LinkedListNode<T> | null = null;
  value: T;
  constructor(value: T, next?: LinkedListNode) {
    this.value = value;
    if (next) {
      this.next = next;
    }
  }
}

type DetachHeadAndTail<T> = {
  newHead: LinkedListNode<T> | null;
  newTail: LinkedListNode<T> | null;
};

export class SinglyLinkedList<T> {
  head: LinkedListNode<T> | null;
  tail: LinkedListNode<T> | null;
  constructor(value: T, tail: LinkedListNode<T> | null) {
    const node = new LinkedListNode(value);
    this.head = node;
    if (!tail) {
      this.tail = this.head;
    } else {
      this.tail = tail;
    }
  }

  detachHeadAndTail() {
    if (!this.tail || this.tail === this.head) return null;
    const wanted = { newTail: this.tail.next } as DetachHeadAndTail<T>;
    let nodePriorTail = this.tail.next;
    while (nodePriorTail && this.head !== nodePriorTail) {
      nodePriorTail = nodePriorTail.next;
    }
    wanted.newHead = nodePriorTail;
    return wanted;
  }
}

type EmptyLinkedListNode<T> = LinkedListNode<T> | null;
export function reverseLinkList<T>(head: EmptyLinkedListNode<T> | null) {
  // eslint-disable-next-line no-mixed-operators
  if (
    !(head instanceof Object) ||
    (head instanceof Object && Object.keys(head).length > 2)
  )
    return head;
  let current = head;
  let previousNode = new LinkedListNode(head.value);
  let newHead = previousNode;
  while (current.next !== null) {
    const nextNode = new LinkedListNode(current.next.value);
    nextNode.next = previousNode;
    previousNode = nextNode;
    current = current.next;
  }
  return { head: newHead, tail: previousNode };
}

export class Cell<T> {
  constructor(
    public readonly row: number,
    public readonly col: number,
    public readonly cell: T
  ) {}
}

function createBoard(square: number): Board<number>;
function createBoard(row: number, col: number): Board<number>;
function createBoard(row: number, col?: number): Board<number> {
  let count = 1;
  let column = typeof col === 'number' ? col : row;
  return Array.from({ length: row }, (_, row) =>
    Array.from({ length: column }, (_, col) => ({ row, col, cell: count++ }))
  );
}

function randomlyPickSnakeCell<T>(board: Board<T>): Cell<T> {
  let selectedRow = genRandomNumber(0, board.length - 1);
  let selectedCol = genRandomNumber(0, Math.floor(board[0].length - 1 / 3));
  return board[selectedRow][selectedCol];
}

export type Coordinate2D = {
  row: number;
  col: number;
};

export { createBoard, randomlyPickSnakeCell };

type Style = { [ClassName: string]: string };

export const getCellClassName = <T>(
  style: Style,
  cellValue: Cell<T>,
  foodCell: Cell<T>,
  foodShouldReverseDirection: boolean,
  snakeCells: Set<Cell<T>>
) => {
  let className = style['Cell'];
  if (cellValue === foodCell) {
    if (foodShouldReverseDirection) {
      className += ' ' + style['FoodReverse'];
    } else {
      className += ' ' + style['Food'];
    }
  }
  if (snakeCells.has(cellValue)) className += ' ' + style['Snake'];

  return className;
};
