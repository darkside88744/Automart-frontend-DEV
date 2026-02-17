import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleSelector from './pages/VehicleSelector';
import HomePage from './pages/HomePage';
import SpareParts from './pages/SpareParts';
import BookService from './pages/BookService';
import Services from './pages/Services';
import DentingPainting from './pages/DentingPainting';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import ServiceHistory from './pages/ServiceHistory';
import StaffManagement from './pages/StaffManagement';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';

// Component Imports
import Navbar from './components/Navbar'; 

// --- STRIPE CONFIGURATION ---
const stripePromise = loadStripe('pk_test_51SpK2EE5GxpJRwm9M3l1phKA2d86F4NjFMxzExgrQb9w9s2L6r6U2zzoAiIgci2JWulXTcp5O9m2xyrRAt2y6Jgz00adiwk3CM');

// --- HELPER: GET AUTH DATA ---
const getAuth = () => ({
  token: localStorage.getItem('access_token'),
  isGuest: localStorage.getItem('is_guest') === 'true',
  isStaff: localStorage.getItem('is_staff') === 'true',
  isSuper: localStorage.getItem('is_superuser') === 'true',
  isMechanic: localStorage.getItem('is_mechanic') === 'true',
  isBilling: localStorage.getItem('is_billing') === 'true',
  isEcommerce: localStorage.getItem('is_ecommerce') === 'true',
});

// --- ROUTE GUARDS ---

const PrivateRoute = ({ children }) => {
  const { token, isGuest } = getAuth();
  return (token || isGuest) ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { token, isStaff, isSuper, isMechanic, isBilling, isEcommerce } = getAuth();
  const hasAccess = token && (isStaff || isSuper || isMechanic || isBilling || isEcommerce);
  return hasAccess ? children : <Navigate to="/home" replace />;
};

// UPDATED: Allows Mechanics, Billing, Staff, and Superusers
const RecordsAccessRoute = ({ children }) => {
  const { token, isMechanic, isBilling, isSuper, isStaff } = getAuth();
  const hasPermission = token && (isMechanic || isBilling || isSuper || isStaff);
  return hasPermission ? children : <Navigate to="/admin-panel" replace />;
};

const MechanicOnlyRoute = ({ children }) => {
  const { token, isMechanic, isSuper } = getAuth();
  return (token && (isMechanic || isSuper)) ? children : <Navigate to="/admin-panel" replace />;
};

const BillingOnlyRoute = ({ children }) => {
  const { token, isBilling, isSuper, isStaff } = getAuth();
  // Giving generic staff access to bookings as well if they handle front-desk
  return (token && (isBilling || isSuper || isStaff)) ? children : <Navigate to="/admin-panel" replace />;
};

const EcommerceOnlyRoute = ({ children }) => {
  const { token, isEcommerce, isSuper, isStaff } = getAuth();
  return (token && (isEcommerce || isSuper || isStaff)) ? children : <Navigate to="/admin-panel" replace />;
};

const SuperuserRoute = ({ children }) => {
  const { token, isSuper } = getAuth();
  return (token && isSuper) ? children : <Navigate to="/admin-panel" replace />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-[#111111] pt-20 md:pt-24 overflow-x-hidden">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />
          
          {/* --- PROTECTED USER ROUTES --- */}
          <Route path="/select-vehicle" element={<PrivateRoute><VehicleSelector /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><ServiceHistory /></PrivateRoute>} />

          {/* STORE FRONT */}
          <Route 
            path="/parts" 
            element={
              <PrivateRoute>
                <Elements stripe={stripePromise}>
                  <SpareParts />
                </Elements>
              </PrivateRoute>
            } 
          />

          {/* CLIENT ACTIONS */}
          <Route path="/book-service" element={<PrivateRoute><BookService /></PrivateRoute>} />
          <Route 
            path="/checkout/:bookingId" 
            element={
              <PrivateRoute>
                <Elements stripe={stripePromise}>
                  <Checkout />
                </Elements>
              </PrivateRoute>
            } 
          />

          {/* --- ADMIN PANEL SYSTEM --- */}
          <Route path="/admin-panel" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          
          <Route 
            path="/admin/bookings" 
            element={<BillingOnlyRoute><AdminDashboard activeTab="bookings" /></BillingOnlyRoute>} 
          />
          
          <Route 
            path="/admin/orders" 
            element={<EcommerceOnlyRoute><AdminDashboard activeTab="orders" /></EcommerceOnlyRoute>} 
          />

          {/* FINALIZED: Admin Service Records Access */}
          <Route 
            path="/admin/records" 
            element={
              <RecordsAccessRoute>
                <ServiceHistory />
              </RecordsAccessRoute>
            } 
          />

          <Route path="/admin/staff" element={<SuperuserRoute><StaffManagement /></SuperuserRoute>} />

          <Route path="/denting-painting" element={<DentingPainting />} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;