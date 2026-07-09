import React from "react";
import { render } from "ink";
import App from "./App.mjs";

export default function renderTui(runtime) {
  return render(React.createElement(App, { runtime }));
}
