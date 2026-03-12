import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import Layout from "./components/Layout";

function RequireAuth({ user, children }) {
  if (user === undefined) {
    // Still loading auth state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-calm-400 text-sm animate-pulse-soft flex flex-col items-center gap-3">
          <span className="text-4xl">🧠</span>
          <span>Loading…</span>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user || null));
    return unsub;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={firebaseUser ? <Navigate to="/chat" replace /> : <AuthPage />}
        />
        <Route
          path="/chat"
          element={
            <RequireAuth user={firebaseUser}>
              <Layout user={firebaseUser}>
                <ChatPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth user={firebaseUser}>
              <Layout user={firebaseUser}>
                <DashboardPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
