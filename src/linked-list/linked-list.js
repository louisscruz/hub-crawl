import LinkedListNode from './linked-list-node';

class LinkedList {
  constructor() {
    this.tail = new LinkedListNode();
    this.head = new LinkedListNode(null, this.tail);
    this.length = 0;
  }

  enqueue(element) {
    this.length += 1;
    if (this.length === 1) {
      this.head.value = element;
      return this.head.value;
    } else if (this.length === 2) {
      this.tail.value = element;
      return this.tail.value;
    } else {
      this.tail.next = new LinkedListNode(element);
      this.tail = this.tail.next;
      return this.tail.value;
    }
  }

  dequeue() {
    if (this.length === 0) return;
    this.length -= 1;
    const oldHead = this.head;
    if (this.length >= 2) {
      this.head = this.head.next;
      return oldHead.value;
    } else if (this.length === 1) {
      this.head = this.head.next;
      this.tail = new LinkedListNode;
      this.head.next = this.tail;
      return oldHead.value
    } else if (this.length === 0) {
      this.head = new LinkedListNode(null, this.tail);
      return oldHead.value;
    }
  }
}

export default LinkedList;
