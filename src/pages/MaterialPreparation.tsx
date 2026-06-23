import { useState, useEffect, useCallback } from "react";
import { Search, FlaskConical, Plus, Beaker, CheckCircle2, ClipboardList, Info } from "lucide-react";
import { 
  ReactFlow, Background, Controls, 
  useNodesState, useEdgesState, ReactFlowProvider
} from '@xyflow/react';
import type { NodeProps, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const API_URL = "https://software-integral-ecodecor-backend.onrender.com";

interface Stock {
  warehouseName: string;
  quantity: string | number;
}

interface Product {
  id: number;
  name: string;
  code: string;
  unit: string;
  stock: Stock[];
}

interface PendingRequest {
  id: number;
  status: string;
  quotation: {
    clientName: string;
    items: Array<{
      id: number;
      quantity: string | number;
      product: { id: number, name: string, code: string, unit: string };
    }>
  };
  preparations?: Array<{
    outputProductId: number;
    outputQuantity: string | number;
  }>;
}

// ========================================================
// RECETAS BASE (Sugrencias)
// ========================================================
const SUGGESTED_RECIPES: Record<string, any[]> = {
  "Ecopaper": [
    { name: "Base Ecopaper", qtyPer25kg: 20, unit: "kg" },
    { name: "Agua", qtyPer25kg: 3, unit: "L" },
    { name: "Aditivo", qtyPer25kg: 2, unit: "L" }
  ],
  "Machiato": [
    { name: "Base Machiato", qtyPer25kg: 20, unit: "kg" },
    { name: "Agua", qtyPer25kg: 2, unit: "L" },
    { name: "Aceite Especial", qtyPer25kg: 1, unit: "L" },
    { name: "Pigmento", qtyPer25kg: 2, unit: "kg" }
  ],
  "Practistone": [
    { name: "Base Mineral", qtyPer25kg: 18, unit: "kg" },
    { name: "Agua", qtyPer25kg: 4, unit: "L" },
    { name: "Aditivo", qtyPer25kg: 2, unit: "kg" },
    { name: "Pigmento", qtyPer25kg: 1, unit: "kg" }
  ]
};

// ========================================================
// CUSTOM NODES
// ========================================================

const WarehouseNode = ({ data }: NodeProps) => (
  <div className="w-[450px] h-[750px] bg-white border border-slate-300 rounded-xl shadow-sm relative flex flex-col pointer-events-none">
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 rounded-t-xl">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 capitalize">
        Almacén {String(data.title)}
      </h2>
      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold shadow-sm">
        Inventario Disponible
      </span>
    </div>
    <div className="flex-1 p-4 bg-slate-100/50"></div>
  </div>
);

const LaboratoryNode = ({ data }: NodeProps) => {
  const ingredients = data.ingredients as Array<{product: Product, quantity: number}>;
  const targetProduct = data.targetProduct as Product | null;
  const targetQuantity = data.targetQuantity as number;
  const onPrepareClick = data.onPrepareClick as () => void;
  
  let suggested = [];
  if (targetProduct) {
    const key = Object.keys(SUGGESTED_RECIPES).find(k => targetProduct.name.toLowerCase().includes(k.toLowerCase()));
    if (key) {
      const multiplier = targetQuantity / 25;
      suggested = SUGGESTED_RECIPES[key].map(s => ({...s, qty: s.qtyPer25kg * multiplier}));
    }
  }

  return (
    <div className="w-[500px] min-h-[750px] bg-[#f8fafc] border-2 border-emerald-400 rounded-xl shadow-lg relative flex flex-col pointer-events-none overflow-hidden">
      <div className="bg-emerald-600 border-b border-emerald-700 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FlaskConical className="w-5 h-5" /> Mezclador
        </h2>
        {targetProduct && (
          <span className="bg-emerald-800 text-emerald-100 px-3 py-1 rounded text-xs font-bold shadow-sm border border-emerald-500">
            {targetQuantity} {targetProduct.unit} de {targetProduct.name}
          </span>
        )}
      </div>
      
      <div className="flex-1 p-6 flex flex-col gap-4 relative">
        {!targetProduct ? (
          <div className="flex-1 border-2 border-dashed border-emerald-300 rounded-xl bg-white/60 flex flex-col items-center justify-center p-6 text-center">
            <Beaker className="w-16 h-16 text-emerald-300 mb-4" />
            <p className="font-bold text-emerald-700 text-lg">Paso 1: Selecciona un Producto</p>
            <p className="text-sm text-emerald-600 mt-2">Usa el menú superior para elegir qué producto deseas fabricar antes de añadir insumos.</p>
          </div>
        ) : (
          <>
            {/* Receta Sugerida */}
            {suggested.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm mb-2 pointer-events-auto">
                <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm">
                  <Info className="w-4 h-4" /> Receta Sugerida (para {targetQuantity}{targetProduct.unit})
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {suggested.map((s, i) => (
                    <div key={i} className="flex justify-between bg-white px-2 py-1 rounded border border-blue-100">
                      <span className="text-slate-600">{s.name}</span>
                      <span className="font-bold text-blue-700">{s.qty} {s.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 border-2 border-dashed border-emerald-300 rounded-xl bg-white flex flex-col p-4 pointer-events-auto">
              <h3 className="font-bold text-emerald-800 mb-3 uppercase tracking-wider text-xs border-b border-emerald-100 pb-2">
                Insumos Agregados ({ingredients.length})
              </h3>
              
              {ingredients.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-emerald-400 pointer-events-none opacity-60">
                  <Plus className="w-10 h-10 mb-2" />
                  <p className="font-bold">Arrastra cajas aquí</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto w-full pr-2 space-y-2">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">{ing.product.name}</p>
                        <p className="text-xs text-emerald-600">{ing.product.code}</p>
                      </div>
                      <div className="bg-white px-3 py-1 rounded border border-emerald-200 shadow-sm font-black text-emerald-700">
                        {ing.quantity} {ing.product.unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={onPrepareClick}
                disabled={ingredients.length === 0}
                className="mt-4 w-full bg-emerald-600 text-white font-black py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
              >
                <CheckCircle2 className="w-5 h-5" /> FABRICAR LOTE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ProductNode = ({ data }: NodeProps) => {
  const p = data.product as Product;
  return (
    <div className="w-[80px] h-[80px] bg-[#f8eedb] border-2 border-[#d4b886] rounded shadow-md cursor-grab active:cursor-grabbing flex flex-col items-center justify-center relative hover:shadow-xl transition-all group hover:border-[#b8955a] z-50 p-1">
      <span className="text-[10px] font-bold text-[#805a33] leading-tight text-center break-words w-full line-clamp-3">{p.name}</span>
      <span className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-sm min-w-[20px] text-center">
        {String(data.quantity)}
      </span>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
        Cód: {p.code}
      </div>
    </div>
  );
};

const nodeTypes = {
  warehouse: WarehouseNode,
  laboratory: LaboratoryNode,
  product: ProductNode,
};

// ========================================================
// MAIN COMPONENT
// ========================================================

export default function MaterialPreparation() {
  return (
    <ReactFlowProvider>
      <GraphLayout />
    </ReactFlowProvider>
  );
}

function GraphLayout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);

  // Setup de Preparación
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("central");
  const [targetProductId, setTargetProductId] = useState<number | "">("");
  const [targetQuantity, setTargetQuantity] = useState<number>(25);
  const [targetProjectId, setTargetProjectId] = useState<number | null>(null);

  const targetProduct = products.find(p => p.id === targetProductId) || null;

  // Ingredientes arrastrados
  const [ingredients, setIngredients] = useState<Array<{product: Product, quantity: number}>>([]);
  
  // Modals
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedIngredientProduct, setSelectedIngredientProduct] = useState<Product | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState<number>(1);

  const [, setPreparing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [prodRes, reqRes] = await Promise.all([
        fetch(`${API_URL}/api/products?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/preparations/pending`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.data);
      }
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setPendingRequests(reqData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Limpiar ingredientes si cambia el producto objetivo
  useEffect(() => {
    setIngredients([]);
  }, [targetProductId, selectedWarehouse]);

  const getStock = (product: Product, warehouse: string) => {
    const s = product.stock?.find((s) => s.warehouseName === warehouse);
    return s ? parseFloat(s.quantity as string) : 0;
  };

  const executePreparation = async () => {
    if (!targetProductId || targetQuantity <= 0 || ingredients.length === 0) return;

    setPreparing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/preparations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          outputProductId: Number(targetProductId),
          outputQuantity: targetQuantity,
          warehouseName: selectedWarehouse,
          projectId: targetProjectId || undefined,
          items: ingredients.map(i => ({ productId: i.product.id, quantity: i.quantity }))
        }),
      });

      if (res.ok) {
        alert("¡Lote fabricado con éxito!");
        setTargetProductId("");
        setTargetProjectId(null);
        setIngredients([]);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.message || "Error al fabricar material");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setPreparing(false);
    }
  };

  const syncGraph = useCallback(() => {
    setNodes((prevNodes) => {
      const newNodesMap = new Map<string, Node>();

      newNodesMap.set('wh-source', {
        id: 'wh-source', type: 'warehouse', position: { x: -550, y: -20 },
        draggable: false, selectable: false, zIndex: -1,
        data: { title: selectedWarehouse }
      });

      newNodesMap.set('lab-target', {
        id: 'lab-target', type: 'laboratory', position: { x: 50, y: -20 },
        draggable: false, selectable: false, zIndex: -1,
        data: { 
          ingredients, 
          targetProduct,
          targetQuantity,
          onPrepareClick: executePreparation 
        }
      });

      let count = 0;
      products.forEach((p) => {
        // No mostrar el producto que estamos fabricando como insumo de sí mismo
        if (p.id === targetProductId) return;

        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return;

        const qty = getStock(p, selectedWarehouse);
        if (qty > 0) {
          const id = `prod-${p.id}`;
          const existing = prevNodes.find(n => n.id === id);
          
          const startX = -500 + (count % 4) * 100;
          const startY = 100 + Math.floor(count / 4) * 100;

          newNodesMap.set(id, {
            id, type: 'product', 
            position: { x: existing ? existing.position.x : startX, y: existing ? existing.position.y : startY }, 
            draggable: true, zIndex: 10,
            data: { product: p, quantity: qty }
          });
          count++;
        }
      });

      return Array.from(newNodesMap.values());
    });
  }, [products, searchTerm, ingredients, targetProduct, targetQuantity, selectedWarehouse, setNodes]);

  useEffect(() => { syncGraph(); }, [syncGraph]);

  const handleNodeDragStop = (_event: any, node: Node) => {
    if (node.type !== 'product') return;

    if (!targetProductId) {
      alert("Primero selecciona el Producto que deseas fabricar en la barra superior.");
    } else {
      const { x, y } = node.position;
      // Bounds of Laboratory: X from 50 to 550, Y from 0 to 750
      if (x >= 0 && x <= 550 && y >= -50 && y <= 800) {
        const product = node.data.product as Product;
        setSelectedIngredientProduct(product);
        setIngredientQuantity(1);
        setIsIngredientModalOpen(true);
      }
    }

    // Snap back always
    setNodes((nds) => nds.map(n => {
      if (n.id === node.id) {
         return { ...n, position: { x: -250, y: 300 } };
      }
      return n;
    }));
  };

  const addIngredient = () => {
    if (selectedIngredientProduct && ingredientQuantity > 0) {
      // Verificar si ya existe
      const existsIndex = ingredients.findIndex(i => i.product.id === selectedIngredientProduct.id);
      if (existsIndex >= 0) {
        const newIng = [...ingredients];
        newIng[existsIndex].quantity += ingredientQuantity;
        setIngredients(newIng);
      } else {
        setIngredients(prev => [...prev, { product: selectedIngredientProduct, quantity: ingredientQuantity }]);
      }
      setIsIngredientModalOpen(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-100px)] gap-4">
      {/* PANEL IZQUIERDO: Solicitudes de Proyectos */}
      <div className="w-[300px] bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-800 text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-sm">Necesidades de Proyectos</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {pendingRequests.length === 0 ? (
            <p className="text-slate-400 text-sm text-center mt-10">No hay proyectos activos.</p>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">#{req.id} {req.quotation.clientName}</h3>
                  </div>
                </div>
                <div className="space-y-1 mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Debemos Entregar:</p>
                  {req.quotation.items.map(item => {
                    const preparedQty = req.preparations?.filter(p => p.outputProductId === item.product.id).reduce((sum, p) => sum + parseFloat(String(p.outputQuantity)), 0) || 0;
                    const requiredQty = parseFloat(String(item.quantity));
                    const remainingQty = Math.max(0, requiredQty - preparedQty);
                    const isCompleted = remainingQty <= 0;

                    return (
                      <div key={item.id} className={`flex justify-between items-center text-xs p-1.5 rounded transition-colors group ${isCompleted ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-emerald-50'}`}>
                        <div className="flex flex-col">
                          <span className={`font-medium truncate max-w-[120px] ${isCompleted ? 'text-emerald-700 line-through' : 'text-slate-700'}`} title={item.product.name}>
                            {item.product.name}
                          </span>
                          <span className={`font-black ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>
                            {isCompleted ? '¡Listo!' : `Faltan ${remainingQty} ${item.product.unit}`}
                          </span>
                        </div>
                        {!isCompleted ? (
                          <button
                            onClick={() => {
                              setTargetProductId(item.product.id);
                              setTargetQuantity(remainingQty || 25);
                              setTargetProjectId(req.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-emerald-600 transition-all"
                          >
                            Preparar
                          </button>
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PANEL DERECHO: Canvas de Preparación */}
      <div className="flex-1 bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
        
        {/* TOP BAR CONFIGURATION */}
        <div className="bg-white border-b border-slate-200 p-4 z-20 shadow-sm flex flex-wrap gap-4 items-end">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Paso 1: Almacén Base</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-700 outline-none w-32"
            >
              <option value="central">Central</option>
              <option value="macororo">Macororó</option>
            </select>
          </div>

          <div className="flex-1 max-w-sm relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Paso 2: ¿Qué producto vas a fabricar?
            </label>
            <select
              value={targetProductId}
              onChange={(e) => {
                setTargetProductId(Number(e.target.value));
                setTargetProjectId(null); // Si cambia manualmente, desvincula del proyecto
              }}
              className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-sm font-bold text-emerald-800 outline-none w-full"
            >
              <option value="">-- Selecciona el producto final --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
            {targetProjectId && (
              <div className="absolute -top-3 right-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                Vinculado al Proyecto #{targetProjectId}
                <button onClick={() => setTargetProjectId(null)} className="hover:text-red-200 ml-1">×</button>
              </div>
            )}
          </div>

          <div className="w-32">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cantidad a generar</label>
            <input
              type="number"
              min="1"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(parseFloat(e.target.value) || 0)}
              className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-sm font-bold text-emerald-800 outline-none w-full"
              disabled={!targetProductId}
            />
          </div>

          <div className="flex-1 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar insumos para agregar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 w-full outline-none shadow-sm"
            />
          </div>

        </div>

        {loading && (
          <div className="absolute inset-0 z-30 bg-slate-50/80 backdrop-blur-sm flex justify-center items-center">
            <div className="h-16 w-16 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={handleNodeDragStop}
            fitView
            fitViewOptions={{ padding: 0.1, minZoom: 0.2, maxZoom: 1.5 }}
            className="w-full h-full"
          >
            <Background color="#cbd5e1" gap={40} size={1.5} />
            <Controls className="bg-white border-slate-200 shadow-md text-slate-600" showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Modal: Añadir Insumo */}
        {isIngredientModalOpen && selectedIngredientProduct && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Añadir Insumo</h3>
              <p className="text-sm text-slate-600 mb-4">{selectedIngredientProduct.name}</p>
              
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Cantidad a usar</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={ingredientQuantity}
                onChange={(e) => setIngredientQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none text-lg mb-6"
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsIngredientModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-600 font-bold">Cancelar</button>
                <button onClick={addIngredient} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Añadir a Mezcla</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
