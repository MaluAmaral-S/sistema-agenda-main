import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import BusinessHours from "./BusinessHours";
import Servicos from "./Services";
import Planos from "./Plans";
import Appointments from "./Appointments";
import AccountManagement from "./AccountManagement";
import { apiRequest } from "../services/api";
import {
  Calendar,
  CalendarCheck,
  Scissors,
  DollarSign,
  Clock,
  Copy,
  LogOut,
  Crown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthBookings: 0,
    activeServices: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [publicLink, setPublicLink] = useState("");

  useEffect(() => {
    generatePublicLink();

    const fetchStats = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await apiRequest.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const generatePublicLink = () => {
    if (user?.businessName) {
      const businessSlug = user.businessName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setPublicLink(`${window.location.origin}/agendamento/${businessSlug}`);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    alert("Link copiado para a área de transferência!");
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                <CalendarCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AgendaPro</h1>
                <p className="text-white/80 text-sm">
                  Bem-vindo,{" "}
                  <span className="font-medium">
                    {user?.name || "Utilizador"}
                  </span>{" "}
                  -
                  <span className="font-medium">
                    {user?.businessName || "Empresa"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/planos")}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
              >
                <Crown className="w-4 h-4 mr-2" />
                Planos
              </button>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "servicos", label: "Serviços" },
              { id: "horarios", label: "Horários" },
              { id: "agendamentos", label: "Agendamentos" },
              { id: "conta", label: "Minha Conta" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        {activeTab === "dashboard" && (
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            {/* --- AQUI ESTÁ A GRELHA RESPONSIVA --- */}
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Agendamentos Hoje
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.todayBookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CalendarCheck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Este Mês
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.monthBookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Serviços Ativos
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeServices}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Receita Mensal
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {stats.monthlyRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sua Página de Agendamento
              </h3>
              <p className="text-gray-600 text-sm">
                Compartilhe este link com seus clientes para que possam agendar
                online.
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <Input type="text" readOnly value={publicLink} />
                <Button onClick={copyPublicLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "servicos" && <Servicos />}
        {activeTab === "horarios" && <BusinessHours />}
        {activeTab === "agendamentos" && <Appointments />}
        {activeTab === "conta" && <AccountManagement />}
      </main>
    </div>
  );
};

export default Dashboard;