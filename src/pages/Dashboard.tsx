import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // ✅

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-full">
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="shrink-0">
                <img
                  className="h-12 w-12"
                  src="./src/assets/icon-ecodecor.png"
                  alt="Your Company"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">

                  <Link to="/home" className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                    Inicio
                  </Link>

                  {/* Productos con submenu */}
                  <div className="relative">
                    <button
                      onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                      className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                    >
                      Productos ▾
                    </button>
                    {productsMenuOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md bg-gray-700 shadow-lg z-10">
                        <Link
                          to="/products"
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          onClick={() => setProductsMenuOpen(false)}
                        >
                          Ver productos
                        </Link>
                        <Link
                          to="/products/create"
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                          onClick={() => setProductsMenuOpen(false)}
                        >
                          Agregar producto
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* ✅ Solo administrador */}
                  {user?.role === "administrador" && (
                    <Link to="/users-list" className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                      Usuarios
                    </Link>
                  )}

                  <Link to="/profile" className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                    Perfil
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:bg-red-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>

            {/* Botón menú móvil */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white"
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
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
            <Link to="/home" className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </Link>
            <Link to="/products" className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
              Ver productos
            </Link>
            <Link to="/products/create" className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
              Agregar producto
            </Link>

            {/* ✅ Solo administrador */}
            {user?.role === "administrador" && (
              <Link to="/users-list" className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                Usuarios
              </Link>
            )}

            <Link to="/profile" className="text-gray-300 hover:bg-white/5 hover:text-white block rounded-md px-3 py-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
              Perfil
            </Link>
            <button onClick={handleLogout} className="w-full text-left text-red-500 hover:text-red-400 block rounded-md px-3 py-2 text-base font-medium">
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>

      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}