"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinkedListNode = function LinkedListNode(value, next) {
  _classCallCheck(this, LinkedListNode);

  this.value = value;
  this.next = next || null;
};

exports.default = LinkedListNode;