import LinkedListNode from './linked-list-node';

class LinkedList {
  constructor() {
    this.tail = new LinkedListNode();
    this.head = new LinkedListNode(null, this.tail);
    this.length = 0;
  }

  enqueue(element) {
    if (this.length === 0) {
      this.head.value = element;
    } else if (this.length === 1) {
      this.tail.value = element;
    } else {
      this.tail.next = new LinkedListNode(element);
      this.tail = this.tail.next;
    }
    this.length += 1;
    return this.tail;
  }

  dequeue() {
    if (this.length === 0) return;
    this.length -= 1;
    const oldHead = this.head;
    if (this.length >= 3) {
      this.head = this.head.next;
      return oldHead.value;
    } else if (this.length === 2) {
      this.head = this.head.next;
      this.tail = new LinkedListNode;
      this.head.next = this.tail;
      return oldHead.value
    } else if (this.length === 1) {
      this.head = new LinkedListNode(null, this.tail);
      return oldHead.value;
    }
  }
}

export default LinkedList;
