import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <div>Seller Dashboard</div>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/shipper/*"
            element={
              <ProtectedRoute allowedRoles={['SHIPPER']}>
                <div>Shipper Dashboard</div>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <div>Customer Dashboard</div>
              </ProtectedRoute>
            }
          />
          
          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;