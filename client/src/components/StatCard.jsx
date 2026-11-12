export default function StatCard({ icon, label, value, color }) {
  return (
    <div className="card-soft stat-card hover-up fade-up">
      <div className="stat-icon" style={{ background: color + '1f', color }}>
        <i className={'bi ' + icon} />
      </div>
      <div>
        <div className="stat-number">{value ?? '-'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
