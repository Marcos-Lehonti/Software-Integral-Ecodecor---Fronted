import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import ecodecorIcon from "../assets/icon-ecodecor.png";

export default function DashboardLayout() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [quotationsMenuOpen, setQuotationsMenuOpen] = useState(false);
  // ✅ NUEVO estado separado para inventario
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen">

      {/* ================================= */}
      {/* SIDEBAR DESKTOP */}
      {/* ================================= */}

      {/* 👇 fixed: se queda fijo al hacer scroll */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-60 flex-col bg-gray-800 z-40">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0">
          <img
            className="h-20 w-20"
            src={ecodecorIcon}
            alt="Your Company"
          />
          <span className="text-white text-sm font-medium">EcoDecor</span>
        </div>

        {/* Nav — ocupa el espacio entre logo y logout */}
        {/* 👇 overflow-y-auto solo en esta parte, no en todo el sidebar */}
        <nav className="flex flex-col flex-1 py-4 overflow-y-auto min-h-0">

          {/* ================================= */}
          {/* INICIO */}
          {/* ================================= */}

          <Link
            to="/home"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Inicio
          </Link>

          <div className="my-2 border-t border-white/10" />

          <p className="px-4 pb-1 text-[10px] uppercase tracking-widest text-gray-500">
            Catálogo
          </p>

          {/* ================================= */}
          {/* PRODUCTOS */}
          {/* ================================= */}

          <button
            onClick={() => setProductsMenuOpen(!productsMenuOpen)}
            className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white w-full text-left"
          >
            Productos
            <span className="text-xs">{productsMenuOpen ? "▴" : "▾"}</span>
          </button>

          {productsMenuOpen && (
            <div className="bg-black/20">
              <Link
                to="/products"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setProductsMenuOpen(false)}
              >
                Ver productos
              </Link>
              <Link
                to="/products/create"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setProductsMenuOpen(false)}
              >
                Agregar producto
              </Link>
            </div>
          )}

          <div className="my-2 border-t border-white/10" />

          <p className="px-4 pb-1 text-[10px] uppercase tracking-widest text-gray-500">
            Stock
          </p>

          {/* ================================= */}
          {/* INVENTARIO */}
          {/* ================================= */}

          <button
            onClick={() => setInventoryMenuOpen(!inventoryMenuOpen)}
            className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white w-full text-left"
          >
            Inventario
            <span className="text-xs">{inventoryMenuOpen ? "▴" : "▾"}</span>
          </button>

          {inventoryMenuOpen && (
            <div className="bg-black/20">
              <Link
                to="/inventory/movements"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setInventoryMenuOpen(false)}
              >
                Movimientos
              </Link>
              <Link
                to="/inventory/transfer"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setInventoryMenuOpen(false)}
              >
                Visual de Almacenes
              </Link>
              <Link
                to="/inventory/preparation"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setInventoryMenuOpen(false)}
              >
                Prep. Materiales
              </Link>
            </div>
          )}

          <div className="my-2 border-t border-white/10" />

          <p className="px-4 pb-1 text-[10px] uppercase tracking-widest text-gray-500">
            Ventas
          </p>

          {/* ================================= */}
          {/* COTIZACIONES */}
          {/* ================================= */}

          <button
            onClick={() => setQuotationsMenuOpen(!quotationsMenuOpen)}
            className="flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white w-full text-left"
          >
            Cotizaciones
            <span className="text-xs">{quotationsMenuOpen ? "▴" : "▾"}</span>
          </button>

          {quotationsMenuOpen && (
            <div className="bg-black/20">
              <Link
                to="/quotations/create"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setQuotationsMenuOpen(false)}
              >
                Crear cotización
              </Link>
              <Link
                to="/quotations/sendemail"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setQuotationsMenuOpen(false)}
              >
                Enviar cotización
              </Link>
              <Link
                to="/quotations/list"
                className="block pl-10 pr-4 py-2 text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200"
                onClick={() => setQuotationsMenuOpen(false)}
              >
                Ver cotizaciones
              </Link>
            </div>
          )}

          <div className="my-2 border-t border-white/10" />

          {/* ================================= */}
          {/* PROYECTOS */}
          {/* ================================= */}

          <Link
            to="/projects"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Proyectos
          </Link>

          <div className="my-2 border-t border-white/10" />

          {/* ================================= */}
          {/* USUARIOS */}
          {/* ================================= */}

          {user?.role === "administrador" && (
            <Link
              to="/users-list"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Usuarios
            </Link>
          )}

          {/* ================================= */}
          {/* PERFIL */}
          {/* ================================= */}

          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Perfil
          </Link>

        </nav>

        {/* ================================= */}
        {/* LOGOUT — fuera del nav, siempre visible abajo */}
        {/* ================================= */}

        {/* 👇 flex-shrink-0: nunca se comprime, siempre pegado al fondo */}
        <div className="flex-shrink-0 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

      </aside>


      {/* ================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================= */}

      {/* 👇 md:ml-60 compensa el ancho del sidebar fixed */}
      <div className="flex flex-col flex-1 md:ml-60">

        {/* ================================= */}
        {/* TOPBAR (header + botón hamburguesa mobile) */}
        {/* ================================= */}

        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center gap-4">

            {/* Botón hamburguesa solo en mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>


        {/* ================================= */}
        {/* MOBILE MENU */}
        {/* ================================= */}

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">

            <Link
              to="/home"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Inicio
            </Link>

            <Link
              to="/products"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Ver productos
            </Link>

            <Link
              to="/products/create"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Agregar producto
            </Link>

            <Link
              to="/inventory/movements"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Movimientos de inventario
            </Link>

            <Link
              to="/inventory/transfer"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Visual de Almacenes
            </Link>

            <Link
              to="/inventory/preparation"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Prep. Materiales
            </Link>

            <Link
              to="/projects"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Proyectos
            </Link>

            <Link
              to="/quotations/create"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Crear cotización
            </Link>

            <Link
              to="/quotations/sendemail"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Enviar cotización
            </Link>

            <Link
              to="/quotations/list"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Ver cotizaciones
            </Link>

            {user?.role === "administrador" && (
              <Link
                to="/users-list"
                className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              >
                Usuarios
              </Link>
            )}

            <Link
              to="/profile"
              className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            >
              Perfil
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left text-red-500 hover:text-red-400 block rounded-md px-3 py-2 text-base font-medium"
            >
              Cerrar sesión
            </button>

          </div>
        )}


        {/* ================================= */}
        {/* OUTLET */}
        {/* ================================= */}

        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}