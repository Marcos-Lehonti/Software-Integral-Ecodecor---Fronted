import { useEffect, useState } from "react";

const API_URL = "https://software-integral-ecodecor-backend.onrender.com";

// Reutilizás las mismas interfaces que ya tenés
interface Quotation {
  id: number;
  quotationNumber: string;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  total: string;
  status: string;
}

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada:  "bg-green-100  text-green-800",
  cancelada: "bg-red-100    text-red-800",
  rechazada: "bg-gray-100   text-gray-700",
};

export default function SendQuotationsList() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // ID que está en proceso de envío
  const [sendingId, setSendingId]   = useState<number | null>(null);
  // IDs que ya fueron enviados exitosamente
  const [sentIds, setSentIds]       = useState<Set<number>>(new Set());

  // ─── cargar cotizaciones ──────────────────────────────
  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API_URL}/api/quotations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Error al obtener cotizaciones");
        setQuotations(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  // ─── enviar por email ─────────────────────────────────
  const handleSend = async (quotationId: number) => {
    if (!confirm("¿Enviar esta cotización por email?")) return;

    setSendingId(quotationId);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(
        `${API_URL}/api/quotation-email/${quotationId}/send`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al enviar");

      // marcar como enviado
      setSentIds((prev) => new Set(prev).add(quotationId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 text-black">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Enviar cotizaciones</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enviá cada cotización al email del cliente directamente
        </p>
      </div>

      {loading && <p className="text-indigo-500">Cargando...</p>}
      {error   && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">

            <thead className="bg-gray-800">
              <tr>
                {["N°","Cliente","Empresa","Email","Total","Estado","Acción"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {quotations.map((q) => {
                const alreadySent = sentIds.has(q.id);
                const isSending   = sendingId === q.id;
                const hasEmail    = !!q.clientEmail;

                return (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{q.quotationNumber}</td>
                    <td className="px-4 py-3 text-sm">{q.clientName}</td>
                    <td className="px-4 py-3 text-sm">{q.clientCompany || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{q.clientEmail || "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold">Bs. {q.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[q.status] || "bg-gray-100 text-gray-700"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!hasEmail ? (
                        <span className="text-gray-400 text-xs italic">Sin email</span>
                      ) : alreadySent ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                          ✓ Enviado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSend(q.id)}
                          disabled={isSending}
                          className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition"
                        >
                          {isSending ? "Enviando..." : "✉ Enviar cotización"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {quotations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                    No hay cotizaciones registradas
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