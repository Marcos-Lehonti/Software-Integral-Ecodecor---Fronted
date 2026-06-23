import { useState, useEffect, useCallback } from "react";
import { ArrowRightLeft, Search, Package, Map as MapIcon } from "lucide-react";
import { 
  ReactFlow, Background, Controls, Handle, Position, 
  useNodesState, useEdgesState, ReactFlowProvider
} from '@xyflow/react';
import type { NodeProps, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// --- Tipos ---
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

// ========================================================
// CUSTOM NODES (TOP VIEW WMS DESIGN)
// ========================================================

const WarehouseNode = ({ data }: NodeProps) => (
  <div className="w-[500px] h-[800px] bg-white border border-slate-300 rounded-xl shadow-sm relative overflow-hidden flex flex-col pointer-events-none">
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <MapIcon className="w-5 h-5 text-indigo-500" />
        {String(data.title)}
      </h2>
      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold shadow-sm">
        {String(data.count)} items
      </span>
    </div>
    
    <div className="flex-1 flex flex-col p-6 gap-6 bg-slate-100/50">
      <div className="h-[120px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/50 relative shadow-inner">
         <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm text-center">Zona de<br/>Recepción</span>
      </div>
      <div className="flex-1 border-2 border-slate-300 rounded-xl flex items-center justify-center bg-white relative shadow-inner">
         <span className="text-slate-200 font-black uppercase tracking-[0.3em] text-4xl text-center rotate-[-45deg] select-none pointer-events-none w-full">
           Almacenamiento
         </span>
      </div>
      <div className="h-[120px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/50 relative shadow-inner">
         <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm text-center">Zona de<br/>Despacho</span>
      </div>
    </div>
  </div>
);

const ProductNode = ({ data }: NodeProps) => {
  const p = data.product as Product;
  return (
    <div className="w-[80px] h-[80px] bg-[#f8eedb] border-2 border-[#d4b886] rounded shadow-md cursor-grab active:cursor-grabbing flex flex-col items-center justify-center relative hover:shadow-xl transition-all group hover:border-[#b8955a] z-50">
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <Package className="w-6 h-6 text-[#a67c52] mb-1 opacity-80" strokeWidth={1.5} />
      <span className="text-[9px] font-bold text-[#805a33] leading-tight text-center px-1 truncate w-full">{p.code}</span>
      
      <span className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-sm min-w-[20px] text-center">
        {String(data.quantity)}
      </span>
      
      {/* Tooltip for full name */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
        {p.name}
      </div>
    </div>
  );
};

const HubCenterNode = () => (
  <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md z-0 text-slate-400">
    <ArrowRightLeft className="w-6 h-6" />
  </div>
);

const nodeTypes = {
  warehouse: WarehouseNode,
  product: ProductNode,
  hubCenter: HubCenterNode,
};

// ========================================================
// MAIN COMPONENT
// ========================================================

export default function WarehouseTransfer() {
  return (
    <ReactFlowProvider>
      <GraphLayout />
    </ReactFlowProvider>
  );
}

function GraphLayout() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<{
    product: Product | null;
    sourceWarehouse: string;
    targetWarehouse: string;
    maxQuantity: number;
  }>({ product: null, sourceWarehouse: "", targetWarehouse: "", maxQuantity: 0 });
  const [transferQuantity, setTransferQuantity] = useState<number>(1);
  const [transferring, setTransferring] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStockForWarehouse = (product: Product, warehouse: string) => {
    const stock = product.stock?.find((s) => s.warehouseName === warehouse);
    return stock ? parseFloat(stock.quantity as string) : 0;
  };

  // Layout Engine (Sincroniza preservando las posiciones guardadas en la memoria gráfica)
  const syncGraph = useCallback(() => {
    setNodes((prevNodes) => {
      const newNodesMap = new Map<string, Node>();
      const WH_WIDTH = 500;
      const WH_HEIGHT = 800;

      // Nodos Almacén Base (Planos físicos, inmovibles)
      newNodesMap.set('wh-macororo', {
        id: 'wh-macororo', type: 'warehouse', position: { x: -600, y: 0 },
        draggable: false, selectable: false, zIndex: -1, style: { width: WH_WIDTH, height: WH_HEIGHT },
        data: { title: 'Almacén Macororo', count: 0 }
      });

      newNodesMap.set('wh-central', {
        id: 'wh-central', type: 'warehouse', position: { x: 100, y: 0 },
        draggable: false, selectable: false, zIndex: -1, style: { width: WH_WIDTH, height: WH_HEIGHT },
        data: { title: 'Almacén Central', count: 0 }
      });

      newNodesMap.set('hub-center', {
        id: 'hub-center', type: 'hubCenter', position: { x: -32, y: WH_HEIGHT/2 - 32 },
        draggable: false, selectable: false, zIndex: -2, data: {}
      });

      let macororoCount = 0;
      let centralCount = 0;

      products.forEach((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return;

        const macQty = getStockForWarehouse(p, "macororo");
        const cenQty = getStockForWarehouse(p, "central");

        // Añadir/Actualizar items a Macororo
        if (macQty > 0) {
          const id = `prod-macororo-${p.id}`;
          const existing = prevNodes.find(n => n.id === id);
          
          // Posición inicial en cuadrícula dentro del área de Almacenamiento Central
          const startX = -540 + (macororoCount % 4) * 100;
          const startY = 220 + Math.floor(macororoCount / 4) * 100;

          newNodesMap.set(id, {
            id, type: 'product', 
            position: { x: existing ? existing.position.x : startX, y: existing ? existing.position.y : startY }, 
            draggable: true, zIndex: 10,
            data: { product: p, quantity: macQty, sourceWarehouse: 'macororo' }
          });
          macororoCount++;
        }

        // Añadir/Actualizar items a Central
        if (cenQty > 0) {
          const id = `prod-central-${p.id}`;
          const existing = prevNodes.find(n => n.id === id);
          
          const startX = 160 + (centralCount % 4) * 100;
          const startY = 220 + Math.floor(centralCount / 4) * 100;

          newNodesMap.set(id, {
            id, type: 'product', 
            position: { x: existing ? existing.position.x : startX, y: existing ? existing.position.y : startY }, 
            draggable: true, zIndex: 10,
            data: { product: p, quantity: cenQty, sourceWarehouse: 'central' }
          });
          centralCount++;
        }
      });

      // Actualizar contadores visuales de los almacenes
      newNodesMap.get('wh-macororo')!.data.count = macororoCount;
      newNodesMap.get('wh-central')!.data.count = centralCount;

      return Array.from(newNodesMap.values());
    });
  }, [products, searchTerm, setNodes]);

  useEffect(() => {
    syncGraph();
  }, [syncGraph]);

  // Lógica de colisiones con preservación o Snap-back
  const handleNodeDragStop = (_event: any, node: Node) => {
    if (node.type !== 'product') return;

    const sourceWarehouse = String(node.data.sourceWarehouse);
    const { x, y } = node.position;
    
    // Bounds of Macororo: X from -600 to -100
    // Bounds of Central: X from 100 to 600
    let targetWarehouse = "";
    
    if (x >= 50 && x <= 650 && y >= -50 && y <= 850) {
      targetWarehouse = "central";
    } else if (x >= -650 && x <= -50 && y >= -50 && y <= 850) {
      targetWarehouse = "macororo";
    }

    if (targetWarehouse === sourceWarehouse) {
      // Movimiento válido organizativo dentro de su propio almacén (guarda la posición gráfica)
      return; 
    }

    // Movimiento Inválido o Transferencia Cruzada -> Snap back visual para proteger el nodo
    const safeX = sourceWarehouse === 'macororo' ? -350 : 350;
    setNodes((nds) => nds.map(n => {
      if (n.id === node.id) {
         return { ...n, position: { x: safeX, y: 350 } };
      }
      return n;
    }));

    if (targetWarehouse && targetWarehouse !== sourceWarehouse) {
      // Efectivamente intentó cruzar a otro almacén
      const product = node.data.product as Product;
      const currentSourceQty = getStockForWarehouse(product, sourceWarehouse);

      if (currentSourceQty > 0) {
        setTransferData({
          product, sourceWarehouse, targetWarehouse, maxQuantity: currentSourceQty,
        });
        setTransferQuantity(1);
        setIsModalOpen(true);
      }
    }
  };

  const executeTransfer = async () => {
    if (!transferData.product || transferQuantity <= 0 || transferQuantity > transferData.maxQuantity) return;

    setTransferring(true);
    try {
      const token = localStorage.getItem("token");
      const { product, sourceWarehouse, targetWarehouse } = transferData;
      const currentSourceQty = getStockForWarehouse(product, sourceWarehouse);
      const currentTargetQty = getStockForWarehouse(product, targetWarehouse);

      const newSourceQty = currentSourceQty - transferQuantity;
      const newTargetQty = currentTargetQty + transferQuantity;

      await fetch(`${API_URL}/api/products/${product.id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ warehouseName: sourceWarehouse, quantity: newSourceQty }),
      });

      await fetch(`${API_URL}/api/products/${product.id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ warehouseName: targetWarehouse, quantity: newTargetQty }),
      });

      // Update local state and trigger re-render
      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === product.id) {
          const newStock = [...(p.stock || [])];
          const sourceIndex = newStock.findIndex(s => s.warehouseName === sourceWarehouse);
          if (sourceIndex >= 0) newStock[sourceIndex].quantity = newSourceQty;
          else newStock.push({ warehouseName: sourceWarehouse, quantity: newSourceQty });

          const targetIndex = newStock.findIndex(s => s.warehouseName === targetWarehouse);
          if (targetIndex >= 0) newStock[targetIndex].quantity = newTargetQty;
          else newStock.push({ warehouseName: targetWarehouse, quantity: newTargetQty });

          return { ...p, stock: newStock };
        }
        return p;
      }));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error executing transfer:", error);
      alert("Hubo un error al realizar la transferencia.");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col bg-slate-50 text-slate-800 rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      
      {/* Header flotante encima del grafo */}
      <div className="absolute top-6 left-8 right-8 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-none">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            Gestión de Transferencias
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Organiza las cajas en el plano o arrástralas a otro almacén para transferir.
          </p>
        </div>
        
        <div className="relative group pointer-events-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar caja o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:w-80 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-30 bg-slate-50/80 backdrop-blur-sm flex justify-center items-center">
          <div className="relative">
            <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
            <div className="h-16 w-16 border-b-2 border-indigo-200 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* REACT FLOW CANVAS */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.1, minZoom: 0.2, maxZoom: 1.5 }}
        minZoom={0.1}
        maxZoom={1.5}
        className="w-full h-full"
      >
        <Background color="#cbd5e1" gap={40} size={1.5} />
        <Controls className="bg-white border-slate-200 shadow-md text-slate-600" showInteractive={false} />
      </ReactFlow>

      {/* Transfer Modal */}
      {isModalOpen && transferData.product && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
            
            <h3 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">
              Confirmar Transferencia
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Caja: {transferData.product.name} <span className="text-slate-500 font-normal">({transferData.product.code})</span>
              </p>
              <div className="flex items-center gap-3 text-sm mt-3">
                <span className="font-bold text-slate-600 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm capitalize">{transferData.sourceWarehouse}</span>
                <ArrowRightLeft size={16} className="text-slate-400" />
                <span className="font-bold text-slate-600 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm capitalize">{transferData.targetWarehouse}</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Cantidad a Transferir (Máx: {transferData.maxQuantity} {transferData.product.unit})
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                max={transferData.maxQuantity}
                value={transferQuantity}
                onChange={(e) => setTransferQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-lg p-3 outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                disabled={transferring}
              >
                Cancelar
              </button>
              <button
                onClick={executeTransfer}
                disabled={transferring || transferQuantity <= 0 || transferQuantity > transferData.maxQuantity}
                className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-md hover:bg-indigo-700 text-sm font-bold text-white transition-all disabled:opacity-50"
              >
                {transferring ? 'Procesando...' : 'Transferir Ahora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
