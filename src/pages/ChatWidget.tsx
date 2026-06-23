import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const SUGGESTIONS = [
  "¿Cotizaciones pendientes?",
  "¿Stock bajo?",
  "¿Total facturado?",
  "Producto más cotizado",
];

interface Message {
  role: "user" | "model";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "¡Hola! Puedo consultarte datos del inventario, cotizaciones y KPIs. ¿En qué te ayudo?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/ai/chat-inventario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1),
        }),
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
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-7 right-7 w-13 h-13 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg z-50 transition-transform hover:scale-105"
        style={{ width: 52, height: 52 }}
        aria-label="Abrir asistente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/></svg>
      </button>

      {/* Panel lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] bg-white border-l border-gray-200 flex flex-col z-40 transition-transform duration-250 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2"/><path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M14 4l0 4l-6 0l0 -4"/></svg>
          </div>
          <div>
            <p className="text-sm font-medium">Asistente Ecodecor</p>
            <p className="text-xs text-gray-500">KPIs · inventario · cotizaciones</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-gray-400 hover:text-gray-700">✕</button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              m.role === "user"
                ? "self-end bg-green-100 text-green-900 rounded-br-sm"
                : "self-start bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200"
            }`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="self-start bg-gray-100 text-gray-400 text-xs px-3 py-2 rounded-2xl rounded-bl-sm italic border border-gray-200">
              Consultando...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Sugerencias */}
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex gap-1.5 flex-wrap">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40">
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
            placeholder="Pregunta algo..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-40">
            ↗
          </button>
        </div>
      </div>
    </>
  );
}