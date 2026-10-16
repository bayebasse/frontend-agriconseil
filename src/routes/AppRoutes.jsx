
//Ancien codddddd routttes
// import { Navigate, Route, Routes } from "react-router-dom";

// import { useAuth } from "../contexts/AuthContext";

// import Home from "../pages/Home/Home";
// import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import Dashboard from "../pages/Dashboard/Dashboard";
// import CreateCulture from "../pages/Culture/CreateCulture";
// import AdminDashboard from "../admin/AdminDashboard";

// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return null;
//   }

//   if (!user) {
//     return <Navigate to="/connexion" replace />;
//   }

//   return children;
// }

// function AdminRoute({ children }) {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return null;
//   }

//   if (!user) {
//     return <Navigate to="/connexion" replace />;
//   }

//   if (user.role !== "admin") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />

//       <Route path="/connexion" element={<Login />} />

//       <Route path="/inscription" element={<Register />} />

//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/culture/nouvelle"
//         element={
//           <ProtectedRoute>
//             <CreateCulture />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin"
//         element={
//           <AdminRoute>
//             <AdminDashboard />
//           </AdminRoute>
//         }
//       />

//       <Route
//         path="*"
//         element={<Navigate to="/" replace />}
//       />
//     </Routes>
//   );
// }




import { Navigate, Route, Routes } from "react-router-dom";


import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import CreateCulture from "../pages/Culture/CreateCulture";
import Dashboard from "../pages/Dashboard/Dashboard";
import AdminDashboard from "../admin/AdminDashboard";
import BuyerDashboard from "../pages/Buyer/BuyerDashboard";
import MessagesPage from "../pages/Messages/MessagesPage";
import TransactionsPage from "../pages/Transactions/TransactionsPage";
import { useAuth } from "../contexts/AuthContext";
import PolitiqueConfidentialite from "../pages/PolitiqueConfidentialite/PolitiqueConfidentialite";
import Loading from "../components/Loading/Loading";

function DashboardEntry() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading>Vérification de votre session…</Loading>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === "buyer") {
    return <Navigate to="/acheteur" replace />;
  }

  return <Dashboard />;
}

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading>Vérification de votre session…</Loading>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to={user.role === "buyer" ? "/acheteur" : "/dashboard"} replace />;
  }

  return <AdminDashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/connexion"
        element={<Login />}
      />

      <Route
        path="/inscription"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={<DashboardEntry />}
      />

      <Route path="/acheteur" element={<BuyerRoute />} />
      <Route path="/messages/:conversationId?" element={<MessagesEntry />} />
      <Route path="/transactions" element={<TransactionsEntry />} />

      <Route
        path="/admin"
        element={<AdminRoute />}
      />

      <Route
        path="/culture/nouvelle"
        element={
          <ProtectedFarmerRoute>
            <CreateCulture />
          </ProtectedFarmerRoute>
        }
      />
      <Route
  path="/politique-confidentialite"
  element={<PolitiqueConfidentialite />}
/>
    </Routes>
  );
}

function ProtectedFarmerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading>Vérification de votre session…</Loading>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === "buyer") {
    return <Navigate to="/acheteur" replace />;
  }

  return children;
}

function BuyerRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading>Vérification de votre session…</Loading>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== "buyer") {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return <BuyerDashboard />;
}

function MessagesEntry() {
  const { user, loading } = useAuth();
  if (loading) return <Loading>Vérification de votre session…</Loading>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!(["buyer", "farmer"].includes(user.role))) {
    return <Navigate to="/admin" replace />;
  }
  return <MessagesPage />;
}

function TransactionsEntry() {
  const { user, loading } = useAuth();
  if (loading) return <Loading>Vérification de votre session…</Loading>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!("buyer" === user.role || "farmer" === user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return <TransactionsPage />;
}
