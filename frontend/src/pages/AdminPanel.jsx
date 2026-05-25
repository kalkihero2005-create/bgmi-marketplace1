import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, CurrencyInr, Users, Warning, CheckCircle, ArrowUUpLeft, MagnifyingGlass, Clock, CreditCard, Bank } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, users: 0, listings: 0, disputes: 0 });
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const s = await api.get("/admin/stats");
      const o = await api.get("/orders");
      const d = await api.get("/disputes");
      const p = await api.get("/payouts");
      setStats(s.data);
      setOrders(o.data);
      setDisputes(d.data);
      setPayouts(p.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOrderAction = async (order_id, action) => {
    await api.post("/admin/resolve", { order_id, action });
    toast.success(`Order ${action === 'refund' ? 'Refunded' : 'Released'}`);
    load();
  };

  const handleDisputeStatus = async (dispute_id, status) => {
    await api.put(`/disputes/${dispute_id}/status`, { status });
    toast.success("Dispute status updated!");
    load();
  };

  const handlePayoutStatus = async (payout_id, status) => {
    await api.put(`/payouts/${payout_id}/status`, { status });
    toast.success("Payout status updated!");
    load();
  };

  if (user?.role !== "admin") return <div className="p-20 text-center font-heading text-red-500">SYSTEM ACCESS DENIED</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-12">
        <h1 className="font-heading text-5xl font-black text-white uppercase tracking-tighter">ADMIN DASHBOARD</h1>
        <div className="relative w-64">
           <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
           <input className="bg-black border border-white/10 pl-10 pr-4 py-2 rounded-sm text-xs text-white outline-none w-full" placeholder="SEARCH..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12">
        <StatCard icon={CurrencyInr} label="REVENUE" value={stats.revenue} color="#CCFF00" />
        <StatCard icon={Users} label="TOTAL USERS" value={stats.users} color="#00F0FF" />
        <StatCard icon={ShieldCheck} label="ACTIVE ASSETS" value={stats.listings} color="#00FF66" />
        <StatCard icon={Warning} label="OPEN DISPUTES" value={stats.disputes} color="#FF3366" />
      </div>

      <div className="border-b border-white/10 flex gap-2 mb-8 overflow-x-auto no-scrollbar">
         <button onClick={()=>setActiveTab("orders")} className={`px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === "orders" ? "text-[#CCFF00] border-[#CCFF00] bg-[#CCFF00]/5" : "text-zinc-600 border-transparent hover:text-white"}`}>ORDERS</button>
         <button onClick={()=>setActiveTab("disputes")} className={`px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === "disputes" ? "text-[#CCFF00] border-[#CCFF00] bg-[#CCFF00]/5" : "text-zinc-600 border-transparent hover:text-white"}`}>DISPUTES</button>
         <button onClick={()=>setActiveTab("payouts")} className={`px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === "payouts" ? "text-[#CCFF00] border-[#CCFF00] bg-[#CCFF00]/5" : "text-zinc-600 border-transparent hover:text-white"}`}>PAYOUTS</button>
      </div>

      {activeTab === "orders" && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-left font-mono text-[10px]">
            <thead className="bg-white/5 text-zinc-500 uppercase">
              <tr>
                <th className="p-5">Order ID</th>
                <th className="p-5">Asset</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.filter(o => o.id.includes(search) || o.listing_title.toLowerCase().includes(search.toLowerCase())).map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="p-5 text-zinc-600">#{o.id.slice(0,8)}</td>
                  <td className="p-5 text-white font-bold">{o.listing_title}</td>
                  <td className="p-5 text-[#CCFF00]">{o.status}</td>
                  <td className="p-5 text-right">
                    {o.status === "DISPUTED" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>handleOrderAction(o.id, 'release')} className="bg-[#00FF66] text-black px-3 py-1 font-bold rounded-sm">PAY SELLER</button>
                        <button onClick={()=>handleOrderAction(o.id, 'refund')} className="bg-[#FF3366] text-white px-3 py-1 font-bold rounded-sm">REFUND BUYER</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "disputes" && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-left font-mono text-[10px]">
            <thead className="bg-white/5 text-zinc-500 uppercase">
              <tr>
                <th className="p-5">Dispute ID</th>
                <th className="p-5">Reason</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {disputes.filter(d => d.id.includes(search) || d.reason.toLowerCase().includes(search.toLowerCase())).map(d => (
                <tr key={d.id} className="hover:bg-white/[0.02]">
                  <td className="p-5 text-zinc-600">#{d.id.slice(0,8)}</td>
                  <td className="p-5 text-white font-bold">{d.reason}</td>
                  <td className="p-5 text-[#CCFF00]">{d.status}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>handleDisputeStatus(d.id, 'RESOLVED')} className="bg-[#00FF66] text-black px-3 py-1 font-bold rounded-sm">Resolve</button>
                      <button onClick={()=>handleDisputeStatus(d.id, 'CLOSED')} className="bg-zinc-600 text-white px-3 py-1 font-bold rounded-sm">Close</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "payouts" && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-left font-mono text-[10px]">
            <thead className="bg-white/5 text-zinc-500 uppercase">
              <tr>
                <th className="p-5">Payout ID</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Method</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.filter(p => p.id.includes(search)).map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="p-5 text-zinc-600">#{p.id.slice(0,8)}</td>
                  <td className="p-5 text-[#CCFF00] font-bold">₹{p.amount}</td>
                  <td className="p-5 text-white">{p.payout_method}</td>
                  <td className="p-5 text-[#CCFF00]">{p.status}</td>
                  <td className="p-5 text-right">
                    {p.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={()=>handlePayoutStatus(p.id, 'APPROVED')} className="bg-[#00FF66] text-black px-3 py-1 font-bold rounded-sm">Approve</button>
                        <button onClick={()=>handlePayoutStatus(p.id, 'REJECTED')} className="bg-[#FF3366] text-white px-3 py-1 font-bold rounded-sm">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm">
      <Icon size={24} style={{color}} weight="bold" />
      <div className="text-zinc-600 text-[9px] mt-4 uppercase tracking-widest">{label}</div>
      <div className="text-white font-heading text-2xl font-black mt-1">₹{Number(value).toFixed(2)}</div>
    </div>
  );
}