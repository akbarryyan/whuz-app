"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import StatsCards from "@/components/admin/StatsCards";
import RevenueChart from "@/components/admin/RevenueChart";
import TransactionTable from "@/components/admin/TransactionTable";
import ProviderStatus from "@/components/admin/ProviderStatus";
import CustomerSupport from "@/components/admin/CustomerSupport";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (searchParams.get("login") === "success") {
      toast.success("Login berhasil! Selamat datang di dashboard admin.");
      // Clean up URL
      router.replace("/admin", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      label: "Order Hari Ini",
      value: "1.354",
      delta: "+16.5%",
      tone: "good" as const,
    },
    {
      label: "Transaksi Sukses",
      value: "40.523",
      delta: "+4.8%",
      tone: "good" as const,
    },
    {
      label: "Pendapatan",
      value: "Rp 284.9jt",
      delta: "+6.2%",
      tone: "good" as const,
    },
  ];

  const activity = [
    {
      id: "WP-240217-1A2",
      date: "17/02/2026",
      product: "PLN Token 100K",
      customer: "0812****890",
      status: "Sukses",
      amount: "Rp 102.500",
    },
    {
      id: "WP-240217-1B7",
      date: "17/02/2026",
      product: "Mobile Legends 344 DM",
      customer: "0856****123",
      status: "Proses",
      amount: "Rp 86.000",
    },
    {
      id: "WP-240217-1C9",
      date: "17/02/2026",
      product: "Telkomsel 50K",
      customer: "0821****456",
      status: "Pending",
      amount: "Rp 52.500",
    },
    {
      id: "WP-240217-1D1",
      date: "16/02/2026",
      product: "Free Fire 720 Diamonds",
      customer: "0878****789",
      status: "Gagal",
      amount: "Rp 96.800",
    },
  ];

  const revenue = [
    { label: "Jan", wallet: 36, gateway: 42 },
    { label: "Feb", wallet: 44, gateway: 38 },
    { label: "Mar", wallet: 58, gateway: 50 },
    { label: "Apr", wallet: 52, gateway: 55 },
    { label: "Mei", wallet: 60, gateway: 52 },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto flex w-full gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2.1fr_1fr]">
            <section className="flex flex-col gap-4 sm:gap-6">
              <StatsCards stats={stats} />
              <RevenueChart data={revenue} />
              <TransactionTable transactions={activity} />
            </section>

            <aside className="flex flex-col gap-4 sm:gap-6">
              <ProviderStatus />
              <CustomerSupport />
            </aside>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
