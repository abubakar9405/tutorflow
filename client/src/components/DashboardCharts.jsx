import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const tip = { background: '#12162e', border: 'none', borderRadius: 10, color: '#e8ebff' };

export default function DashboardCharts({ stats }) {
  const a = stats.attendance;
  const attendanceData = [
    { name: 'Present', value: a.present, color: '#06b6d4' },
    { name: 'Late', value: a.late, color: '#a855f7' },
    { name: 'Absent', value: a.absent, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  const f = stats.fees;
  const feeData = [
    { name: 'Billed', amount: f.billed, color: '#6366f1' },
    { name: 'Collected', amount: f.collected, color: '#22c55e' },
    { name: 'Pending', amount: f.pending, color: '#f59e0b' },
  ];

  return (
    <div className="charts">
      <div className="chart-panel">
        <h3>Attendance this month</h3>
        {attendanceData.length === 0 ? (
          <p className="muted">No attendance marked yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {attendanceData.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={tip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-panel">
        <h3>Fees ({f.month})</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={feeData}>
            <XAxis dataKey="name" stroke="#9aa3c7" />
            <YAxis stroke="#9aa3c7" />
            <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {feeData.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
