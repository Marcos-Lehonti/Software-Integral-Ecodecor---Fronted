import { useState, useEffect } from "react";
import { format } from "date-fns";
// import { es } from "date-fns/locale";
import { 
  ArrowRightLeft, CheckCircle2, FileText, 
  PlusCircle, Network, ArrowLeft
} from "lucide-react";
import { 
  ReactFlow, Background, Controls, Handle, Position, 
  useNodesState, useEdgesState, ReactFlowProvider
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const API_URL = "https://software-integral-ecodecor-backend.onrender.com";

interface Movement {
  id: number;
  productId: number;
  warehouseName: string;
  type: "entrada" | "salida";
  quantity: string;
  reason: string;
  createdAt: string;
  product: { id: number; name: string; code: string; unit: string };
  user: { id: number; name: string };
}

interface QuotationItem {
  id: number;
  quantity: string;
  unitPrice: string;
  subtotal: string;
  product: { id: number; name: string; code: string; unit: string };
}

interface Project {
  id: number;
  quotationId: number;
  status: "en_ejecucion" | "finalizado";
  startDate: string;
  endDate: string | null;
  quotation: {
    quotationNumber: string;
    clientName: string;
    clientCompany: string;
    total: string;
    items?: QuotationItem[];
    advisor?: { id: number; name: string; email: string };
  };
  materialMovements?: Movement[];
}

interface ProductInfo {
  id: number;
  name: string;
  code: string;
  unit: string;
}

// ========================================================
// CUSTOM NODES
// ========================================================

const HubNode = () => (
  <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] flex flex-col items-center justify-center text-white relative">
    <Handle type="source" position={Position.Right} className="opacity-0" />
    <Handle type="source" position={Position.Left} className="opacity-0" />
    <Handle type="source" position={Position.Top} className="opacity-0" />
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <div className="absolute inset-[-10px] border border-indigo-400 rounded-full animate-ping opacity-20"></div>
    <Network className="w-8 h-8 text-indigo-400 mb-1" />
    <span className="text-[10px] font-bold tracking-widest uppercase">Ecodecor</span>
  </div>
);

