import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ── Eagerly loaded (always needed immediately) ─────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// ── Lazily loaded (only when user navigates there) ─────────
const Browse = lazy(() => import('./pages/Browse'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const EditProperty = lazy(() => import('./pages/EditProperty'));
const ManageImages = lazy(() => import('./pages/ManageImages'));
const ContactRequests = lazy(() => import('./pages/ContactRequests'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const RentCalculator = lazy(() => import('./pages/RentCalculator'));

// ── Page loader spinner ────────────────────────────────────
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-400 font-medium">Loading...</p>
            </div>
        </div>
    );
}

function Guard({ children, role }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                {/* Public — eagerly loaded */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Public — lazily loaded */}
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/browse" element={<Browse />} />
                                <Route path="/property/:id" element={<PropertyDetail />} />
                                <Route path="/calculator" element={<RentCalculator />} />

                                {/* Protected — lazily loaded */}
                                <Route path="/profile"
                                    element={<Guard><Profile /></Guard>} />
                                <Route path="/bookmarks"
                                    element={<Guard role="renter"><Bookmarks /></Guard>} />
                                <Route path="/owner/dashboard"
                                    element={<Guard role="owner"><OwnerDashboard /></Guard>} />
                                <Route path="/owner/add"
                                    element={<Guard role="owner"><AddProperty /></Guard>} />
                                <Route path="/owner/edit/:id"
                                    element={<Guard role="owner"><EditProperty /></Guard>} />
                                <Route path="/owner/images/:id"
                                    element={<Guard role="owner"><ManageImages /></Guard>} />
                                <Route path="/owner/contacts"
                                    element={<Guard role="owner"><ContactRequests /></Guard>} />

                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
