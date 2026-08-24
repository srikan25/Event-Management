import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/dashboard.css";
import "./styles/header.css";
import "./styles/eventModal.css";
import "./styles/darkMode.css";
// import "./styles/contributionsPage.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <EventProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      </EventProvider>
    </AuthProvider>
  </StrictMode>,
);
