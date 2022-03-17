"use strict";

const State = require("dover");
const Observ = require("observ");
const value = require("observ-value");
const pad = require("zero-fill")(2);

const h = require("virtual-dom/h");
const extend = require("xtend");
const numeric = require("numeric-pattern");
const changeEvent = require("value-event/change");
const expiration = require("creditcards/expiration");

const TYPE = require("./type");
// MM / YY
const MM_YY = /^\D*(\d{1,2})(\D+)?(\d{1,4})?/;
// Specific name helps autofill kick in
const NAME = "cc-exp";
const SEPARATOR = " / ";

module.exports = ExpirationInput;

function ExpirationInput(data) {
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
  state.set({
    raw: value,
    value: parse(value),
  });
}

ExpirationInput.validate = function validate(state) {
  const data = value(state.value);

  return (
    Boolean(data) &&
    expiration.month.isValid(data.month) &&
    expiration.year.isValid(data.year) &&
    !expiration.isPast(data.month, data.year)
  );
};

ExpirationInput.render = function render(state, options) {
  return h(
    "input",
    extend(
      {
        name: NAME,
        autofill: NAME,
        type: TYPE,
        placeholder: "MM" + SEPARATOR + "YY",
        pattern: numeric,
        maxLength: 2 + SEPARATOR.length + 4,
        value: format(state.value) || reformat(state.raw),
        "ev-event": changeEvent(state.channels.change),
      },
      options
    )
  );
};

function parse(raw) {
  const parts = raw.match(MM_YY);
  if (!parts) return null;

  const rawMonth = parts[1];
  const rawYear = parts[3];

  if (!rawYear || rawYear.length % 2) return null;

  return {
    month: expiration.month.parse(rawMonth),
    year: expiration.year.parse(rawYear, rawYear.length < 4),
  };
}

function format(expiration) {
  if (!expiration) return;
  return [
    pad(expiration.month),
    expiration.year >= 2000 && expiration.year <= 2100
      ? String(expiration.year).substring(2)
      : expiration.year,
  ].join(SEPARATOR);
}

function reformat(raw) {
  if (!raw) return "";
  const parts = raw.match(MM_YY);
  if (!parts) return "";

  let month = parts[1] || "";
  let separator = parts[2] || "";
  const year = parts[3] || "";

  if (year.length > 0) {
    separator = SEPARATOR;
  } else if (separator === " /") {
    month = month.substring(0, 1);
    separator = "";
  } else if (month.length === 2 || separator) {
    separator = SEPARATOR;
  } else if (month.length === 1 && month !== "0" && month !== "1") {
    month = "0" + month;
    separator = " / ";
  }

  return [month, separator, year].join("");
}
