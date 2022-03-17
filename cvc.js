"use strict";

const State = require("dover");
const Observ = require("observ");
const value = require("observ-value");
const pipe = require("value-pipe");

const h = require("virtual-dom/h");
const changeEvent = require("value-event/change");
const extend = require("xtend");
const numeric = require("numeric-pattern");
const card = require("creditcards").card;
const cvc = require("creditcards").cvc;

const TYPE = require("./type");
const NAME = "cc-csc";

module.exports = CardNumberInput;

function CardNumberInput(data) {
  data = data || {};

  return State({
    value: Observ(data.value || ""),
    channels: {
      change: change,
    },
  });
}

function change(state, data) {
  pipe(card.parse, state.value.set)(data[NAME]);
}

CardNumberInput.validate = function validate(state, type) {
  const code = value(state.value);
  return cvc.isValid(code, type);
};

CardNumberInput.render = function render(state, options) {
  return h(
    "input",
    extend(
      {
        name: NAME,
        autocomplete: NAME,
        type: TYPE,
        placeholder: "CVC",
        pattern: numeric,
        maxLength: 4,
        value: state.value,
        "ev-event": changeEvent(state.channels.change),
      },
      options
    )
  );
};
