"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Link = function Link(href, location, text) {
  _classCallCheck(this, Link);

  this.href = href;
  this.location = location;
  this.text = text;
};

exports.default = Link;