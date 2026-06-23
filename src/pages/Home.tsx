import ChatWidget from "./ChatWidget";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Package, User, FileText, RefreshCw, DollarSign, AlertTriangle } from "lucide-react";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// ══════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════

interface Summary {
  totalProducts: number;
  totalUsers: number;
  totalQuotations: number;
  totalMovements: number;
  totalBilled: number;
}

interface ByStatus {
  status: string;
  total: string;
}

interface ByType {
  projectType: string;
  total: string;
}

interface Last7Days {
  date: string;
  total: string;
  amount: string;
}

interface Advisor {
  id: number;
  name: string;
  email: string;
  totalQuotations: number;
  totalAmount: number;
}

interface TopProduct {
  productId: number;
  product: { id: number; code: string; name: string; unit: string; category: string };
  timesCotized: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface MovementTotal {
  type: string;
  totalQuantity: string;
  totalMovements: string;
}

interface ByWarehouse {
  warehouseName: string;
  type: string;
  totalQuantity: string;
}

interface ByReason {
  reason: string;
  total: string;
  totalQuantity: string;
}

interface LowStock {
  productId: number;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
  product: { id: number; code: string; name: string; unit: string; category: string };
}

interface StockCategoryData {
  totalStock: number;
  totalReserved: number;
}

interface Inventory {
  movementsTotals: MovementTotal[];
  byWarehouse: ByWarehouse[];
  byReason: ByReason[];
  lowStockProducts: LowStock[];
  stockByCategory: Record<string, StockCategoryData>;
}

interface Profitability {
  projectId: number;
  quotationNumber: string;
  clientName: string;
  ingresos: number;
  costos: number;
  ganancia: number;
}

interface KpiData {
  summary: Summary;
  quotations: {
    byStatus: ByStatus[];
    byProjectType: ByType[];
    last7Days: Last7Days[];
  };
  topAdvisors: Advisor[];
  inventory: Inventory;
  topProducts: TopProduct[];
  profitability: Profitability[];
}

// ══════════════════════════════════════════
// CONSTANTES Y LABELS
// ══════════════════════════════════════════

const REASON_LABELS: Record<string, string> = {
  registro_manual:       "Registro manual",
  ajuste_manual:         "Ajuste manual",
  aprobacion_cotizacion: "Aprobación cotización",
  entrada_mercaderia:    "Entrada mercadería",
};

// Opciones base de configuración global de gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { boxWidth: 12, font: { size: 11 } },
    },
  },
};

// ══════════════════════════════════════════
// COMPONENTES AUXILIARES
// ══════════════════════════════════════════

