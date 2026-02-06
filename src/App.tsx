import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AdminHome } from './pages/AdminHome';
import { DailyCheckin } from './pages/DailyCheckin';
import { Members } from './pages/Members';
import { Payouts } from './pages/Payouts';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MemberLogin } from './pages/MemberLogin';
import { MemberDashboard } from './pages/MemberDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useStore } from './store/useStore';

function App() {
  const { fetchData } = useStore();

  useEffect(() => {
    // Charge les données au démarrage
    // On passe un ID vide pour le moment le store prendra le premier groupe trouvé
    // On ne passe pas 'auto' pour éviter la sélection automatique
    fetchData('');
  }, [fetchData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member-login" element={<MemberLogin />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="checkin" element={<DailyCheckin />} />
          <Route path="members" element={<Members />} />
          <Route path="payouts" element={<Payouts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
