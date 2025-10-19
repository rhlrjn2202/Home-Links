import { Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SubmitPropertyPage } from './pages/SubmitPropertyPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserLoginPage } from './pages/UserLoginPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'; // Import ProtectedRoute

export function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/submit-property" 
            element={
              <ProtectedRoute>
                <SubmitPropertyPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/adminauth/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/userauth/login" element={<UserLoginPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          {/* Add other routes here as needed */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}