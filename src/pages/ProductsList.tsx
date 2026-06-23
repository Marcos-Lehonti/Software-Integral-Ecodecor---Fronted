import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface Stock {
  warehouseName: string;
  quantity: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  price: string;
  color: string | null;
  lot: string | null;
  minArea: string | null;
  photo: string | null;
  containerLiters: string | null;
  yieldM2: string | null;
  attributes: Record<string, string>;
  stock: Stock[];
}

const categoryColor: Record<string, string> = {
  ecopaper: "bg-green-500",
  practstone: "bg-blue-500",
  machiato: "bg-yellow-500",
  insumo: "bg-purple-500",
};

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null); // ✅

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Error al obtener productos");
        setProducts(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Función eliminar
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al eliminar producto");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white-900 p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario de Productos</h1>
        <Link
          to="/products/create"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          + Agregar producto
        </Link>
      </div>

      {loading && <p className="text-indigo-400">Cargando productos...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 rounded-lg">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Código</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Categoría</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Unidad</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Precio</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Stock Central</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Stock Macororo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product) => {
                const central = product.stock.find(s => s.warehouseName === "central");
                const macororo = product.stock.find(s => s.warehouseName === "macororo");
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-200 cursor-pointer"
                    onClick={() => setSelected(product)}
                  >
                    <td className="px-4 py-2 text-sm">{product.code}</td>
                    <td className="px-4 py-2 text-sm">{product.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${categoryColor[product.category] || "bg-gray-500"}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">{product.unit}</td>
                    <td className="px-4 py-2 text-sm">Bs. {product.price}</td>
                    <td className="px-4 py-2 text-sm">{central ? central.quantity : "0"}</td>
                    <td className="px-4 py-2 text-sm">{macororo ? macororo.quantity : "0"}</td>
                    <td className="px-4 py-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-3 text-center text-gray-400">
                    No hay productos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE DETALLE */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 relative">

            {/* Cerrar */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white">{selected.name}</h2>
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${categoryColor[selected.category] || "bg-gray-500"}`}>
              {selected.category}
            </span>

            {/* Info básica */}
            <div className="grid grid-cols-2 gap-3 text-sm mt-2">
              <div>
                <p className="text-gray-400">Código</p>
                <p className="text-white font-medium">{selected.code}</p>
              </div>
              <div>
                <p className="text-gray-400">Precio</p>
                <p className="text-white font-medium">Bs. {selected.price}</p>
              </div>
              <div>
                <p className="text-gray-400">Unidad</p>
                <p className="text-white font-medium">{selected.unit}</p>
              </div>
              <div>
                <p className="text-gray-400">Color</p>
                <p className="text-white font-medium">{selected.color || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Lote</p>
                <p className="text-white font-medium">{selected.lot || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Área mínima</p>
                <p className="text-white font-medium">{selected.minArea ? `${selected.minArea} m²` : "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Envase</p>
                <p className="text-white font-medium">{selected.containerLiters ? `${selected.containerLiters} litros` : "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Rendimiento</p>
                <p className="text-white font-medium">{selected.yieldM2 ? `${selected.yieldM2} m²` : "—"}</p>
              </div>
            </div>

            {/* Descripción */}
            {selected.description && (
              <div>
                <p className="text-gray-400 text-sm">Descripción</p>
                <p className="text-white text-sm">{selected.description}</p>
              </div>
            )}

            {/* Stock */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Stock por almacén</p>
              <div className="grid grid-cols-2 gap-3">
                {selected.stock.map(s => (
                  <div key={s.warehouseName} className="bg-gray-700 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-gray-400 capitalize">{s.warehouseName}</p>
                    <p className="text-white font-bold text-lg">{s.quantity}</p>
                    <p className="text-xs text-gray-400">{selected.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Atributos dinámicos */}
            {selected.attributes && Object.keys(selected.attributes).length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Atributos adicionales</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selected.attributes).map(([key, value]) => (
                    <div key={key} className="bg-gray-700 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 capitalize">{key.replace(/_/g, " ")}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón editar */}
            <div className="flex justify-end pt-2">
              <Link
                to={`/products/${selected.id}/edit`}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
              >
                Editar producto
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}