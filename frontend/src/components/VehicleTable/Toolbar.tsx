// frontend/src/components/VehicleTable/Toolbar.tsx
import type { Dispatch, SetStateAction } from 'react';

type SortKey = 'createdAt' | 'id' | 'licensePlate' | 'status';
type SortDir = 'asc' | 'desc';
type VehicleStatus = 'Available' | 'InUse' | 'Maintenance';

type Props = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  vehiclesCount: number;
  statusFilter: 'All' | VehicleStatus;
  setStatusFilter: Dispatch<SetStateAction<'All' | VehicleStatus>>;
  sortKey: SortKey;
  setSortKey: Dispatch<SetStateAction<SortKey>>;
  sortDir: SortDir;
  setSortDir: Dispatch<SetStateAction<SortDir>>;
  onOpenCreate: () => void;
};

export default function Toolbar({
  query,
  setQuery,
  vehiclesCount,
  statusFilter,
  setStatusFilter,
  sortKey,
  setSortKey,
  sortDir,
  setSortDir,
  onOpenCreate,
}: Props) {
  return (
    <div className="panel-toolbar" style={{ alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 12 }}>
        {/* LEFT group: search, total, controls (all left-aligned) */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* SEARCH */}
          <div className="search" style={{ order: 0 }}>
            <input placeholder="Search by id or license plate..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search vehicles" />
            <button className="icon-btn" onClick={() => setQuery('')} title="Clear">
              ✖
            </button>
          </div>

          {/* TOTAL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Total</div>
            <div className="total-number" aria-hidden="true">
              {vehiclesCount}
            </div>
          </div>

          {/* CONTROLS (filter / sort / sort-dir) */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="select-with-label">
              <label className="select-label">Filter by</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="status-select" aria-label="Filter by status">
                <option value="All">All statuses</option>
                <option value="Available">Available</option>
                <option value="InUse">InUse</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="select-with-label">
              <label className="select-label">Sort by</label>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="status-select" aria-label="Sort by">
                <option value="createdAt">Time added</option>
                <option value="id">ID</option>
                <option value="licensePlate">License plate</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="select-with-label">
              <label className="select-label">Sort direction</label>
              <button className="sort-dir-btn" title="Toggle sort direction" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
                {sortDir === 'asc' ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT group: Add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => onOpenCreate()}>
            + Add Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}
