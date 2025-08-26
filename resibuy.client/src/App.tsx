import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { HubProvider } from "./contexts/HubContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HubProvider>
        <AppRoutes />
      </HubProvider>
    </AuthProvider>
  );
};

export default App;
