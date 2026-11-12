import { useState } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import { api } from '../api';
import { useLive } from '../hooks';
import { TYPES, TYPE_INFO } from '../helpers';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved'];
const STATUS_COLORS = ['#f59e0b', '#6366f1', '#14b8a6', '#22c55e'];

export default function AnalyticsPage({ t }) {
  const [stats, setStats] = useState(null);

  function loadData() {
    api.get('/stats').then(setStats).catch(() => {});
  }
  useLive(loadData);

  if (!stats) return <p className="muted">{t('loading')}</p>;

  const noLegend = { plugins: { legend: { display: false } }, maintainAspectRatio: false };
  const wholeNumbers = { y: { beginAtZero: true, ticks: { precision: 0 } } };

  return (
    <>
      <h2 className="fw-bold mb-4"><i className="bi bi-bar-chart-line-fill me-2" style={{ color: '#e63946' }} />{t('analyticsTitle')}</h2>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-collection-fill" label={t('total')} value={stats.total} color="#e63946" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-stopwatch-fill" label={t('avgResponse') + ' (' + t('minutes') + ')'} value={stats.avgResponseMinutes} color="#4f6df5" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-hourglass-bottom" label={t('avgResolution') + ' (' + t('minutes') + ')'} value={stats.avgResolutionMinutes} color="#f59e0b" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-people-fill" label={t('peopleHelped')} value={stats.peopleHelped} color="#22c55e" /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card-soft h-100">
            <div className="section-title">{t('byType')}</div>
            <div style={{ height: 280 }}>
              <Doughnut
                options={{ maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }}
                data={{ labels: TYPES.map((k) => t(k)), datasets: [{ data: stats.byType, backgroundColor: TYPES.map((k) => TYPE_INFO[k].color), borderWidth: 3, borderColor: '#fff' }] }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card-soft h-100">
            <div className="section-title">{t('byStatus')}</div>
            <div style={{ height: 280 }}>
              <Bar
                options={{ ...noLegend, scales: wholeNumbers }}
                data={{ labels: STATUSES.map((s) => t(s)), datasets: [{ data: stats.byStatus, backgroundColor: STATUS_COLORS, borderRadius: 10 }] }}
              />
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card-soft">
            <div className="section-title">{t('last24')}</div>
            <div style={{ height: 260 }}>
              <Line
                options={{ ...noLegend, scales: wholeNumbers }}
                data={{
                  labels: stats.perHour.map((h) => h.label),
                  datasets: [{ data: stats.perHour.map((h) => h.total), borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.12)', fill: true, tension: 0.4 }],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
