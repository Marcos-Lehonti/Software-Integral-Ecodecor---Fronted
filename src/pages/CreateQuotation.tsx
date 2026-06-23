import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ProductStock = {
  warehouseName: string;
  quantity: string;
  reservedQuantity: string;
  availableQuantity: number;
};

type Product = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  stock: ProductStock[];
};

type SelectedItem = {
  productId: number;
  warehouseName: string;
  quantity: number;
};

export default function CreateQuotation() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);

  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientCompany: "",
    clientPhone: "",
    clientEmail: "",

    projectType: "material",

    serviceDescription: "",
    workDuration: "",

    paymentTerms: "",
    termsConditions: "",
    notes: "",

    validUntil: "",
  });

  const [items, setItems] = useState<SelectedItem[]>([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("central");
  const [selectedQuantity, setSelectedQuantity] = useState(1);



  // =====================================================
  // CARGAR PRODUCTOS
  // =====================================================

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setProducts(data.data || []);

      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();

  }, []);



  // =====================================================
  // AGREGAR ITEM
  // =====================================================

  const addItem = () => {

    if (!selectedProduct) return;

    const exists = items.find(
      (i) =>
        i.productId === Number(selectedProduct) &&
        i.warehouseName === selectedWarehouse
    );

    if (exists) {
      setMessage("Ese producto ya fue agregado");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: Number(selectedProduct),
        warehouseName: selectedWarehouse,
        quantity: selectedQuantity,
      },
    ]);

    setSelectedProduct("");
    setSelectedWarehouse("central");
    setSelectedQuantity(1);
  };



  // =====================================================
  // ELIMINAR ITEM
  // =====================================================

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };



  // =====================================================
  // TOTAL
  // =====================================================

  const total = useMemo(() => {

    return items.reduce((acc, item) => {

      const product = products.find(
        (p) => p.id === item.productId
      );

      if (!product) return acc;

      return (
        acc +
        Number(product.price) * item.quantity
      );

    }, 0);

  }, [items, products]);



  // =====================================================
  // CREAR COTIZACIÓN
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setLoading(true);

    setMessage("");

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/quotations`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            ...form,
            items,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMessage("Cotización creada correctamente");

      setTimeout(() => {
        navigate("/quotations/list");
      }, 1500);

    } catch (err: any) {

      setMessage(err.message);

    } finally {

      setLoading(false);
    }
  };



  return (

    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">

      <h1 className="text-2xl font-bold text-gray-900">
        Nueva Cotización
      </h1>


      {message && (
        <div className="bg-indigo-50 text-indigo-700 rounded-md p-3 text-sm">
          {message}
        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* CLIENTE */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente *
            </label>

            <input
              required
              value={form.clientName}
              onChange={(e) =>
                setForm({
                  ...form,
                  clientName: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Empresa
            </label>

            <input
              value={form.clientCompany}
              onChange={(e) =>
                setForm({
                  ...form,
                  clientCompany: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

        </div>



        {/* DATOS */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>

            <input
              value={form.clientPhone}
              onChange={(e) =>
                setForm({
                  ...form,
                  clientPhone: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              value={form.clientEmail}
              onChange={(e) =>
                setForm({
                  ...form,
                  clientEmail: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

        </div>



        {/* TIPO */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de proyecto
            </label>

            <select
              value={form.projectType}
              onChange={(e) =>
                setForm({
                  ...form,
                  projectType: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="material">Material</option>
              <option value="mano_obra">Mano de obra</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Válida hasta
            </label>

            <input
              type="date"
              required
              value={form.validUntil}
              onChange={(e) =>
                setForm({
                  ...form,
                  validUntil: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

        </div>



        {/* NUEVOS CAMPOS */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duración del trabajo
            </label>

            <input
              type="text"
              value={form.workDuration}
              onChange={(e) =>
                setForm({
                  ...form,
                  workDuration: e.target.value,
                })
              }
              placeholder="Ej: 7 días"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

        </div>



        {/* PRODUCTOS */}

        <div className="border rounded-lg p-4 space-y-4">

          <h2 className="font-semibold text-lg">
            Productos
          </h2>


          <div className="grid grid-cols-4 gap-4">

            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="rounded-md border border-gray-300 px-3 py-2"
            >

              <option value="">
                Seleccionar producto
              </option>

              {products.map((product) => (

                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} — Bs. {product.price}
                </option>

              ))}

            </select>



            <select
              value={selectedWarehouse}
              onChange={(e) =>
                setSelectedWarehouse(e.target.value)
              }
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="central">
                Central
              </option>

              <option value="macororo">
                Macororo
              </option>
            </select>



            <input
              type="number"
              min={1}
              value={selectedQuantity}
              onChange={(e) =>
                setSelectedQuantity(
                  Number(e.target.value)
                )
              }
              className="rounded-md border border-gray-300 px-3 py-2"
            />



            <button
              type="button"
              onClick={addItem}
              className="bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-500"
            >
              Agregar
            </button>

          </div>



          {/* TABLA */}

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Almacén
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>

                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>

                  <th></th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-200 bg-white">

                {items.map((item, index) => {

                  const product = products.find(
                    (p) => p.id === item.productId
                  );

                  if (!product) return null;

                  return (

                    <tr key={index}>

                      <td className="px-4 py-3">
                        {product.name}
                      </td>

                      <td className="px-4 py-3">
                        {item.warehouseName}
                      </td>

                      <td className="px-4 py-3">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3">
                        Bs. {product.price}
                      </td>

                      <td className="px-4 py-3">
                        Bs. {
                          Number(product.price) *
                          item.quantity
                        }
                      </td>

                      <td className="px-4 py-3">

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>



        {/* DESCRIPCIÓN */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            Descripción del servicio
          </label>

          <textarea
            rows={4}
            value={form.serviceDescription}
            onChange={(e) =>
              setForm({
                ...form,
                serviceDescription: e.target.value,
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />

        </div>



        {/* CONDICIONES DE PAGO */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            Condiciones de pago
          </label>

          <textarea
            rows={3}
            value={form.paymentTerms}
            onChange={(e) =>
              setForm({
                ...form,
                paymentTerms: e.target.value,
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />

        </div>



        {/* TÉRMINOS */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            Términos y condiciones
          </label>

          <textarea
            rows={3}
            value={form.termsConditions}
            onChange={(e) =>
              setForm({
                ...form,
                termsConditions: e.target.value,
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />

        </div>



        {/* NOTAS */}

        <div>

          <label className="block text-sm font-medium text-gray-700">
            Notas
          </label>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />

        </div>



        {/* TOTAL */}

        <div className="flex justify-end">

          <div className="bg-gray-50 rounded-lg px-6 py-4">

            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="text-2xl font-bold text-gray-900">
              Bs. {total.toFixed(2)}
            </p>

          </div>

        </div>



        {/* BOTÓN */}

        <div className="flex justify-end">

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-md px-6 py-3 font-semibold"
          >
            {loading
              ? "Guardando..."
              : "Crear Cotización"}
          </button>

        </div>

      </form>

    </div>
  );
}