function SummaryCard({
  label,
  value,
  icon: Icon,
  borderColor,
  bgColor,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className={`border rounded-xl p-5 bg-white shadow-sm flex items-center justify-between ${borderColor}`}>
      <div className="space-y-1">
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</span>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgColor} ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm flex flex-col">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</h2>
      <div className="w-full h-[260px] relative flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// COMPONENTE PRINCIPAL (HOME)
// ══════════════════════════════════════════

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}") as { name?: string };

  const [kpis, setKpis]       = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API_URL}/api/kpis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error((data as { message?: string })?.message || "Error al obtener KPIs");
        setKpis(data as KpiData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-green-600 text-sm font-medium animate-pulse">Cargando indicadores...</p>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500 text-sm font-medium">{error || "Error desconocido"}</p>
      </div>
    );
  }

  const { summary, quotations, topAdvisors, inventory, topProducts, profitability } = kpis;

  // ══════════════════════════════════════════
  // CONFIGURACIÓN DE CONJUNTOS DE DATOS (CHART.JS)
  // ══════════════════════════════════════════

  // 1. Gráfico Circular - Cotizaciones por Estado
  const pieData = {
    labels: (quotations?.byStatus || []).map(s => s.status.charAt(0).toUpperCase() + s.status.slice(1)),
    datasets: [
      {
        data: (quotations?.byStatus || []).map(s => parseInt(s.total, 10) || 0),
        backgroundColor: ["#22c55e", "#eab308", "#ef4444", "#6b7280", "#3b82f6"],
        borderWidth: 1,
      },
    ],
  };

  // 2. Gráfico de Barras - Tipo de Proyecto
  const projectTypeData = {
    labels: (quotations?.byProjectType || []).map(t => t.projectType.charAt(0).toUpperCase() + t.projectType.slice(1).replace("_", " ")),
    datasets: [
      {
        label: "Cantidad",
        data: (quotations?.byProjectType || []).map(t => parseInt(t.total, 10) || 0),
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
    ],
  };

  // 3. Gráfico Combinado / Líneas - Últimos 7 Días
  const last7DaysData = {
    labels: (quotations?.last7Days || []).map(d => d.date),
    datasets: [
      {
        type: "bar" as const,
        label: "Cotizaciones",
        data: (quotations?.last7Days || []).map(d => parseInt(d.total, 10) || 0),
        backgroundColor: "#22c55e",
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "Monto (Bs.)",
        data: (quotations?.last7Days || []).map(d => parseFloat(d.amount) || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        yAxisID: "y1",
      },
    ],
  };

  const last7DaysOptions = {
    ...chartOptions,
    scales: {
      y: { type: "linear" as const, position: "left" as const, title: { display: true, text: "Cotizaciones" } },
      y1: { type: "linear" as const, position: "right" as const, grid: { drawOnChartArea: false }, title: { display: true, text: "Monto (Bs.)" } },
    },
  };

  // 4. Gráfico de Barras Agrupadas - Movimientos Totales
  const inventoryMovementsData = {
    labels: (inventory?.movementsTotals || []).map(m => m.type === "ingreso" ? "Ingresos" : "Salidas"),
    datasets: [
      {
        label: "Cantidad total de ítems",
        data: (inventory?.movementsTotals || []).map(m => parseFloat(m.totalQuantity) || 0),
        backgroundColor: "#16a34a",
        borderRadius: 4,
      },
      {
        label: "Número de movimientos",
        data: (inventory?.movementsTotals || []).map(m => parseInt(m.totalMovements, 10) || 0),
        backgroundColor: "#f97316",
        borderRadius: 4,
      },
    ],
  };

  // 5. Gráfico de Barras - Stock por Categoría
  const categoriesEntries = Object.entries(inventory?.stockByCategory || {});
  const stockCategoryData = {
    labels: categoriesEntries.map(([cat]) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        label: "Stock Disponible",
        data: categoriesEntries.map(([_, val]) => Number(val.totalStock) || 0),
        backgroundColor: "#16a34a",
        borderRadius: 4,
      },
      {
        label: "Reservado",
        data: categoriesEntries.map(([_, val]) => Number(val.totalReserved) || 0),
        backgroundColor: "#eab308",
        borderRadius: 4,
      },
    ],
  };

  // 6. Gráfico Combinado - Rentabilidad de Proyectos
  const profitabilityData = {
    labels: (profitability || []).map(p => `P-${p.projectId} (${p.clientName})`),
    datasets: [
      {
        type: "bar" as const,
        label: "Ingresos",
        data: (profitability || []).map(p => p.ingresos),
        backgroundColor: "#22c55e", // Verde
        borderRadius: 4,
      },
      {
        type: "bar" as const,
        label: "Costos",
        data: (profitability || []).map(p => p.costos),
        backgroundColor: "#ef4444", // Rojo
        borderRadius: 4,
      },
      {
        type: "line" as const,
        label: "Ganancia Neta",
        data: (profitability || []).map(p => p.ganancia),
        borderColor: "#3b82f6", // Azul
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 text-slate-900 space-y-8">

      {/* ── Bienvenida ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bienvenido, {user.name || "Usuario"} 👋
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-0.5">Dashboard del sistema e-commerce corporativo — Ecodecor</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* TARJETAS RESUMEN */}
      {/* ══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard label="Productos"      value={summary.totalProducts}   icon={Package} borderColor="border-blue-100" bgColor="bg-blue-50" iconColor="text-blue-600" />
        <SummaryCard label="Usuarios"       value={summary.totalUsers}      icon={User} borderColor="border-purple-100" bgColor="bg-purple-50" iconColor="text-purple-600" />
        <SummaryCard label="Cotizaciones"   value={summary.totalQuotations} icon={FileText} borderColor="border-yellow-100" bgColor="bg-yellow-50" iconColor="text-yellow-600" />
        <SummaryCard label="Movimientos"    value={summary.totalMovements}  icon={RefreshCw} borderColor="border-orange-100" bgColor="bg-orange-50" iconColor="text-orange-600" />
        <SummaryCard
          label="Total facturado"
          value={`Bs. ${summary.totalBilled.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          borderColor="border-green-100"
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* GRÁFICAS: ESTADO (PIE) + TIPO (BARRAS) */}
      {/* ══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Cotizaciones por estado">
          <Pie data={pieData} options={chartOptions} />
        </Section>

        <Section title="Cotizaciones por tipo de proyecto">
          <Bar data={projectTypeData} options={chartOptions} />
        </Section>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* GRÁFICA: ÚLTIMOS 7 DÍAS */}
      {/* ══════════════════════════════════════════ */}

      <Section title="Cotizaciones — últimos 7 días">
        {quotations?.last7Days?.length === 0 ? (
          <p className="text-slate-400 text-xs font-medium">Sin registros operacionales en la última semana.</p>
        ) : (
          <Line data={last7DaysData as any} options={last7DaysOptions as any} />
        )}
      </Section>

      {/* ══════════════════════════════════════════ */}
      {/* TOP ASESORES + TOP PRODUCTOS */}
      {/* ══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Top asesores comerciales</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-800 text-xs font-semibold text-slate-200 rounded-lg">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Asesor</th>
                  <th className="px-4 py-3">Cotizaciones</th>
                  <th className="px-4 py-3 rounded-r-lg">Monto generado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topAdvisors.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{a.name}</td>
                    <td className="px-4 py-3 font-medium">{a.totalQuotations}</td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      Bs. {a.totalAmount.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Top productos cotizados (aprobadas)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-800 text-xs font-semibold text-slate-200 rounded-lg">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Producto</th>
                  <th className="px-4 py-3">Veces</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3 rounded-r-lg">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((p) => (
                  <tr key={p.productId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.product?.name}</td>
                    <td className="px-4 py-3 font-medium">{p.timesCotized}</td>
                    <td className="px-4 py-3 text-xs font-mono">{p.totalQuantity} {p.product?.unit}</td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      Bs. {p.totalRevenue.toLocaleString("es-BO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* GRÁFICA: LOGÍSTICA (INGRESOS VS SALIDAS) + CATEGORÍAS */}
      {/* ══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Flujo Logístico: Ingresos vs Salidas">
          <Bar data={inventoryMovementsData} options={chartOptions} />
        </Section>

        <Section title="Consolidado de Stock por categoría">
          <Bar data={stockCategoryData} options={chartOptions} />
        </Section>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* MOVIMIENTOS POR RAZÓN + ALERTA STOCK BAJO */}
      {/* ══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Distribución de movimientos por razón</h2>
          <div className="space-y-4">
            {inventory.byReason.map((r) => {
              const totalMovementsSum = inventory.movementsTotals.reduce((acc, m) => acc + (parseInt(m.totalMovements, 10) || 0), 0);
              const elementTotal = parseInt(r.total, 10) || 0;
              const percentage = totalMovementsSum > 0 ? (elementTotal / totalMovementsSum) * 100 : 0;
              
              return (
                <div key={r.reason} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>{REASON_LABELS[r.reason] || r.reason}</span>
                    <span className="font-bold text-slate-800">{r.total} u.</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-700 h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas de Quiebre de Stock
          </h2>
          {inventory.lowStockProducts.length === 0 ? (
            <div className="bg-green-50/60 border border-green-100 rounded-xl p-4 flex items-center justify-center">
              <p className="text-green-700 text-xs font-medium">✓ Excelente: Todas las existencias se encuentran sobre el límite de seguridad.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-800 font-semibold text-slate-200 rounded-lg">
                  <tr>
                    <th className="px-3 py-2 rounded-l-lg">Producto</th>
                    <th className="px-3 py-2">Almacén</th>
                    <th className="px-3 py-2">Stock</th>
                    <th className="px-3 py-2 rounded-r-lg">Disponible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.lowStockProducts.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{s.product?.name}</td>
                      <td className="px-3 py-2.5 capitalize">{s.warehouseName}</td>
                      <td className="px-3 py-2.5 text-red-600 font-bold">{s.quantity}</td>
                      <td className="px-3 py-2.5 font-medium">{s.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* REPORTE DE GANANCIAS / RENTABILIDAD */}
      {/* ══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Section title="Reporte de Ganancias (Ingresos vs Costos por Proyecto)">
            {profitability?.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium">No hay datos de rentabilidad disponibles.</p>
            ) : (
              <Bar data={profitabilityData as any} options={chartOptions} />
            )}
          </Section>
        </div>

        <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm overflow-hidden flex flex-col h-[330px]">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Detalle de Rentabilidad</h2>
          <div className="overflow-y-auto flex-1 pr-2">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-800 text-xs font-semibold text-slate-200 rounded-lg sticky top-0">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Proyecto</th>
                  <th className="px-3 py-2 text-right">Ingreso</th>
                  <th className="px-3 py-2 text-right">Costo</th>
                  <th className="px-3 py-2 text-right rounded-r-lg">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(profitability || []).map((p) => (
                  <tr key={p.projectId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-slate-800 truncate max-w-[100px]" title={p.clientName}>
                      {p.clientName}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-green-600">
                      Bs.{p.ingresos.toLocaleString("es-BO", { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-red-500">
                      Bs.{p.costos.toLocaleString("es-BO", { minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs font-bold text-blue-600">
                      Bs.{p.ganancia.toLocaleString("es-BO", { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

       <ChatWidget />

    </div>
  );
}