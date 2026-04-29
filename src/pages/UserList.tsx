import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧨 FUNCIÓN ELIMINAR (AGREGADO)
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Error al eliminar usuario");
      }

      // 🔄 actualizar lista sin recargar
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Error al obtener usuarios");
        }

        console.log("Respuesta del backend:", data);
        setUsers(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Usuarios del sistema</h1>

      {loading && <p className="text-indigo-400">Cargando usuarios...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 rounded-lg">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Rol</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Acciones</th> {/* 👈 agregado */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${user.role === "administrador" ? "bg-red-500 text-white"
                      : user.role === "asesor" ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* 🧨 BOTÓN ELIMINAR (AGREGADO) */}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                    >
                      Eliminar
                    </button>
                  </td>

                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-gray-400">
                    No hay usuarios registrados
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