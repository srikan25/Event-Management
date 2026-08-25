import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("user");
  const [organizerPassword, setOrganizerPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [message] = useState(location.state?.message || "");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (role === "organizer") {
        if (!organizerPassword.trim()) {
          await supabase.auth.signOut({
            scope: "local",
          });

          setError("Please enter the organizer password.");
          return;
        }

        const { data: isOrganizer, error: organizerError } = await supabase.rpc(
          "verify_organizer_password",
          {
            entered_password: organizerPassword,
          },
        );

        if (organizerError) {
          await supabase.auth.signOut({
            scope: "local",
          });

          throw organizerError;
        }

        if (!isOrganizer) {
          await supabase.auth.signOut({
            scope: "local",
          });

          setOrganizerPassword("");
          setError("Incorrect organizer password.");
          return;
        }
      }

      sessionStorage.setItem("app_role", role);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(error.message || "Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-orange-50 px-5 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl shadow-md">
              🪔
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Ganesh Event Manager
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Welcome back! Login to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {message && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/*___________Role__________ */}
            {/* Role */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <div className="flex items-center gap-8 rounded-lg border border-gray-300 px-4 py-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => {
                      setRole("user");
                      setOrganizerPassword("");
                    }}
                    className="h-4 w-4 accent-green-700"
                  />

                  <span className="text-sm text-gray-700">User</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="organizer"
                    checked={role === "organizer"}
                    onChange={() => setRole("organizer")}
                    className="h-4 w-4 accent-green-700"
                  />

                  <span className="text-sm text-gray-700">Organizer</span>
                </label>
              </div>
            </div>

            {/*_________organizer Password____________ */}
            {/* Organizer Password */}
            {role === "organizer" && (
              <div className="mt-4">
                <label
                  htmlFor="organizerPassword"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Organizer Password
                </label>

                <input
                  id="organizerPassword"
                  type="password"
                  value={organizerPassword}
                  onChange={(e) => setOrganizerPassword(e.target.value)}
                  placeholder="Enter organizer password"
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5
                 text-sm outline-none transition
                 focus:border-green-700 focus:ring-2
                 focus:ring-green-700/10"
                />
              </div>
            )}
            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
