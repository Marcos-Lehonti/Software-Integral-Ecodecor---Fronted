import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://software-integral-ecodecor-backend.onrender.com";

const CATEGORIES = ["ecopaper", "practstone", "machiato", "insumo"];
const UNITS = ["litros", "kilos", "bolsas", "baldes", "metros2", "unidades"];

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "", name: "", description: "", category: "",
    unit: "", price: "", color: "", lot: "", minArea: "",
    containerLiters: "", yieldM2: "", // ✅
  });

  const [stock, setStock] = useState({
    central: "",
    macororo: "",
  });

  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: "key" | "value", value: string) => {
    setAttributes((prev) => prev.map((attr, i) => i === index ? { ...attr, [field]: value } : attr));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const attributesObj = attributes.reduce((acc, { key, value }) => {
      if (key) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const body = {
      ...form,
      price: parseFloat(form.price),
      minArea: form.minArea ? parseFloat(form.minArea) : null,
      containerLiters: form.containerLiters ? parseFloat(form.containerLiters) : null, // ✅
      yieldM2: form.yieldM2 ? parseFloat(form.yieldM2) : null,                         // ✅
      stock: [
        { warehouseName: "central", quantity: parseFloat(stock.central) || 0 },
        { warehouseName: "macororo", quantity: parseFloat(stock.macororo) || 0 },
      ],
      attributes: attributesObj,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al crear producto");

      setMsg("Producto creado correctamente");
      setTimeout(() => navigate("/products"), 1500);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Agregar Producto</h2>

      {msg && <div className="rounded-md bg-indigo-50 p-3 text-sm text-indigo-800">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Código y Nombre */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código *</label>
            <input name="code" required value={form.code} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Item (Nombre) *</label>
            <input name="name" required value={form.name} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
        </div>

        {/* Categoría y Unidad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría *</label>
            <select name="category" required value={form.category} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm">
              <option value="">Selecciona...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad de medida *</label>
            <select name="unit" required value={form.unit} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm">
              <option value="">Selecciona...</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Precio y Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio (Bs.) *</label>
            <input name="price" type="number" required min="0" step="0.01" value={form.price} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input name="color" value={form.color} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>

        {/* Lote y Área mínima */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lote</label>
            <input name="lot" value={form.lot} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Área mínima (m²)</label>
            <input name="minArea" type="number" min="0" step="0.01" value={form.minArea} onChange={handleChange}
              placeholder="Ej: 20 (dejar vacío si no aplica)"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>

        {/* ✅ Envase en litros y Rendimiento en m² */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Envase (litros)</label>
            <input name="containerLiters" type="number" min="0" step="0.01" value={form.containerLiters} onChange={handleChange}
              placeholder="Dejar vacío si no aplica"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rendimiento (m²)</label>
            <input name="yieldM2" type="number" min="0" step="0.01" value={form.yieldM2} onChange={handleChange}
              placeholder="Dejar vacío si no aplica"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
          </div>
        </div>

        {/* Stock por almacén */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stock inicial por almacén</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500">Almacén Central</label>
              <input type="number" min="0" step="0.01" value={stock.central}
                onChange={(e) => setStock((prev) => ({ ...prev, central: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Tienda Macororo</label>
              <input type="number" min="0" step="0.01" value={stock.macororo}
                onChange={(e) => setStock((prev) => ({ ...prev, macororo: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
        </div>

        {/* Atributos dinámicos */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Atributos adicionales</label>
            <button type="button" onClick={addAttribute}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
              + Agregar atributo
            </button>
          </div>
          {attributes.map((attr, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input placeholder="Nombre (ej: viscosidad)" value={attr.key}
                onChange={(e) => updateAttribute(index, "key", e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
              <input placeholder="Valor (ej: alta)" value={attr.value}
                onChange={(e) => updateAttribute(index, "value", e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={() => removeAttribute(index)}
                className="text-red-500 hover:text-red-400 font-bold px-2">✕</button>
            </div>
          ))}
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button type="submit" disabled={loading}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60">
            {loading ? "Guardando..." : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}