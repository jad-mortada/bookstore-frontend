import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { LoadingProvider, useLoading } from './shared/contexts/LoadingContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './shared/components/layout/MainLayout';
import { ThemeModeProvider } from './shared/contexts/ThemeContext';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import SchoolList from './features/schools/pages/SchoolList';
import YearlyBookListManagement from './features/lists/pages/YearlyBookListManagement';
import ClassList from './features/classes/pages/ClassList';
import BookList from './features/books/pages/BookList';
import CustomerOrderFlow from './features/orders/pages/CustomerOrderFlow';
import CustomerMyOrders from './features/orders/pages/CustomerMyOrders';
import ListBooksManagement from './features/lists/pages/ListBooksManagement';
import CustomerOrders from './features/orders/pages/CustomerOrders';
import AdminsPage from './features/admin/pages/AdminsPage';
import AdminTempOrders from '../src/features/admin/pages/AdminTempOrders';
import PrivateRoute from './app/routes/guards//PrivateRoute';
import { AuthProvider, AuthContext } from './shared/contexts/AuthContext';
import Landing from './features/home/pages/Landing';
import Home from './features/home/pages/Home';
import Profile from './features/profile/pages/Profile';
import CustomerHome from './features/home/pages/CustomerHome';

function AppRoutes() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
  const isUser = user?.roles?.includes('ROLE_USER');

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          user
            ? (isAdmin ? <Home /> : (isUser ? <CustomerHome /> : <Landing />))
            : <Landing />
        }
      />

      {/* Protected routes only show MainLayout if user is authenticated */}
      {user && (
        <Route element={<MainLayout />}>
          <Route path="/schools" element={isAdmin ? <PrivateRoute><SchoolList /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/yearly-lists" element={isAdmin ? <PrivateRoute><YearlyBookListManagement /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/classes" element={isAdmin ? <PrivateRoute><ClassList /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/books" element={isAdmin ? <PrivateRoute><BookList /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/order" element={isUser ? <PrivateRoute><CustomerOrderFlow /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/my-orders" element={isUser ? <PrivateRoute><CustomerMyOrders /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/list-books-link" element={isAdmin ? <PrivateRoute><ListBooksManagement /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/customer-orders" element={isAdmin ? <PrivateRoute><CustomerOrders /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/draft-approvals" element={isAdmin ? <PrivateRoute><AdminTempOrders /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/admins" element={isSuperAdmin ? <PrivateRoute><AdminsPage /></PrivateRoute> : <Navigate to="/" />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          {/* Add more protected routes here as needed */}
        </Route>
      )}
    </Routes>
  );
}

function AppWithLoading() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // adjust as needed
    return () => clearTimeout(timeout);
  }, [location, navigationType, setLoading]);

  return <AppRoutes />;
}

function App() {
  return (
    <ThemeModeProvider>
      <LoadingProvider>
        <AuthProvider>
          <Router>
            <AppWithLoading />
          </Router>
        </AuthProvider>
      </LoadingProvider>
    </ThemeModeProvider>
  );
}

export default App;