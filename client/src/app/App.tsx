import type React from "react";
import { Outlet } from "react-router-dom";

import { DefaultLayout } from "./layout";
import { DarkModeProvider } from "./hooks/useDarkMode";

import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/patternfly/patternfly.css";

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <DefaultLayout>
        <Outlet />
      </DefaultLayout>
    </DarkModeProvider>
  );
};

export default App;
