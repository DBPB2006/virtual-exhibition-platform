import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { NotificationProvider } from './context/NotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthStatus } from './features/auth/authSlice';
import { useEffect } from 'react';
import Loader from './components/common/Loader';

// Common
// Common
import Home from './pages/common/Home';
import CategoriesOverview from './pages/common/CategoriesOverview';
import Profile from './pages/common/Profile';
import Notifications from './pages/common/Notifications';
import Contact from './pages/common/Contact';
import NotFound from './pages/common/NotFound';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Visitor
import VisitorDashboard from './pages/visitor/VisitorDashboard';
import Checkout from './pages/visitor/Checkout';
import ExhibitView from './pages/visitor/ExhibitView';

// Exhibitor
import ExhibitorDashboard from './pages/exhibitor/ExhibitorDashboard';
import CreateExhibition from './pages/exhibitor/CreateExhibition';
import EditExhibition from './pages/exhibitor/EditExhibition';
import SalesOverview from './pages/exhibitor/SalesOverview';
import ExhibitorInventory from "./pages/exhibitor/ExhibitorInventory";
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminExhibitions from './pages/admin/AdminExhibitions';
import AdminOrders from './pages/admin/AdminOrders';

// Exhibitions (Visitor Browse)
import ArtFashionPage from './pages/visitor/browse/ArtFashionPage';

import CultureHeritagePage from './pages/visitor/browse/CultureHeritagePage';
import ScienceTechPage from './pages/visitor/browse/ScienceTechPage';
import PhotoMediaPage from './pages/visitor/browse/PhotoMediaPage';
import ArchitectureDesignPage from './pages/visitor/browse/ArchitectureDesignPage';
import HistoricAntiquePage from './pages/visitor/browse/HistoricAntiquePage';

import ExhibitionDetails from './pages/visitor/browse/ExhibitionDetails';

import DashboardRedirect from './components/DashboardRedirect';
import PageTransition from './components/PageTransition';

// RBAC
import ProtectedRoute from './components/rbac/ProtectedRoute';
import RoleGuard from './components/rbac/RoleGuard';
import PublicHomeGuard from './components/rbac/PublicHomeGuard';
import DashboardLayout from './components/common/DashboardLayout';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={
          <PublicHomeGuard>
            <PageTransition><Home /></PageTransition>
          </PublicHomeGuard>
        } />
        <Route path="/categories" element={<PageTransition><CategoriesOverview /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />

        {/* BROWSING ROUTES */}
        <Route path="/exhibitions/art-fashion" element={<PageTransition><ArtFashionPage /></PageTransition>} />

        <Route path="/exhibitions/culture-heritage" element={<PageTransition><CultureHeritagePage /></PageTransition>} />
        <Route path="/exhibitions/science-technology" element={<PageTransition><ScienceTechPage /></PageTransition>} />
        <Route path="/exhibitions/photography-media" element={<PageTransition><PhotoMediaPage /></PageTransition>} />
        <Route path="/exhibitions/architecture-design" element={<PageTransition><ArchitectureDesignPage /></PageTransition>} />
        <Route path="/exhibitions/historic-antique" element={<PageTransition><HistoricAntiquePage /></PageTransition>} />
        <Route path="/exhibitions/:id" element={<PageTransition><ExhibitionDetails /></PageTransition>} />


        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* CHECKOUT ROUTE (Visitor Only, Independent Layout) */}
        <Route path="/checkout/:exhibitionId" element={
          <RoleGuard allowedRoles={['visitor']}>
            <PageTransition><Checkout /></PageTransition>
          </RoleGuard>
        } />

        {/* EXHIBITION VIEW ROUTE (Live Room - Authenticated Only) */}
        <Route path="/exhibitions/view/:id" element={
          <ProtectedRoute>
            <PageTransition><ExhibitView /></PageTransition>
          </ProtectedRoute>
        } />

        {/* PROTECTED DASHBOARD ROUTES (Wrapped in Layout) */}
        <Route element={<DashboardLayout />}>

          <Route path="/profile" element={
            <ProtectedRoute>
              <PageTransition><Profile /></PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <PageTransition><Notifications /></PageTransition>
            </ProtectedRoute>
          } />

          {/* EXHIBITOR ROUTES */}
          <Route path="/dashboard/exhibitor" element={
            <RoleGuard allowedRoles={['exhibitor']}>
              <PageTransition><ExhibitorDashboard /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/exhibitor/create" element={
            <RoleGuard allowedRoles={['exhibitor']}>
              <PageTransition><CreateExhibition /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/exhibitor/edit/:id" element={
            <RoleGuard allowedRoles={['exhibitor']}>
              <PageTransition><EditExhibition /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/exhibitor/sales" element={
            <RoleGuard allowedRoles={['exhibitor']}>
              <PageTransition><SalesOverview /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/exhibitor/inventory" element={
            <RoleGuard allowedRoles={['exhibitor']}>
              <PageTransition><ExhibitorInventory /></PageTransition>
            </RoleGuard>
          } />

          {/* VISITOR ROUTES */}
          <Route path="/dashboard/visitor" element={
            <RoleGuard allowedRoles={['visitor']}>
              <PageTransition><VisitorDashboard /></PageTransition>
            </RoleGuard>
          } />

          {/* ADMIN ROUTES */}
          <Route path="/dashboard/admin" element={
            <RoleGuard allowedRoles={['admin']}>
              <PageTransition><AdminDashboard /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/admin/users" element={
            <RoleGuard allowedRoles={['admin']}>
              <PageTransition><AdminUsers /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/admin/exhibitions" element={
            <RoleGuard allowedRoles={['admin']}>
              <PageTransition><AdminExhibitions /></PageTransition>
            </RoleGuard>
          } />
          <Route path="/dashboard/admin/orders" element={
            <RoleGuard allowedRoles={['admin']}>
              <PageTransition><AdminOrders /></PageTransition>
            </RoleGuard>
          } />

        </Route>

        {/* CATCH ALL - 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Router>
      <Loader isLoading={loading} />
      <NotificationProvider>
        <AnimatedRoutes />
      </NotificationProvider>
    </Router>
  );
}

export default App;
