import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  BubblePluginContext,
  BubblePluginInstance,
  BubblePluginProperties,
} from "./bubble.interface.ts";

const MY_GLOBAL: Record<string, ReturnType<typeof createRoot>> = {};

// @ts-expect-error Global exporting
window.plugin360SkillVueVideoRecord = {
  MY_GLOBAL,
};

const init = (
  id: string,
  instance: BubblePluginInstance,
  properties: BubblePluginProperties,
  context: BubblePluginContext
) => {
  if (id) {
    if (!MY_GLOBAL[id]) {
      MY_GLOBAL[id] = createRoot(document.getElementById(id) as HTMLElement);
    }
    const root = MY_GLOBAL[id];
    console.log("updating root");
    root.render(
      <StrictMode>
        <App
          id={id}
          instance={instance}
          properties={properties}
          context={context}
        />
      </StrictMode>
    );
  }
};

// @ts-expect-error Global exporting
window.plugin360SkillVueVideoRecord.init = init;
