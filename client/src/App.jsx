import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MotionConfig } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/ui/Toast";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </MotionConfig>
    </Provider>
  );
}

export default App;
