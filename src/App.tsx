import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../src/pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import UsersList from "./pages/UserList";
import CreateProduct from "./pages/CreateProduct";
import ProductsList from "./pages/ProductsList";
import EditProduct from "./pages/EditProduct";
import "./index.css";
import type { ReactNode } from "react";

// ✅ Protege rutas por rol
function RequireRole({ role, children }: { role: string; children: ReactNode }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.role !== role) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/create" element={<CreateProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />

          {/* ✅ Solo administrador */}
          <Route path="/users-list" element={
            <RequireRole role="administrador">
              <UsersList />
            </RequireRole>
          } />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;