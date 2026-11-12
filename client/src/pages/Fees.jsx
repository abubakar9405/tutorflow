import { useEffect, useState } from 'react';
import api from '../services/api';

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const paidOf = (inv) => inv.payments.reduce((s, p) => s + p.amount, 0);
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function Fees() {
  const [month, setMonth] = useState(currentMonth());
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({ billed: 0, collected: 0, pending: 0, invoices: 0 });
  const [pay, setPay] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [inv, sum] = await Promise.all([
        api.get('/fees', { params: { month } }),
        api.get('/fees/summary', { params: { month } }),
      ]);
      setInvoices(inv.data);
      setSummary(sum.data);
    } catch (err) {
      setError('Could not load fees');
    }
  };

  useEffect(() => {
    load();
  }, [month]);

  const generate = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/fees/generate', { month });
      setMessage(`Created ${res.data.created} invoice(s), skipped ${res.data.skipped}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate invoices');
    }
  };

  const setPayField = (id, field, value) =>
    setPay({ ...pay, [id]: { ...pay[id], [field]: value } });

  const recordPayment = async (inv) => {
    setError('');
    setMessage('');
    const p = pay[inv._id] || {};
    try {
      await api.post(`/fees/${inv._id}/payments`, { amount: Number(p.amount), method: p.method || 'cash' });
      setPay({ ...pay, [inv._id]: { amount: '', method: p.method || 'cash' } });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record payment');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/fees/${id}`);
      load();
    } catch (err) {
      setError('Could not delete invoice');
    }
  };

  const printInvoice = (inv) => {
    const paid = paidOf(inv);
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Invoice</title></head>
      <body style="font-family:sans-serif;padding:32px;max-width:520px">
        <h2>TutorFlow Invoice</h2>
        <p><b>Student:</b> ${esc(inv.student?.name)} (${esc(inv.student?.grade)})</p>
        <p><b>Month:</b> ${esc(inv.month)}</p>
        <p><b>Due date:</b> ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</p>
        <hr/>
        <p><b>Amount:</b> ${inv.amount}</p>
        <p><b>Paid:</b> ${paid}</p>
        <p><b>Balance:</b> ${inv.amount - paid}</p>
        <p><b>Status:</b> ${esc(inv.status)}</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Fees</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <label>
          Month: <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <button onClick={generate}>Generate invoices for this month</button>
      </div>

      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      {message && <p style={{ color: 'lightgreen' }}>{message}</p>}

      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        <div><strong>Billed:</strong> {summary.billed}</div>
        <div><strong>Collected:</strong> {summary.collected}</div>
        <div><strong>Pending:</strong> {summary.pending}</div>
        <div><strong>Invoices:</strong> {summary.invoices}</div>
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Student</th><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th><th>Record payment</th><th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && (
            <tr><td colSpan="7">No invoices for this month. Click Generate.</td></tr>
          )}
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.student?.name}</td>
              <td>{inv.month}</td>
              <td>{inv.amount}</td>
              <td>{paidOf(inv)}</td>
              <td>{inv.status}</td>
              <td>
                {inv.status !== 'paid' && (
                  <>
                    <input
                      type="number"
                      min="1"
                      placeholder="Amount"
                      style={{ width: 90 }}
                      value={pay[inv._id]?.amount || ''}
                      onChange={(e) => setPayField(inv._id, 'amount', e.target.value)}
                    />{' '}
                    <select
                      value={pay[inv._id]?.method || 'cash'}
                      onChange={(e) => setPayField(inv._id, 'method', e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="online">Online</option>
                    </select>{' '}
                    <button onClick={() => recordPayment(inv)}>Pay</button>
                  </>
                )}
              </td>
              <td>
                <button onClick={() => printInvoice(inv)}>Print</button>{' '}
                <button onClick={() => remove(inv._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
