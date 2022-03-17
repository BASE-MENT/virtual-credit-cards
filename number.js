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

const TYPE = require("./type");
const NAME = "cc-number";

module.exports = CardNumberInput;

function CardNumberInput(data) {
  data = data || {};

  return State({
    raw: Observ(data.raw || ""),
    value: Observ(data.value || null),
    channels: {
      change: change,
    },
  });
}

function change(state, data) {
  const value = data[NAME];

  // Truncates invalid card patterns
  const reformat = pipe(card.parse, card.format, card.parse);
  const number = value ? reformat(value) : "";

  state.set({
    raw: number,
    value: parse(number),
  });
}

function parse(number) {
  return number && card.type(number) ? number : null;
}

CardNumberInput.validate = function validate(state, types) {
  const number = value(state.value);
  if (!number) return;
  types = types || [];
  if (!types.length) return card.isValid(number);
  return types.some((type) => card.isValid(number, type));
};

CardNumberInput.render = function render(state, options) {
  return h(
    "input",
    extend(
      {
        name: NAME,
        autocomplete: NAME,
        type: TYPE,
        placeholder: "Card number",
        pattern: numeric,
        value: card.format(state.value || card.parse(state.raw)),
        "ev-event": changeEvent(state.channels.change),
      },
      options
    )
  );
};
