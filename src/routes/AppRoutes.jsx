
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
import { useAuth } from "../contexts/AuthContext";

function DashboardEntry() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Dashboard />;
}

function AdminRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
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
    </Routes>
  );
}

function ProtectedFarmerRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}