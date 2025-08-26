import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { HubProvider } from "./contexts/HubContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import UserLockListener from "./components/UserLockListener";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HubProvider>
        <UserLockListener />
        <AppRoutes />
      </HubProvider>
    </AuthProvider>
  );
};

export default App;
