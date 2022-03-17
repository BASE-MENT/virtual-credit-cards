"use strict";

const test = require("tape");
const thermometer = require("thermometer");
const raf = require("raf");
const walk = require("dom-walk");
const dispatch = require("dispatch-event");
const Form = require("./example");

test("full example", function (t) {
  t.plan(6);
  const render = thermometer.createComponent(Form);

  render(function (state, element, done) {
    const numberInput = walk(element, function (node) {
      return node.tagName === "INPUT" && node.name === "cc-number" && node;
    });

    const expirationInput = walk(element, function (node) {
      return node.tagName === "INPUT" && node.name === "cc-exp" && node;
    });

    const cvcInput = walk(element, function (node) {
      return node.tagName === "INPUT" && node.name === "cc-csc" && node;
    });

    t.equal(
      numberInput.style.borderColor,
      "red",
      "cc number initially invalid"
    );
    t.equal(
      expirationInput.style.borderColor,
      "red",
      "cc exp initially invalid"
    );
    t.equal(cvcInput.style.borderColor, "red", "cc cvc initially invalid");

    state.number.value.set(["4242", "4242", "4242", "4242"].join(""));
    state.expiration.value.set({ month: 10, year: 2050 });
    state.cvc.value.set("123");

    raf(function () {
      t.equal(numberInput.style.borderColor, "green", "cc number valid");
      t.equal(expirationInput.style.borderColor, "green", "cc exp valid");
      t.equal(cvcInput.style.borderColor, "green", "cc cvc valid");
    });
  });
});

test("type integration", function (t) {
  t.plan(3);
  const render = thermometer.createComponent(Form);

  render(function (state, element, done) {
    const numberInput = walk(element, function (node) {
      return node.tagName === "INPUT" && node.name === "cc-number" && node;
    });

    const cvcInput = walk(element, function (node) {
      return node.tagName === "INPUT" && node.name === "cc-csc" && node;
    });

    const visaCheckbox = walk(element, function (node) {
      return (
        node.tagName === "LABEL" &&
        node.childNodes[0].data === "Visa" &&
        node.parentNode.childNodes[0]
      );
    });

    dispatch(visaCheckbox, "change");
    t.equal(state.types.Visa(), false);

    state.number.value.set(["4242", "4242", "4242", "4242"].join(""));
    state.cvc.value.set("1234");

    raf(function () {
      t.equal(
        numberInput.style.borderColor,
        "red",
        "cc number invalid (disallowed type)"
      );
      t.equal(
        cvcInput.style.borderColor,
        "red",
        "cc cvc invalid (mismatched with type)"
      );
    });
  });
});
