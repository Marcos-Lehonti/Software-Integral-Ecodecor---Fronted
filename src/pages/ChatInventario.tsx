import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const SUGGESTIONS = [
  "¿Cuántas cotizaciones hay pendientes?",
  "¿Qué productos tienen stock bajo?",
  "¿Cuánto se ha facturado en total?",
  "¿Cuál es el producto más cotizado?",
  "Resumen general del negocio",
];

interface Message {
  role: "user" | "model";
  content: string;
}

export default function ChatInventario() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "¡Hola! Soy tu asistente de inventario. Puedo consultarte datos de cotizaciones, stock, productos y más. ¿En qué te ayudo?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const history = messages.filter((m) => m.role !== "model" || messages.indexOf(m) > 0);

      const res = await fetch(`${API_URL}/api/ai/chat-inventario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", content: data.response || "Sin respuesta" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "model", content: "Error al conectar con el servidor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Asistente Ecodecor</h1>
        <p className="text-gray-500 text-sm mt-1">Consulta datos del inventario, cotizaciones y KPIs con IA</p>
      </div>

      <div className="border border-gray-300 rounded-xl flex flex-col h-[560px]">
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[78%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-blue-50 text-blue-900 rounded-br-sm"
                : "self-start bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200"
            }`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="self-start bg-gray-100 text-gray-400 text-sm px-4 py-2.5 rounded-xl rounded-bl-sm border border-gray-200 italic">
              Consultando datos...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Sugerencias */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex gap-2 flex-wrap">
          <span className="text-xs text-gray-400 self-center">Sugerencias:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 p-3 border-t border-gray-200">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            disabled={loading}
            placeholder="Escribe tu pregunta sobre el inventario..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}