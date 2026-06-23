import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:4000";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: string;
}

interface QuotationItem {
  id: number;
  quotationId: number;
  productId: number;
  warehouseName: string;
  quantity: string;
  reservedQuantity: string;
  unitPrice: string;
  subtotal: string;
  product: Product;
}

interface Advisor {
  id: number;
  name: string;
  email: string;
}

interface Quotation {
  id: number;
  quotationNumber: string;

  clientName: string;
  clientCompany: string | null;
  clientPhone: string | null;
  clientEmail: string | null;

  createdBy: number;

  projectType: string;

  serviceDescription: string | null;
  workDuration: string | null;

  paymentTerms: string | null;
  termsConditions: string | null;
  notes: string | null;

  validUntil: string;

  subtotal: string;
  total: string;

  status: string;

  createdAt: string;
  updatedAt: string;

  items: QuotationItem[];

  advisor: Advisor;
}

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-500",
  aprobada: "bg-green-500",
  cancelada: "bg-red-500",
  rechazada: "bg-gray-500",
};

const projectTypeColors: Record<string, string> = {
  material: "bg-blue-500",
  mano_obra: "bg-indigo-500",
  mixto: "bg-purple-500",
};

export default function QuotationsList() {

  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] =
    useState<Quotation | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  // =====================================================
  // AGREGADO: estado para controlar carga del PDF
  // =====================================================

  const [pdfLoadingId, setPdfLoadingId] =
    useState<number | null>(null);



  // =====================================================
  // CARGAR COTIZACIONES
  // =====================================================

  useEffect(() => {

    const fetchQuotations = async () => {

      setLoading(true);

      try {

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/quotations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message ||
            "Error al obtener cotizaciones"
          );
        }

        setQuotations(data.data || []);

      } catch (err: any) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    };

    fetchQuotations();

  }, []);



  // =====================================================
  // AGREGADO: GENERAR PDF
  // =====================================================

  const handleGeneratePdf = async (
    quotationId: number,
    quotationNumber: string
  ) => {

    setPdfLoadingId(quotationId);

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/quotation-pdf/${quotationId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al generar el PDF");
      }

      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href     = url;
      link.download = `${quotationNumber}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);

    } catch (err: any) {

      alert(err.message);

    } finally {

      setPdfLoadingId(null);
    }
  };



  // =====================================================
  // APROBAR
  // =====================================================

  const handleApprove = async (
    quotationId: number
  ) => {

    if (
      !confirm(
        "¿Aprobar esta cotización?"
      )
    ) return;

    setProcessingId(quotationId);

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/quotations/${quotationId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
          "Error al aprobar"
        );
      }

      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quotationId
            ? { ...q, status: "aprobada" }
            : q
        )
      );

      if (selected?.id === quotationId) {
        setSelected({
          ...selected,
          status: "aprobada",
        });
      }

    } catch (err: any) {

      alert(err.message);

    } finally {

      setProcessingId(null);
    }
  };




  // =====================================================
  // CANCELAR
  // =====================================================

  const handleCancel = async (
    quotationId: number
  ) => {

    if (
      !confirm(
        "¿Cancelar esta cotización?"
      )
    ) return;

    setProcessingId(quotationId);

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/quotations/${quotationId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message ||
          "Error al cancelar"
        );
      }

      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quotationId
            ? { ...q, status: "cancelada" }
            : q
        )
      );

      if (selected?.id === quotationId) {
        setSelected({
          ...selected,
          status: "cancelada",
        });
      }

    } catch (err: any) {

      alert(err.message);

    } finally {

      setProcessingId(null);
    }
  };




  return (

    <div className="min-h-screen bg-white p-8 text-black">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Cotizaciones
        </h1>

        <Link
          to="/quotations/create"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          + Nueva cotización
        </Link>

      </div>



      {loading && (
        <p className="text-indigo-500">
          Cargando cotizaciones...
        </p>
      )}


      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}



      {!loading && !error && (

        <div className="overflow-x-auto">

          <table className="min-w-full border border-gray-300 rounded-lg">

            <thead className="bg-gray-800">

              <tr>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  N°
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Cliente
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Empresa
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Tipo
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Total
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Estado
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Validez
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Asesor
                </th>

                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                  Acciones
                </th>

              </tr>

            </thead>



            <tbody className="divide-y divide-gray-200">

              {quotations.map((quotation) => (

                <tr
                  key={quotation.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    setSelected(quotation)
                  }
                >

                  <td className="px-4 py-3 text-sm font-medium">
                    {quotation.quotationNumber}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {quotation.clientName}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {quotation.clientCompany || "—"}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        projectTypeColors[
                          quotation.projectType
                        ] || "bg-gray-500"
                      }`}
                    >
                      {quotation.projectType}
                    </span>

                  </td>

                  <td className="px-4 py-3 text-sm font-semibold">
                    Bs. {quotation.total}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        statusColors[
                          quotation.status
                        ] || "bg-gray-500"
                      }`}
                    >
                      {quotation.status}
                    </span>

                  </td>

                  <td className="px-4 py-3 text-sm">
                    {new Date(
                      quotation.validUntil
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {quotation.advisor?.name}
                  </td>

                  <td
                    className="px-4 py-3 flex gap-3 items-center"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    {/* ================================= */}
                    {/* AGREGADO: botón PDF en la tabla   */}
                    {/* ================================= */}

                    <button
                      onClick={() =>
                        handleGeneratePdf(
                          quotation.id,
                          quotation.quotationNumber
                        )
                      }
                      disabled={
                        pdfLoadingId === quotation.id
                      }
                      title="Descargar PDF"
                      className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition"
                    >
                      {pdfLoadingId === quotation.id
                        ? "..."
                        : "PDF"}
                    </button>

                    {quotation.status ===
                      "pendiente" ? (
                      <>
                        <button
                          onClick={() =>
                            handleApprove(
                              quotation.id
                            )
                          }
                          disabled={
                            processingId ===
                            quotation.id
                          }
                          className="text-green-600 hover:text-green-500 text-sm font-medium disabled:opacity-50"
                        >
                          {processingId === quotation.id
                            ? "Procesando..."
                            : "Aprobar"}
                        </button>

                        <button
                          onClick={() =>
                            handleCancel(
                              quotation.id
                            )
                          }
                          disabled={
                            processingId ===
                            quotation.id
                          }
                          className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                        >
                          {processingId === quotation.id
                            ? "Procesando..."
                            : "Cancelar"}
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        Sin acciones
                      </span>
                    )}

                  </td>

                </tr>

              ))}



              {quotations.length === 0 && (

                <tr>

                  <td
                    colSpan={9}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No hay cotizaciones registradas
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      )}




      {/* ===================================================== */}
      {/* MODAL DETALLE */}
      {/* ===================================================== */}

      {selected && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">

          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-5xl p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">

            {/* CERRAR */}

            <button
              onClick={() =>
                setSelected(null)
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>



            {/* HEADER */}

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  {selected.quotationNumber}
                </h2>

                <p className="text-gray-400 text-sm">
                  Creada el{" "}
                  {new Date(
                    selected.createdAt
                  ).toLocaleString()}
                </p>

              </div>

              {/* =========================================== */}
              {/* AGREGADO: botón PDF + badge estado (modal)  */}
              {/* =========================================== */}

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    handleGeneratePdf(
                      selected.id,
                      selected.quotationNumber
                    )
                  }
                  disabled={
                    pdfLoadingId === selected.id
                  }
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition"
                >
                  {pdfLoadingId === selected.id
                    ? "Generando PDF..."
                    : "⬇ Descargar PDF"}
                </button>

                <span
                  className={`px-3 py-1 rounded text-sm font-semibold text-white ${
                    statusColors[
                      selected.status
                    ] || "bg-gray-500"
                  }`}
                >
                  {selected.status}
                </span>

              </div>

            </div>




            {/* ACCIONES MODAL */}

            {selected.status === "pendiente" && (

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    handleApprove(selected.id)
                  }
                  disabled={
                    processingId === selected.id
                  }
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium"
                >
                  {processingId === selected.id
                    ? "Procesando..."
                    : "Aprobar cotización"}
                </button>

                <button
                  onClick={() =>
                    handleCancel(selected.id)
                  }
                  disabled={
                    processingId === selected.id
                  }
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium"
                >
                  {processingId === selected.id
                    ? "Procesando..."
                    : "Cancelar cotización"}
                </button>

              </div>

            )}




            {/* DATOS CLIENTE */}

            <div>

              <h3 className="text-lg font-semibold text-white mb-3">
                Datos del cliente
              </h3>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Cliente
                  </p>

                  <p className="text-white font-medium">
                    {selected.clientName}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Empresa
                  </p>

                  <p className="text-white font-medium">
                    {selected.clientCompany || "—"}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Teléfono
                  </p>

                  <p className="text-white font-medium">
                    {selected.clientPhone || "—"}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Email
                  </p>

                  <p className="text-white font-medium">
                    {selected.clientEmail || "—"}
                  </p>
                </div>

              </div>

            </div>




            {/* INFO COTIZACIÓN */}

            <div>

              <h3 className="text-lg font-semibold text-white mb-3">
                Información del proyecto
              </h3>

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Tipo de proyecto
                  </p>

                  <p className="text-white font-medium">
                    {selected.projectType}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Duración
                  </p>

                  <p className="text-white font-medium">
                    {selected.workDuration || "—"}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Válida hasta
                  </p>

                  <p className="text-white font-medium">
                    {new Date(
                      selected.validUntil
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">
                    Asesor
                  </p>

                  <p className="text-white font-medium">
                    {selected.advisor?.name}
                  </p>
                </div>

              </div>

            </div>




            {/* DESCRIPCIÓN */}

            {selected.serviceDescription && (

              <div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  Descripción del servicio
                </h3>

                <div className="bg-gray-700 rounded-lg p-4">

                  <p className="text-gray-200 text-sm whitespace-pre-line">
                    {selected.serviceDescription}
                  </p>

                </div>

              </div>

            )}




            {/* PRODUCTOS */}

            <div>

              <h3 className="text-lg font-semibold text-white mb-3">
                Productos cotizados
              </h3>

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-700">

                  <thead className="bg-gray-700">

                    <tr>

                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Producto
                      </th>

                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Código
                      </th>

                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Almacén
                      </th>

                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Cantidad
                      </th>

                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Precio
                      </th>

                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Subtotal
                      </th>

                    </tr>

                  </thead>



                  <tbody className="divide-y divide-gray-700 bg-gray-800">

                    {selected.items.map((item) => (

                      <tr key={item.id}>

                        <td className="px-4 py-3 text-sm text-white">
                          {item.product?.name}
                        </td>

                        <td className="px-4 py-3 text-sm text-white">
                          {item.product?.code}
                        </td>

                        <td className="px-4 py-3 text-sm text-white">
                          {item.warehouseName}
                        </td>

                        <td className="px-4 py-3 text-sm text-white">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3 text-sm text-white">
                          Bs. {item.unitPrice}
                        </td>

                        <td className="px-4 py-3 text-sm text-white font-semibold">
                          Bs. {item.subtotal}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>




            {/* TERMINOS */}

            {(selected.paymentTerms ||
              selected.termsConditions ||
              selected.notes) && (

              <div className="grid grid-cols-1 gap-4">

                {selected.paymentTerms && (

                  <div className="bg-gray-700 rounded-lg p-4">

                    <p className="text-gray-400 text-sm mb-1">
                      Condiciones de pago
                    </p>

                    <p className="text-white text-sm whitespace-pre-line">
                      {selected.paymentTerms}
                    </p>

                  </div>

                )}



                {selected.termsConditions && (

                  <div className="bg-gray-700 rounded-lg p-4">

                    <p className="text-gray-400 text-sm mb-1">
                      Términos y condiciones
                    </p>

                    <p className="text-white text-sm whitespace-pre-line">
                      {selected.termsConditions}
                    </p>

                  </div>

                )}



                {selected.notes && (

                  <div className="bg-gray-700 rounded-lg p-4">

                    <p className="text-gray-400 text-sm mb-1">
                      Notas
                    </p>

                    <p className="text-white text-sm whitespace-pre-line">
                      {selected.notes}
                    </p>

                  </div>

                )}

              </div>

            )}




            {/* TOTAL */}

            <div className="flex justify-end">

              <div className="bg-indigo-600 rounded-lg px-6 py-4">

                <p className="text-indigo-100 text-sm">
                  Total cotización
                </p>

                <p className="text-3xl font-bold text-white">
                  Bs. {selected.total}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}