import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import VolunteerDashboard from './pages/VolunteerDashboard';
import BrowseNGOs from './pages/BrowseNGOs';
import FollowedNGOs from './pages/FollowedNGOs';
import NGORequirements from './pages/NGORequirements';
import VolunteerChat from './pages/VolunteerChat';

import NGODashboard from './pages/NGODashboard';
import PostRequirement from './pages/PostRequirement';
import NGOFollowers from './pages/NGOFollowers';
import NGOChat from './pages/NGOChat';
import EditProfile from './pages/EditProfile';

const PrivateRoute = ({ allowedRole }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

const PublicRoute = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute allowedRole="volunteer" />}>
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer/ngos" element={<BrowseNGOs />} />
            <Route path="/volunteer/followed" element={<FollowedNGOs />} />
            <Route path="/volunteer/ngos/:id/requirements" element={<NGORequirements />} />
            <Route path="/volunteer/chat" element={<VolunteerChat />} />
            <Route path="/volunteer/profile" element={<EditProfile />} />
          </Route>

          <Route element={<PrivateRoute allowedRole="ngo" />}>
            <Route path="/ngo/dashboard" element={<NGODashboard />} />
            <Route path="/ngo/requirements" element={<PostRequirement />} />
            <Route path="/ngo/followers" element={<NGOFollowers />} />
            <Route path="/ngo/chat" element={<NGOChat />} />
            <Route path="/ngo/profile" element={<EditProfile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
