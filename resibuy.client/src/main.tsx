import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.tsx";
import "./global.scss";
createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <ToastContainer />
  </>
);
