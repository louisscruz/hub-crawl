'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _linkedListNode = require('./linked-list-node');

var _linkedListNode2 = _interopRequireDefault(_linkedListNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinkedList = function () {
  function LinkedList() {
    _classCallCheck(this, LinkedList);

    this.tail = new _linkedListNode2.default(null);
    this.head = new _linkedListNode2.default(null, this.tail);
    this.length = 0;
  }

  _createClass(LinkedList, [{
    key: 'enqueue',
    value: function enqueue(element) {
      this.length += 1;
      if (this.length === 1) {
        this.head.value = element;
        return this.head.value;
      } else if (this.length === 2) {
        this.tail.value = element;
        return this.tail.value;
      }
      this.tail.next = new _linkedListNode2.default(element);
      this.tail = this.tail.next;
      return this.tail.value;
    }
  }, {
    key: 'dequeue',
    value: function dequeue() {
      if (this.length === 0) return;
      this.length -= 1;
      var oldHead = this.head;
      if (this.length >= 2) {
        this.head = this.head.next;
        return oldHead.value;
      } else if (this.length === 1) {
        this.head = this.head.next;
        this.tail = new _linkedListNode2.default(null);
        this.head.next = this.tail;
        return oldHead.value;
      } else if (this.length === 0) {
        this.head = new _linkedListNode2.default(null, this.tail);
        return oldHead.value;
      }
    }
  }, {
    key: 'forEach',
    value: function forEach(cb) {
      var currentNode = this.head;
      if (this.length === 0) {
        return;
      } else if (this.length === 1) {
        cb(currentNode.value);
      } else if (this.length) {
        cb(currentNode.value);
        while (currentNode.next) {
          currentNode = currentNode.next;
          cb(currentNode.value);
        }
      }
    }
  }]);

  return LinkedList;
}();

exports.default = LinkedList;