const ProjectNode = ({ data }: any) => {
  const isCenter = data.isCenter;
  return (
    <div 
      onClick={() => data.onClick && data.onClick(data.project.id)}
      className={`relative rounded-full flex flex-col items-center justify-center transition-all bg-white border cursor-pointer shadow-sm
        ${isCenter ? 'w-40 h-40 border-indigo-400 scale-110 shadow-xl z-50' : 'w-28 h-28 border-slate-200 hover:border-indigo-400 hover:scale-105 hover:shadow-lg'}
      `}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      {isCenter && (
        <button 
          onClick={(e) => { e.stopPropagation(); data.onBack && data.onBack(); }}
          className="absolute -top-4 -left-4 bg-slate-800 text-white p-2 rounded-full shadow-md hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <span className={`font-semibold mb-1 ${isCenter ? 'text-indigo-600 text-sm' : 'text-slate-500 text-xs'}`}>
        {data.project.quotation.quotationNumber.replace('COT-', '#')}
      </span>
      <span className={`text-center px-3 leading-tight line-clamp-2 ${isCenter ? 'text-slate-800 font-bold text-sm' : 'text-slate-600 text-[10px]'}`}>
        {data.project.quotation.clientName}
      </span>
      <span className={`mt-2 text-[8px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${data.project.status === 'en_ejecucion' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {data.project.status === 'en_ejecucion' ? 'Activo' : 'Cerrado'}
      </span>
    </div>
  );
};

const CategoryNode = ({ data }: any) => (
  <div className="bg-white border-2 border-slate-200 px-6 py-3 rounded-3xl shadow-sm text-slate-700 font-semibold flex flex-col gap-2 min-w-[200px] items-center">
    <Handle type="target" position={Position.Left} className="!bg-slate-400" />
    <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    <div className="flex items-center gap-2">
      {data.icon === 'file' && <FileText className="w-4 h-4 text-indigo-500" />}
      {data.icon === 'activity' && <ArrowRightLeft className="w-4 h-4 text-amber-500" />}
      {data.icon === 'check' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      <span>{data.title}</span>
    </div>
    {data.details && (
      <div className="w-full mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-normal flex flex-col gap-1 text-left px-2">
        <p><span className="font-semibold text-slate-600">Asesor:</span> {data.details.advisor}</p>
        <p><span className="font-semibold text-slate-600">Empresa:</span> {data.details.company || "N/A"}</p>
        <p><span className="font-semibold text-slate-600">Inicio:</span> {data.details.startDate}</p>
        <p><span className="font-semibold text-slate-600">Cierre:</span> {data.details.endDate || "En curso"}</p>
      </div>
    )}
  </div>
);

const ItemNode = ({ data }: any) => (
  <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm min-w-[200px] flex justify-between items-center text-sm">
    <Handle type="target" position={Position.Left} className="!bg-indigo-300" />
    <span className="font-medium text-slate-700">{data.item.product.name} <span className="text-slate-400 text-xs ml-1">({data.item.product.code})</span></span>
    <span className="font-bold text-indigo-600 ml-4">{data.item.quantity} <span className="text-xs font-normal text-slate-500">{data.item.product.unit}</span></span>
  </div>
);

const MovementNode = ({ data }: any) => (
  <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm min-w-[250px] text-sm">
    <Handle type="target" position={Position.Left} className="!bg-amber-300" />
    <div className="flex justify-between items-start mb-1">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${data.movement.type === 'salida' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {data.movement.type === 'salida' ? 'Extracción' : 'Retorno'}
      </span>
      <span className="text-xs text-slate-400">{format(new Date(data.movement.createdAt), 'dd/MM HH:mm')}</span>
    </div>
    <div className="flex justify-between items-center mt-2">
      <span className="font-medium text-slate-700">{data.movement.product.name}</span>
      <span className={`font-bold ${data.movement.type === 'salida' ? 'text-red-500' : 'text-emerald-500'}`}>
        {data.movement.type === 'salida' ? '+' : '-'}{data.movement.quantity}
      </span>
    </div>
    <p className="text-[10px] text-slate-500 mt-1 capitalize truncate max-w-[200px]">{data.movement.warehouseName} - {data.movement.user.name}</p>
  </div>
);

const FormNode = ({ data }: any) => {
  const [movProductId, setMovProductId] = useState("");
  const [movWarehouse, setMovWarehouse] = useState("central");
  const [movType, setMovType] = useState("salida");
  const [movQuantity, setMovQuantity] = useState("");
  const [movReason, ] = useState("");

  return (
    <div className="bg-white border-2 border-amber-200 p-4 rounded-xl shadow-lg w-[300px]">
      <Handle type="target" position={Position.Left} className="!bg-amber-400" />
      <h4 className="font-bold text-amber-800 mb-3 text-sm flex items-center gap-2">
        <PlusCircle className="w-4 h-4" /> Ingresar Movimiento
      </h4>
      <div className="space-y-3">
        <div className="flex border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
          <button
            className={`flex-1 py-1 text-xs font-bold ${movType === 'salida' ? 'bg-red-50 text-red-600' : 'text-slate-500'}`}
            onClick={() => setMovType('salida')}
          >Solicitar</button>
          <div className="w-px bg-slate-200"></div>
          <button
            className={`flex-1 py-1 text-xs font-bold ${movType === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}
            onClick={() => setMovType('entrada')}
          >Devolver</button>
        </div>
        <select value={movProductId} onChange={(e) => setMovProductId(e.target.value)} className="w-full text-xs border-slate-200 rounded p-1.5 bg-slate-50">
          <option value="">Producto...</option>
          {data.products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-2">
          <select value={movWarehouse} onChange={(e) => setMovWarehouse(e.target.value)} className="flex-1 text-xs border-slate-200 rounded p-1.5 bg-slate-50">
            <option value="central">Central</option>
            <option value="macororo">Macororo</option>
          </select>
          <input type="number" step="0.1" placeholder="Cant." value={movQuantity} onChange={(e) => setMovQuantity(e.target.value)} className="w-16 text-xs border-slate-200 rounded p-1.5 bg-slate-50" />
        </div>
        <button 
          onClick={() => {
            data.onSubmit({ productId: movProductId, warehouseName: movWarehouse, type: movType, quantity: movQuantity, reason: movReason });
            setMovQuantity("");
          }}
          className="w-full bg-amber-500 text-white text-xs font-bold py-2 rounded mt-2 hover:bg-amber-600 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

const SummaryNode = ({ data }: any) => (
  <div className="bg-white border-2 border-emerald-200 p-4 rounded-xl shadow-lg w-[350px]">
    <Handle type="target" position={Position.Left} className="!bg-emerald-400" />
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Consumo Real Computado
      </h4>
      {data.projectDetails.status === 'en_ejecucion' && (
        <button onClick={data.onFinish} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors shadow-sm">
          FINALIZAR PROYECTO
        </button>
      )}
    </div>
    <div className="max-h-[200px] overflow-y-auto">
      <table className="w-full text-[10px] text-left">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            <th className="py-1 px-1 font-semibold text-slate-500">Recurso</th>
            <th className="py-1 px-1 font-semibold text-slate-500 text-right">Plan.</th>
            <th className="py-1 px-1 font-semibold text-red-500 text-right">+Ext</th>
            <th className="py-1 px-1 font-semibold text-emerald-500 text-right">-Dev</th>
            <th className="py-1 px-1 font-bold text-indigo-700 text-right">Real</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.consumption.map((c: any) => (
            <tr key={c.product.id}>
              <td className="py-1 px-1 font-medium text-slate-700 truncate max-w-[80px]">{c.product.name}</td>
              <td className="py-1 px-1 text-slate-500 text-right">{c.planned}</td>
              <td className="py-1 px-1 text-red-500 text-right">{c.added > 0 ? `+${c.added}` : '-'}</td>
              <td className="py-1 px-1 text-emerald-500 text-right">{c.returned > 0 ? `-${c.returned}` : '-'}</td>
              <td className="py-1 px-1 font-bold text-indigo-700 text-right bg-indigo-50/50">{c.totalReal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const nodeTypes = {
  hub: HubNode,
  project: ProjectNode,
  category: CategoryNode,
  item: ItemNode,
  movement: MovementNode,
  form: FormNode,
  summary: SummaryNode,
};

// ========================================================
// MAIN COMPONENT
// ========================================================

export default function ProjectsTimeline() {
  return (
    <ReactFlowProvider>
      <GraphLayout />
    </ReactFlowProvider>
  );
}

function GraphLayout() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [products, setProducts] = useState<ProductInfo[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    fetchProjects();
    fetchProducts();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setProjects(data.data);
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/products?limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.data);
    }
  };

  const fetchProjectDetails = async (id: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setProjectDetails(data);
    }
  };

  const handleAddMovement = async (formData: any) => {
    if (!formData.productId || !formData.warehouseName || !formData.quantity || !projectDetails) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/projects/${projectDetails.id}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      fetchProjectDetails(projectDetails.id); 
    } else {
      const errorData = await res.json();
      alert(`Error: ${errorData.message}`);
    }
  };

  const handleFinishProject = async () => {
    if (!projectDetails) return;
    if (!window.confirm("¿Confirmas que la obra ha concluido exitosamente y deseas finalizar el proyecto?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/projects/${projectDetails.id}/finish`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchProjectDetails(projectDetails.id); 
      fetchProjects(); 
    }
  };

  const calculateConsumption = (proj: Project) => {
    const consumptionMap = new Map<number, { product: ProductInfo, planned: number, added: number, returned: number, totalReal: number }>();
    proj.quotation.items?.forEach(item => {
      if (!consumptionMap.has(item.product.id)) {
        consumptionMap.set(item.product.id, { product: item.product, planned: 0, added: 0, returned: 0, totalReal: 0 });
      }
      const data = consumptionMap.get(item.product.id)!;
      data.planned += parseFloat(item.quantity);
      data.totalReal += parseFloat(item.quantity); 
    });
    proj.materialMovements?.forEach(mov => {
      if (!consumptionMap.has(mov.product.id)) {
        consumptionMap.set(mov.product.id, { product: mov.product, planned: 0, added: 0, returned: 0, totalReal: 0 });
      }
      const data = consumptionMap.get(mov.product.id)!;
      if (mov.type === "salida") {
        data.added += parseFloat(mov.quantity);
        data.totalReal += parseFloat(mov.quantity);
      } else {
        data.returned += parseFloat(mov.quantity);
        data.totalReal -= parseFloat(mov.quantity);
      }
    });
    return Array.from(consumptionMap.values());
  };

  // ==========================================
  // GENERACIÓN DEL GRAFO
  // ==========================================
  useEffect(() => {
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    const defaultEdgeOptions = { 
      type: 'smoothstep', 
      animated: true,
      style: { strokeWidth: 2, stroke: '#94a3b8' } 
    };

    if (!selectedProjectId) {
      // ESTADO INICIAL: Hub Central y Proyectos Orbitando
      newNodes.push({ id: 'hub', type: 'hub', position: { x: window.innerWidth/2 - 100, y: window.innerHeight/2 - 150 }, data: {} });
      
      const radius = 300;
      const centerX = window.innerWidth/2 - 100;
      const centerY = window.innerHeight/2 - 150;

      projects.forEach((p, i) => {
        const angle = (i / projects.length) * 2 * Math.PI;
        newNodes.push({
          id: `proj-${p.id}`,
          type: 'project',
          position: { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius },
          data: { project: p, onClick: (id: number) => { setSelectedProjectId(id); fetchProjectDetails(id); } }
        });
        newEdges.push({
          id: `edge-hub-${p.id}`,
          source: 'hub',
          target: `proj-${p.id}`,
          ...defaultEdgeOptions,
          style: { strokeWidth: 1, stroke: '#cbd5e1' }
        });
      });

    } else if (projectDetails) {
      // ESTADO PROYECTO SELECCIONADO: Árbol de Conocimiento
      const rootX = 100;
      const rootY = window.innerHeight/2 - 150;

      // Nodo Raíz
      newNodes.push({
        id: `proj-root`,
        type: 'project',
        position: { x: rootX, y: rootY },
        data: { project: projectDetails, isCenter: true, onBack: () => { setSelectedProjectId(null); setProjectDetails(null); } }
      });

      // 1. Rama Cotización
      newNodes.push({ 
        id: 'cat-cot', 
        type: 'category', 
        position: { x: rootX + 350, y: rootY - 250 }, 
        data: { 
          title: 'Planificación Base', 
          icon: 'file',
          details: {
            advisor: projectDetails.quotation.advisor?.name || 'Desconocido',
            company: projectDetails.quotation.clientCompany,
            startDate: format(new Date(projectDetails.startDate), 'dd/MM/yyyy HH:mm'),
            endDate: projectDetails.endDate ? format(new Date(projectDetails.endDate), 'dd/MM/yyyy HH:mm') : null
          }
        } 
      });
      newEdges.push({ id: 'edge-root-cot', source: 'proj-root', target: 'cat-cot', ...defaultEdgeOptions, style: { strokeWidth: 2, stroke: '#818cf8' } });
      
      projectDetails.quotation.items?.forEach((item, i) => {
        const itemId = `item-${item.id}`;
        newNodes.push({ id: itemId, type: 'item', position: { x: rootX + 650, y: rootY - 350 + (i * 70) }, data: { item } });
        newEdges.push({ id: `edge-cot-${item.id}`, source: 'cat-cot', target: itemId, ...defaultEdgeOptions, animated: false, style: { strokeWidth: 1.5, stroke: '#a5b4fc' } });
      });

      // 2. Rama Ejecución
      newNodes.push({ id: 'cat-exec', type: 'category', position: { x: rootX + 350, y: rootY }, data: { title: 'Ejecución y Movimientos', icon: 'activity' } });
      newEdges.push({ id: 'edge-root-exec', source: 'proj-root', target: 'cat-exec', ...defaultEdgeOptions, style: { strokeWidth: 2, stroke: '#fbbf24' } });
      
      let execOffsetY = rootY - 100;
      if (projectDetails.status === 'en_ejecucion') {
        newNodes.push({ id: 'form', type: 'form', position: { x: rootX + 650, y: execOffsetY }, data: { products, onSubmit: handleAddMovement } });
        newEdges.push({ id: 'edge-exec-form', source: 'cat-exec', target: 'form', ...defaultEdgeOptions, style: { strokeWidth: 1.5, stroke: '#fcd34d' } });
        execOffsetY += 260;
      }

      projectDetails.materialMovements?.forEach((mov, i) => {
        const movId = `mov-${mov.id}`;
        newNodes.push({ id: movId, type: 'movement', position: { x: rootX + 650, y: execOffsetY + (i * 100) }, data: { movement: mov } });
        newEdges.push({ id: `edge-exec-${mov.id}`, source: 'cat-exec', target: movId, ...defaultEdgeOptions, style: { strokeWidth: 1.5, stroke: '#fcd34d' } });
      });

      // 3. Rama Cierre
      newNodes.push({ id: 'cat-close', type: 'category', position: { x: rootX + 350, y: rootY + 250 }, data: { title: 'Cierre de Proyecto', icon: 'check' } });
      newEdges.push({ id: 'edge-root-close', source: 'proj-root', target: 'cat-close', ...defaultEdgeOptions, style: { strokeWidth: 2, stroke: '#34d399' } });
      
      newNodes.push({ 
        id: 'summary', 
        type: 'summary', 
        position: { x: rootX + 650, y: rootY + 200 }, 
        data: { projectDetails, onFinish: handleFinishProject, consumption: calculateConsumption(projectDetails) } 
      });
      newEdges.push({ id: 'edge-close-sum', source: 'cat-close', target: 'summary', ...defaultEdgeOptions, animated: false, style: { strokeWidth: 1.5, stroke: '#6ee7b7' } });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [projects, selectedProjectId, projectDetails, products]);

  return (
    <div className="w-full h-[calc(100vh-100px)] rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative bg-slate-50">
      
      <div className="absolute top-6 left-8 z-10">
        <h1 className="text-2xl font-light text-slate-800 flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-500" />
          Red de Conocimiento
        </h1>
        <p className="text-slate-500 text-xs mt-1">Navegación visual de proyectos estilo grafo interactivo.</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.5, minZoom: 0.5, maxZoom: 1.5 }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#cbd5e1" gap={24} size={1} />
        <Controls className="bg-white border-slate-200 shadow-sm" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}













// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import { es } from "date-fns/locale";
// import { Package, ArrowRightLeft, CheckCircle2, ChevronDown, ChevronRight, FileText, User, Calendar, PlusCircle, LogIn, LogOut } from "lucide-react";

// const API_URL = "https://software-integral-ecodecor-backend.onrender.com";

// interface Movement {
//   id: number;
//   productId: number;
//   warehouseName: string;
//   type: "entrada" | "salida";
//   quantity: string;
//   reason: string;
//   createdAt: string;
//   product: { id: number; name: string; code: string; unit: string };
//   user: { id: number; name: string };
// }

// interface QuotationItem {
//   id: number;
//   quantity: string;
//   unitPrice: string;
//   subtotal: string;
//   product: { id: number; name: string; code: string; unit: string };
// }

// interface Project {
//   id: number;
//   quotationId: number;
//   status: "en_ejecucion" | "finalizado";
//   startDate: string;
//   endDate: string | null;
//   quotation: {
//     quotationNumber: string;
//     clientName: string;
//     clientCompany: string;
//     total: string;
//     items?: QuotationItem[];
//     advisor?: { id: number; name: string; email: string };
//   };
//   materialMovements?: Movement[];
// }

// interface ProductInfo {
//   id: number;
//   name: string;
//   code: string;
//   unit: string;
// }

// export default function ProjectsTimeline() {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
//   const [projectDetails, setProjectDetails] = useState<Project | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState<ProductInfo[]>([]);

//   // Expanded states for nodes
//   const [expandedQuotation, setExpandedQuotation] = useState(true);
//   const [expandedExecution, setExpandedExecution] = useState(true);
//   const [expandedFinished, setExpandedFinished] = useState(true);

//   // New Movement Form State
//   const [movProductId, setMovProductId] = useState<number | "">("");
//   const [movWarehouse, setMovWarehouse] = useState<string>("central");
//   const [movType, setMovType] = useState<"entrada" | "salida">("salida");
//   const [movQuantity, setMovQuantity] = useState<number | "">("");
//   const [movReason, setMovReason] = useState("");
//   const [submittingMov, setSubmittingMov] = useState(false);
//   const [finishing, setFinishing] = useState(false);

//   useEffect(() => {
//     fetchProjects();
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     if (selectedProjectId) {
//       fetchProjectDetails(selectedProjectId as number);
//     } else {
//       setProjectDetails(null);
//     }
//   }, [selectedProjectId]);

//   const fetchProjects = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/projects`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setProjects(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching projects", error);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/products?limit=1000`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setProducts(data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching products", error);
//     }
//   };

//   const fetchProjectDetails = async (id: number) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/projects/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setProjectDetails(data);
//       }
//     } catch (error) {
//       console.error("Error fetching project details", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddMovement = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!movProductId || !movWarehouse || !movQuantity || !projectDetails) return;

//     setSubmittingMov(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/projects/${projectDetails.id}/movements`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           productId: movProductId,
//           warehouseName: movWarehouse,
//           type: movType,
//           quantity: movQuantity,
//           reason: movReason,
//         }),
//       });

//       if (res.ok) {
//         alert("Movimiento registrado con éxito");
//         setMovProductId("");
//         setMovQuantity("");
//         setMovReason("");
//         fetchProjectDetails(projectDetails.id); // Reload details
//       } else {
//         const errorData = await res.json();
//         alert(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error("Error adding movement", error);
//       alert("Hubo un error al registrar el movimiento.");
//     } finally {
//       setSubmittingMov(false);
//     }
//   };

//   const handleFinishProject = async () => {
//     if (!projectDetails) return;
//     if (!window.confirm("¿Estás seguro de que deseas finalizar este proyecto? Ya no se podrán agregar más movimientos.")) return;

//     setFinishing(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/projects/${projectDetails.id}/finish`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         alert("Proyecto finalizado con éxito");
//         fetchProjectDetails(projectDetails.id); // Reload details
//         fetchProjects(); // Reload project list
//       } else {
//         const errorData = await res.json();
//         alert(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       console.error("Error finishing project", error);
//       alert("Hubo un error al finalizar el proyecto.");
//     } finally {
//       setFinishing(false);
//     }
//   };

//   // Helper to calculate total consumption for the final node
//   const calculateConsumption = () => {
//     if (!projectDetails) return [];
    
//     // Map by productId
//     const consumptionMap = new Map<number, { product: ProductInfo, planned: number, added: number, returned: number, totalReal: number }>();

//     // 1. Add planned from Quotation
//     projectDetails.quotation.items?.forEach(item => {
//       if (!consumptionMap.has(item.product.id)) {
//         consumptionMap.set(item.product.id, {
//           product: item.product,
//           planned: 0,
//           added: 0,
//           returned: 0,
//           totalReal: 0
//         });
//       }
//       const data = consumptionMap.get(item.product.id)!;
//       data.planned += parseFloat(item.quantity);
//       data.totalReal += parseFloat(item.quantity); // Start with planned as base real
//     });

//     // 2. Add extra movements
//     projectDetails.materialMovements?.forEach(mov => {
//       if (!consumptionMap.has(mov.product.id)) {
//         consumptionMap.set(mov.product.id, {
//           product: mov.product,
//           planned: 0,
//           added: 0,
//           returned: 0,
//           totalReal: 0
//         });
//       }
//       const data = consumptionMap.get(mov.product.id)!;
//       if (mov.type === "salida") {
//         data.added += parseFloat(mov.quantity);
//         data.totalReal += parseFloat(mov.quantity); // Additional material consumed
//       } else if (mov.type === "entrada") {
//         data.returned += parseFloat(mov.quantity);
//         data.totalReal -= parseFloat(mov.quantity); // Returned material not consumed
//       }
//     });

//     return Array.from(consumptionMap.values());
//   };

//   return (
//     <div className="p-4 max-w-6xl mx-auto">
//       <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">Línea de Tiempo del Proyecto</h1>
//         <p className="text-gray-500 mb-6">Selecciona un proyecto en ejecución o finalizado para visualizar su ciclo de vida y gestionar materiales.</p>
        
//         <div className="max-w-md">
//           <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Proyecto</label>
//           <select
//             value={selectedProjectId}
//             onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : "")}
//             className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
//           >
//             <option value="">-- Selecciona un proyecto --</option>
//             {projects.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.quotation.quotationNumber} - {p.quotation.clientName} ({p.status === 'finalizado' ? 'Finalizado' : 'En Ejecución'})
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {loading && (
//         <div className="flex justify-center p-10">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
//         </div>
//       )}

//       {projectDetails && !loading && (
//         <div className="relative border-l-2 border-indigo-200 ml-4 pl-8 space-y-10 pb-10">

//           {/* ======================================= */}
//           {/* NODO 1: COTIZACIÓN APROBADA             */}
//           {/* ======================================= */}
//           <div className="relative">
//             <div className="absolute -left-[41px] top-1 bg-white border-2 border-indigo-500 rounded-full w-5 h-5 z-10 flex items-center justify-center">
//               <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
//             </div>
            
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//               <div 
//                 className="bg-indigo-50 px-6 py-4 cursor-pointer flex justify-between items-center"
//                 onClick={() => setExpandedQuotation(!expandedQuotation)}
//               >
//                 <div>
//                   <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
//                     <FileText className="w-5 h-5" /> 1. Cotización Aprobada
//                   </h3>
//                   <p className="text-sm text-indigo-700 mt-1">Origen de la planificación - {projectDetails.quotation.quotationNumber}</p>
//                 </div>
//                 {expandedQuotation ? <ChevronDown className="text-indigo-500" /> : <ChevronRight className="text-indigo-500" />}
//               </div>

//               {expandedQuotation && (
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <User className="w-4 h-4 text-gray-400" /> 
//                         <span className="font-semibold">Cliente:</span> {projectDetails.quotation.clientName}
//                       </div>
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <Calendar className="w-4 h-4 text-gray-400" /> 
//                         <span className="font-semibold">Fecha de Inicio:</span> {format(new Date(projectDetails.startDate), 'dd MMM yyyy, HH:mm', { locale: es })}
//                       </div>
//                     </div>
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <User className="w-4 h-4 text-gray-400" /> 
//                         <span className="font-semibold">Asesor:</span> {projectDetails.quotation.advisor?.name}
//                       </div>
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <span className="font-semibold">Total Cotizado:</span> <span className="text-green-600 font-bold">${projectDetails.quotation.total}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <h4 className="font-semibold text-gray-800 mb-3">Materiales Planificados Originalmente:</h4>
//                   <div className="overflow-x-auto rounded-lg border border-gray-200">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
//                           <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {projectDetails.quotation.items?.map((item) => (
//                           <tr key={item.id}>
//                             <td className="px-4 py-3 text-sm text-gray-900">{item.product.name} ({item.product.code})</td>
//                             <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.quantity} {item.product.unit}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ======================================= */}
//           {/* NODO 2: EN EJECUCIÓN                    */}
//           {/* ======================================= */}
//           <div className="relative">
//             <div className={`absolute -left-[41px] top-1 bg-white border-2 rounded-full w-5 h-5 z-10 flex items-center justify-center ${projectDetails.status === 'en_ejecucion' ? 'border-amber-500' : 'border-indigo-500'}`}>
//               <div className={`w-2.5 h-2.5 rounded-full ${projectDetails.status === 'en_ejecucion' ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'}`}></div>
//             </div>
            
//             <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${projectDetails.status === 'en_ejecucion' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'}`}>
//               <div 
//                 className={`px-6 py-4 cursor-pointer flex justify-between items-center ${projectDetails.status === 'en_ejecucion' ? 'bg-amber-50' : 'bg-gray-50'}`}
//                 onClick={() => setExpandedExecution(!expandedExecution)}
//               >
//                 <div>
//                   <h3 className={`text-lg font-bold flex items-center gap-2 ${projectDetails.status === 'en_ejecucion' ? 'text-amber-900' : 'text-gray-800'}`}>
//                     <ArrowRightLeft className="w-5 h-5" /> 2. Ejecución del Proyecto
//                   </h3>
//                   <p className={`text-sm mt-1 ${projectDetails.status === 'en_ejecucion' ? 'text-amber-700' : 'text-gray-600'}`}>
//                     Movimientos adicionales de materiales (Entradas y Salidas)
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <span className={`px-3 py-1 rounded-full text-xs font-semibold ${projectDetails.status === 'en_ejecucion' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>
//                     {projectDetails.status === 'en_ejecucion' ? 'ACTIVO' : 'CERRADO'}
//                   </span>
//                   {expandedExecution ? <ChevronDown className={projectDetails.status === 'en_ejecucion' ? "text-amber-500" : "text-gray-400"} /> : <ChevronRight className={projectDetails.status === 'en_ejecucion' ? "text-amber-500" : "text-gray-400"} />}
//                 </div>
//               </div>

//               {expandedExecution && (
//                 <div className="p-6">
                  
//                   {/* FORMULARIO DE MOVIMIENTO (SOLO SI ESTÁ EN EJECUCIÓN) */}
//                   {projectDetails.status === 'en_ejecucion' && (
//                     <div className="mb-8 bg-gray-50 p-5 rounded-lg border border-gray-200">
//                       <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                         <PlusCircle className="w-4 h-4 text-indigo-600" /> Registrar Nuevo Movimiento de Material
//                       </h4>
//                       <form onSubmit={handleAddMovement} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
//                         <div className="lg:col-span-2">
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
//                           <div className="flex border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
//                             <button
//                               type="button"
//                               className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1 ${movType === 'salida' ? 'bg-red-50 text-red-700 border-b-2 border-red-500' : 'text-gray-500 hover:bg-gray-50'}`}
//                               onClick={() => setMovType('salida')}
//                             >
//                               <LogOut className="w-3 h-3" /> Solicitar (Salida)
//                             </button>
//                             <div className="w-px bg-gray-200"></div>
//                             <button
//                               type="button"
//                               className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1 ${movType === 'entrada' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'text-gray-500 hover:bg-gray-50'}`}
//                               onClick={() => setMovType('entrada')}
//                             >
//                               <LogIn className="w-3 h-3" /> Devolver (Entrada)
//                             </button>
//                           </div>
//                         </div>

//                         <div className="lg:col-span-2">
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
//                           <select required value={movProductId} onChange={(e) => setMovProductId(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
//                             <option value="">Seleccione...</option>
//                             {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Almacén</label>
//                           <select required value={movWarehouse} onChange={(e) => setMovWarehouse(e.target.value)} className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500">
//                             <option value="central">Central</option>
//                             <option value="macororo">Macororo</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
//                           <input type="number" step="0.1" min="0.1" required value={movQuantity} onChange={(e) => setMovQuantity(e.target.value ? Number(e.target.value) : "")} className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" />
//                         </div>

//                         <div className="lg:col-span-4">
//                           <label className="block text-xs font-medium text-gray-700 mb-1">Motivo / Observación</label>
//                           <input type="text" value={movReason} onChange={(e) => setMovReason(e.target.value)} placeholder="Ej: Material faltante para pared norte" className="w-full text-sm border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500" />
//                         </div>

//                         <div className="lg:col-span-2">
//                           <button type="submit" disabled={submittingMov} className="w-full bg-indigo-600 text-white font-medium text-sm py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
//                             {submittingMov ? 'Registrando...' : 'Registrar Movimiento'}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   )}

//                   {/* HISTORIAL DE MOVIMIENTOS */}
//                   <h4 className="font-semibold text-gray-800 mb-3">Historial de Movimientos Adicionales:</h4>
//                   {projectDetails.materialMovements?.length === 0 ? (
//                     <p className="text-sm text-gray-500 italic">No se han registrado movimientos adicionales.</p>
//                   ) : (
//                     <div className="overflow-x-auto rounded-lg border border-gray-200">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Almacén</th>
//                             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cant.</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resp.</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {projectDetails.materialMovements?.map((mov) => (
//                             <tr key={mov.id} className="hover:bg-gray-50">
//                               <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{format(new Date(mov.createdAt), 'dd/MM/yyyy HH:mm')}</td>
//                               <td className="px-4 py-3 text-xs">
//                                 <span className={`px-2 py-1 rounded-full font-medium ${mov.type === 'salida' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
//                                   {mov.type === 'salida' ? 'SOLICITUD EXTRA' : 'DEVOLUCIÓN'}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-3 text-sm text-gray-900 font-medium">{mov.product.name}</td>
//                               <td className="px-4 py-3 text-xs text-gray-500 capitalize">{mov.warehouseName}</td>
//                               <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">{mov.quantity} {mov.product.unit}</td>
//                               <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{mov.reason || '-'}</td>
//                               <td className="px-4 py-3 text-xs text-gray-500">{mov.user.name}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ======================================= */}
//           {/* NODO 3: FINALIZADO                      */}
//           {/* ======================================= */}
//           <div className="relative">
//             <div className={`absolute -left-[41px] top-1 bg-white border-2 rounded-full w-5 h-5 z-10 flex items-center justify-center ${projectDetails.status === 'finalizado' ? 'border-emerald-500' : 'border-gray-300'}`}>
//               <div className={`w-2.5 h-2.5 rounded-full ${projectDetails.status === 'finalizado' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
//             </div>
            
//             <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${projectDetails.status === 'finalizado' ? 'border-emerald-200' : 'border-gray-200'}`}>
//               <div 
//                 className={`px-6 py-4 cursor-pointer flex justify-between items-center ${projectDetails.status === 'finalizado' ? 'bg-emerald-50' : 'bg-gray-50'}`}
//                 onClick={() => setExpandedFinished(!expandedFinished)}
//               >
//                 <div>
//                   <h3 className={`text-lg font-bold flex items-center gap-2 ${projectDetails.status === 'finalizado' ? 'text-emerald-900' : 'text-gray-800'}`}>
//                     <CheckCircle2 className="w-5 h-5" /> 3. Proyecto Finalizado
//                   </h3>
//                   <p className={`text-sm mt-1 ${projectDetails.status === 'finalizado' ? 'text-emerald-700' : 'text-gray-600'}`}>
//                     Resumen general y consumo real vs planificado
//                   </p>
//                 </div>
//                 {expandedFinished ? <ChevronDown className={projectDetails.status === 'finalizado' ? "text-emerald-500" : "text-gray-400"} /> : <ChevronRight className={projectDetails.status === 'finalizado' ? "text-emerald-500" : "text-gray-400"} />}
//               </div>

//               {expandedFinished && (
//                 <div className="p-6">
//                   {projectDetails.status === 'en_ejecucion' ? (
//                     <div className="text-center py-6">
//                       <p className="text-gray-500 mb-4">El proyecto se encuentra en ejecución. Finalízalo cuando ya no se requieran más movimientos de materiales.</p>
//                       <button 
//                         onClick={handleFinishProject}
//                         disabled={finishing}
//                         className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
//                       >
//                         {finishing ? 'Procesando...' : 'FINALIZAR PROYECTO AHORA'}
//                       </button>
//                     </div>
//                   ) : (
//                     <div>
//                       <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg mb-6 flex items-center gap-3 border border-emerald-100">
//                         <CheckCircle2 className="w-6 h-6" />
//                         <div>
//                           <p className="font-bold">Proyecto concluido exitosamente</p>
//                           <p className="text-sm text-emerald-700">Fecha de cierre: {projectDetails.endDate ? format(new Date(projectDetails.endDate), 'dd MMM yyyy, HH:mm', {locale: es}) : 'N/A'}</p>
//                         </div>
//                       </div>

//                       <h4 className="font-semibold text-gray-800 mb-3">Resumen de Consumo Real:</h4>
//                       <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//                         <table className="min-w-full divide-y divide-gray-200">
//                           <thead className="bg-gray-800">
//                             <tr>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-200 uppercase">Producto</th>
//                               <th className="px-4 py-3 text-right text-xs font-medium text-gray-200 uppercase">Planificado</th>
//                               <th className="px-4 py-3 text-right text-xs font-medium text-amber-300 uppercase">+ Solicitado</th>
//                               <th className="px-4 py-3 text-right text-xs font-medium text-emerald-300 uppercase">- Devuelto</th>
//                               <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase bg-indigo-900/50">Consumo Final Real</th>
//                             </tr>
//                           </thead>
//                           <tbody className="bg-white divide-y divide-gray-200">
//                             {calculateConsumption().map((c) => (
//                               <tr key={c.product.id} className="hover:bg-gray-50">
//                                 <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.product.name} <span className="text-gray-400 text-xs font-normal ml-1">({c.product.code})</span></td>
//                                 <td className="px-4 py-3 text-sm text-right text-gray-600">{c.planned}</td>
//                                 <td className="px-4 py-3 text-sm text-right text-amber-600 font-medium">{c.added > 0 ? `+${c.added}` : '-'}</td>
//                                 <td className="px-4 py-3 text-sm text-right text-emerald-600 font-medium">{c.returned > 0 ? `-${c.returned}` : '-'}</td>
//                                 <td className="px-4 py-3 text-sm text-right font-black text-indigo-700 bg-indigo-50/30">
//                                   {c.totalReal} <span className="text-xs font-normal text-gray-500">{c.product.unit}</span>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>
//       )}
//     </div>
//   );
// }
