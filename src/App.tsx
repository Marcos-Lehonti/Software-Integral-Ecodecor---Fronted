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
import CreateQuotation from "./pages/CreateQuotation";
import QuotationsList from "./pages/QuotationsList";
import SendQuotationsList from "./pages/SendQuotationsList";
import InventoryMovementsList from "./pages/Inventorymovementslist";
import WarehouseTransfer from "./pages/WarehouseTransfer";
import ChatInventario from "./pages/ChatInventario";
import ProjectsTimeline from "./pages/ProjectsTimeline";
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
          <Route path="/quotations/create" element={<CreateQuotation />} />
          <Route path="/quotations/list" element={<QuotationsList />} />
          <Route path="/quotations/sendemail" element={<SendQuotationsList />} />
          <Route path="/inventory/movements" element={<InventoryMovementsList />} />
          <Route path="/inventory/transfer" element={<WarehouseTransfer />} />
          <Route path="/projects" element={<ProjectsTimeline />} />
          <Route path="/ai/chat" element={<ChatInventario />} />




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