import React from "react";
import { Text, useInput } from "ink";
import chalk from "chalk";

const RESERVED_CTRL_KEYS = new Set(["c", "d", "h", "j", "k", "l", "n", "p", "u"]);

function renderValue(value, placeholder) {
  if (!value) {
    if (!placeholder) return chalk.inverse(" ");
    return chalk.inverse(placeholder[0] ?? " ") + chalk.grey(placeholder.slice(1));
  }

  return value + chalk.inverse(" ");
}

export default function CommandInput({
  value,
  placeholder = "",
  focus = true,
  consumeSuppressedBackspace,
  onChange,
  onSubmit,
}) {
  useInput(
    (input, key) => {
      if (
        key.upArrow ||
        key.downArrow ||
        key.leftArrow ||
        key.rightArrow ||
        key.escape ||
        key.tab ||
        (key.shift && key.tab) ||
        (key.ctrl && RESERVED_CTRL_KEYS.has(input))
      ) {
        return;
      }

      if (key.return) {
        onSubmit?.(value);
        return;
      }

      if (key.backspace || key.delete) {
        if (consumeSuppressedBackspace?.()) return;
        if (!value.length) return;
        onChange?.(value.slice(0, -1));
        return;
      }

      if (!input || key.meta) return;
      onChange?.(value + input);
    },
    { isActive: focus },
  );

  return React.createElement(Text, null, renderValue(value, placeholder));
}
