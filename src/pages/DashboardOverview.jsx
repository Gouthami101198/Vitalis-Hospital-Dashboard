import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Users, Stethoscope, CalendarDays, BedDouble, TrendingUp, DollarSign } from "lucide-react";
import { cx, fmtCurrency } from "../utils/helpers.js";
import { DEPARTMENTS } from "../utils/constants.js";
import { useTheme } from "../context/ThemeContext.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { APPT_STATUS_MAP } from "../utils/constants.js";

const trendData = [
  { m: "Mar", admissions: 210, discharges: 190 }, { m: "Apr", admissions: 240, discharges: 220 },
  { m: "May", admissions: 260, discharges: 250 }, { m: "Jun", admissions: 300, discharges: 270 },
  { m: "Jul", admissions: 280, discharges: 290 }, { m: "Aug", admissions: 320, discharges: 300 },
];
const deptData = DEPARTMENTS.slice(0, 6).map((d, i) => ({ dept: d, patients: 30 + ((i * 37) % 90) }));

export default function DashboardOverview({ db, goTo }) {
  const t = useTheme();
  const occupied = db.beds.filter((b) => b.status === "Occupied").length;
  const revenue = db.invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + Number(i.amount), 0);
  const today = db.appointments.filter((a) => a.date === "2026-08-06");
  const pieData = ["Available", "Occupied", "Cleaning", "Maintenance"].map((s) => ({ name: s, value: db.beds.filter((b) => b.status === s).length }));
  const pieColors = { Available: "#10b981", Occupied: "#f43f5e", Cleaning: "#f59e0b", Maintenance: "#94a3b8" };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={cx("font-display font-semibold text-xl", t.text)}>Good morning, Dr.Gouthami C</h2>
        <p className={cx("font-body text-sm", t.textMuted)}> Monitor today's appointments, patient admissions, doctor availability, and hospital operations from one place.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={db.patients.length} delta="+4.2% this month" icon={Users} accent="teal" />
        <StatCard label="Doctors on Duty" value={db.doctors.filter((d) => d.availability !== "On Leave").length} delta={`${db.doctors.length} total staff`} icon={Stethoscope} accent="emerald" />
        <StatCard label="Today's Appointments" value={today.length || 6} delta="2 emergencies flagged" icon={CalendarDays} accent="amber" />
        <StatCard label="Beds Occupied" value={`${occupied}/${db.beds.length}`} delta={`${Math.round((occupied / db.beds.length) * 100)}% occupancy`} icon={BedDouble} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cx("lg:col-span-2 rounded-2xl border p-5", t.surface, t.border)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={cx("font-display font-semibold text-sm", t.text)}>Admissions vs Discharges</h3>
              <p className={cx("font-body text-xs", t.textMuted)}>Last 6 months</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-body text-emerald-600 bg-emerald-50 rounded-full px-2 py-1">
              <TrendingUp size={12} /> Trending up
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="adm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} /></linearGradient>
                <linearGradient id="dis" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.dark ? "#1e293b" : "#e2e8f0"} />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: t.dark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: t.dark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="admissions" stroke="#0d9488" fill="url(#adm)" strokeWidth={2} />
              <Area type="monotone" dataKey="discharges" stroke="#f59e0b" fill="url(#dis)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={cx("rounded-2xl border p-5", t.surface, t.border)}>
          <h3 className={cx("font-display font-semibold text-sm mb-1", t.text)}>Bed Occupancy</h3>
          <p className={cx("font-body text-xs mb-2", t.textMuted)}>Across all wards</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={pieColors[e.name]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {pieData.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs font-body">
                <span className="w-2 h-2 rounded-full" style={{ background: pieColors[e.name] }} />
                <span className={t.textMuted}>{e.name}</span>
                <span className={cx("ml-auto font-medium", t.text)}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cx("lg:col-span-2 rounded-2xl border p-5", t.surface, t.border)}>
          <h3 className={cx("font-display font-semibold text-sm mb-4", t.text)}>Patients by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.dark ? "#1e293b" : "#e2e8f0"} />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: t.dark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12, fill: t.dark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="patients" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={cx("rounded-2xl border p-5", t.surface, t.border)}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={cx("font-display font-semibold text-sm", t.text)}>Recent Appointments</h3>
            <button onClick={() => goTo("appointments")} className="text-xs font-body text-teal-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {db.appointments.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-display text-xs font-semibold">
                  {a.patientName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cx("font-body text-xs font-medium truncate", t.text)}>{a.patientName}</p>
                  <p className={cx("font-body text-[11px] truncate", t.textMuted)}>{a.doctorName} · {a.time}</p>
                </div>
                <StatusBadge value={a.status} map={APPT_STATUS_MAP} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className={cx("flex items-center gap-1.5 text-xs font-body pt-1", t.textSubtle)}>
        <DollarSign size={13} /> Total revenue collected to date: <span className={cx("font-medium font-data", t.text)}>{fmtCurrency(revenue)}</span>
      </p>
    </div>
  );
}
