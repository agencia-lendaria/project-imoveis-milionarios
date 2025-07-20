import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ChatViewerPage from './pages/ChatViewerPage';
import { testSupabaseConnection } from './utils/testSupabase';

function App() {
  useEffect(() => {
    // Test Supabase connection when the app starts
    testSupabaseConnection();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Rota de Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rotas Protegidas */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <ChatViewerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <ChatViewerPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;