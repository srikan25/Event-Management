import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [organizerPassword, setOrganizerPassword] = useState("");
  const [confirmOrganizerPassword, setConfirmOrganizerPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!organizerPassword.trim()) {
      setError("Please create an organizer password.");
      return;
    }

    if (organizerPassword.length < 6) {
      setError("Organizer password must be at least 6 characters.");
      return;
    }

    if (organizerPassword !== confirmOrganizerPassword) {
      setError("Organizer passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.functions.invoke("register-user", {
      body: {
        name: name.trim(),
        email: email.trim(),
        password,
        organizerPassword,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data?.error) {
      setError(data.error);
      return;
    }

    navigate("/login", {
      state: {
        message:
          data?.message ||
          "Registration successful. Please verify your email before logging in.",
      },
    });
  };
  return (
    <main className="min-h-screen bg-orange-50 px-5 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-3xl shadow-md">
              🪔
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>

            <p className="mt-2 text-sm text-gray-500">
              Join the event management system.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

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
                placeholder="Create a password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* organizer password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Organizer Password
              </label>

              <input
                type="password"
                value={organizerPassword}
                onChange={(e) => setOrganizerPassword(e.target.value)}
                placeholder="Create organizer password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
              <small className="text-blue-800 pl-1.5">
                Used to unlock Add, Edit and Delete access.
              </small>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm Organizer Password
              </label>

              <input
                type="password"
                value={confirmOrganizerPassword}
                onChange={(e) => setConfirmOrganizerPassword(e.target.value)}
                placeholder="Confirm organizer password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-500 hover:text-orange-600"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
