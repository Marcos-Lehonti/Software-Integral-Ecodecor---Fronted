import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "supervisor", // 👈 agregado
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { // 👈 modificado
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg(null);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role, // 👈 agregado
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error en el registro");

      setMsg("Usuario registrado correctamente");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setMsg(err.message || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="./src/assets/icon-ecodecor.png"
          className="mx-auto h-30 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-100">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-100">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-100">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Role 👈 agregado */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-100">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="administrador">Administrador</option>
              <option value="asesor">Asesor</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          {/* Feedback */}
          {msg && (
            <div className="text-center text-sm text-green-400 mt-4">
              {msg}
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-sm text-gray-400">
          Already a member?{" "}
          <a href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}