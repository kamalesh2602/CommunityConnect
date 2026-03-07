import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageVolunteers from './pages/ManageVolunteers';
import ManageNGOs from './pages/ManageNGOs';

const PrivateRoute = () => {
  const { admin, loading } = React.useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return admin ? (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <Outlet />
      </div>
    </div>
  ) : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/volunteers" element={<ManageVolunteers />} />
            <Route path="/ngos" element={<ManageNGOs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
