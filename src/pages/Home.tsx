import { Link } from "react-router-dom";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">
        ¡Bienvenido, {user.name || "Usuario"}! 👋
      </h1>
      <p className="text-gray-500 text-lg">
        Estás dentro del sistema Ecodecor. ¿Qué deseas hacer hoy?
      </p>

      <div className="flex gap-4 mt-4">
        <Link
          to="/profile"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          Ver mi perfil
        </Link>
        <Link
          to="/users-list"
          className="rounded-md bg-gray-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 transition"
        >
          Ver usuarios
        </Link>
      </div>
    </div>
  );
}