// frontend/src/components/VehicleTable/VehicleRow.tsx

type VehicleStatus = 'Available' | 'InUse' | 'Maintenance';
type Vehicle = {
  id: string;
  licensePlate: string;
  status: VehicleStatus;
  createdAt: string;
};

type Props = {
  v: Vehicle;
  onStatusChange: (id: string, status: VehicleStatus) => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
  formatDate: (iso?: string) => string;
};

export default function VehicleRow({ v, onStatusChange, onEdit, onDelete, formatDate }: Props) {
  return (
    <tr>
      <td className="mono">{v.id}</td>
      <td>{v.licensePlate}</td>
      <td>
        <div className={`badge status-${v.status.toLowerCase()}`}>{v.status}</div>
      </td>
      <td>{formatDate(v.createdAt)}</td>
      <td className="col-actions">
        <div className="actions">
          <select aria-label={`Change status for ${v.licensePlate}`} value={v.status} onChange={(e) => onStatusChange(v.id, e.target.value as VehicleStatus)} className="status-select">
            <option value="Available">Available</option>
            <option value="InUse">InUse</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button className="icon-btn" title="Edit vehicle" onClick={() => onEdit(v)}>
            ✎
          </button>
          <button className="icon-btn" title="Delete vehicle" onClick={() => onDelete(v)}>
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}
