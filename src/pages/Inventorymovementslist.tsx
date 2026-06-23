import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  category: string;
}

interface CreatedByUser {
  id: number;
  name: string;
  email: string;
}

interface InventoryMovement {
  id: number;
  productId: number;
  warehouseName: string;
  type: "ingreso" | "salida";
  quantity: string;
  reason: string;
  referenceId: number | null;
  referenceNumber: string | null;
  createdBy: number;
  stockAfter: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
  createdByUser: CreatedByUser;
}

interface MovementsResponse {
  total: number;
  page: number;
  totalPages: number;
  data: InventoryMovement[];
}

const typeColors: Record<string, string> = {
  ingreso: "bg-green-100 text-green-800",
  salida:  "bg-red-100   text-red-800",
};

const reasonLabels: Record<string, string> = {
  registro_manual:       "Registro manual",
  ajuste_manual:         "Ajuste manual",
  aprobacion_cotizacion: "Aprobación cotización",
  entrada_mercaderia:    "Entrada mercadería",
};

const typeLabels: Record<string, string> = {
  ingreso: "↑ Ingreso",
  salida:  "↓ Salida",
};

export default function InventoryMovementsList() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ─── filtros ─────────────────────────────────────────
  const [filterType, setFilterType]           = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");
  const [filterReason, setFilterReason]       = useState("");

  // ─── cargar movimientos ───────────────────────────────
  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");

        const params = new URLSearchParams();
        if (filterType)      params.append("type",          filterType);
        if (filterWarehouse) params.append("warehouseName", filterWarehouse);
        if (filterReason)    params.append("reason",        filterReason);

        const res  = await fetch(`${API_URL}/api/inventory-movements?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: MovementsResponse = await res.json();
        if (!res.ok) throw new Error((data as any)?.message || "Error al obtener movimientos");
        setMovements(data.data || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, [filterType, filterWarehouse, filterReason]);

  return (
    <div className="min-h-screen bg-white p-8 text-black">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Historial de inventario</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registro de todos los ingresos y salidas de stock — {total} movimiento{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-3 mb-6">

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todos los tipos</option>
          <option value="ingreso">Ingreso</option>
          <option value="salida">Salida</option>
        </select>

        <select
          value={filterWarehouse}
          onChange={(e) => setFilterWarehouse(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todos los almacenes</option>
          <option value="central">Central</option>
          <option value="macororo">Macororo</option>
        </select>

        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todas las razones</option>
          <option value="registro_manual">Registro manual</option>
          <option value="ajuste_manual">Ajuste manual</option>
          <option value="aprobacion_cotizacion">Aprobación cotización</option>
          <option value="entrada_mercaderia">Entrada mercadería</option>
        </select>

        {(filterType || filterWarehouse || filterReason) && (
          <button
            onClick={() => { setFilterType(""); setFilterWarehouse(""); setFilterReason(""); }}
            className="text-sm text-red-500 hover:text-red-700 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Estados ── */}
      {loading && <p className="text-green-600">Cargando...</p>}
      {error   && <p className="text-red-500">{error}</p>}

      {/* ── Tabla ── */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">

            <thead className="bg-gray-800">
              <tr>
                {["ID", "Producto", "Código", "Almacén", "Tipo", "Cantidad", "Stock después", "Razón", "Referencia", "Registrado por", "Fecha"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-sm font-semibold text-gray-300 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">

                  <td className="px-4 py-3 text-sm text-gray-400">#{m.id}</td>

                  <td className="px-4 py-3 text-sm font-medium">{m.product?.name || "—"}</td>

                  <td className="px-4 py-3 text-sm text-gray-500">{m.product?.code || "—"}</td>

                  <td className="px-4 py-3 text-sm capitalize">{m.warehouseName}</td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[m.type] || "bg-gray-100 text-gray-700"}`}>
                      {typeLabels[m.type] || m.type}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm font-semibold">
                    {parseFloat(m.quantity).toFixed(2)} {m.product?.unit}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {parseFloat(m.stockAfter).toFixed(2)} {m.product?.unit}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {reasonLabels[m.reason] || m.reason}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {m.referenceNumber
                      ? <span className="text-blue-600 font-medium">{m.referenceNumber}</span>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>

                  <td className="px-4 py-3 text-sm">{m.createdByUser?.name || "—"}</td>

                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleString("es-BO")}
                  </td>

                </tr>
              ))}

              {movements.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}