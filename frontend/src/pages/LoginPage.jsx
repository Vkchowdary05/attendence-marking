import React, { useState } from "react";
import { loginApi } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import {
  GraduationCap,
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap
} from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await loginApi(username, password);
      localStorage.setItem("ams_user", JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setError("");
    try {
      const data = await loginApi(user, pass);
      localStorage.setItem("ams_user", JSON.stringify(data));
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.error || "Quick login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 bg-black text-white rounded-xl items-center justify-center shadow-md border-2 border-black mb-1">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
            Student Attendance Management System
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Enterprise DevOps Architecture · 7-Period Engine
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-zinc-300 shadow-md bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-bold text-zinc-900">
              Sign In to Your Account
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Enter your credentials to access class records and transcripts
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-zinc-950 text-white rounded-md text-xs font-mono">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Username
                </label>
                <Input
                  type="text"
                  required
                  placeholder="admin or faculty"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-bold text-xs h-10 mt-2 bg-black hover:bg-zinc-800 text-white"
              >
                {loading ? "Authenticating Session..." : "Sign In to Portal"}
              </Button>
            </form>

            {/* Quick 1-Click Demo Login Shortcuts */}
            <div className="pt-3 border-t border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-zinc-800" /> One-Click Demo Credentials:
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin", "password123")}
                  className="p-2.5 rounded-md border border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 text-left cursor-pointer"
                >
                  <div className="font-bold text-xs text-zinc-950 flex items-center justify-between">
                    <span>Faculty / Admin</span>
                    <Badge variant="defaulter" className="text-[9px] px-1 py-0">ADMIN</Badge>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    admin / password123
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("student101", "password123")}
                  className="p-2.5 rounded-md border border-zinc-300 hover:border-black bg-zinc-50 hover:bg-zinc-100 text-left cursor-pointer"
                >
                  <div className="font-bold text-xs text-zinc-950 flex items-center justify-between">
                    <span>Student 1</span>
                    <span className="text-[9px] font-mono font-bold px-1 rounded bg-zinc-200 text-zinc-800">ROLL 101</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    student101 / password123
                  </div>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-zinc-50 border-t border-zinc-200 p-3 rounded-b-lg flex items-center justify-center text-[11px] text-zinc-500 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            <span>Encrypted Session Authentication · Spring Boot 3</span>
          </CardFooter>
        </Card>

        {/* Feature Badges footer */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-zinc-600">
          <div className="p-2 rounded border border-zinc-200 bg-white">
            <strong>7-Period</strong> Matrix
          </div>
          <div className="p-2 rounded border border-zinc-200 bg-white">
            <strong>154 Period</strong> Engine
          </div>
          <div className="p-2 rounded border border-zinc-200 bg-white">
            <strong>10/10 QA</strong> Selenium
          </div>
        </div>
      </div>
    </div>
  );
}
