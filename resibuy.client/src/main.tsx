import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.tsx";
import "./global.scss";
import { OrderEventProvider } from "./contexts/OrderEventContext.tsx";
createRoot(document.getElementById("root")!).render(
  <>
    <OrderEventProvider>
      <App />
    </OrderEventProvider>
    <ToastContainer />
  </>
);
