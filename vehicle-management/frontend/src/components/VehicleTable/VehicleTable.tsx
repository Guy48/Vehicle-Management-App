// frontend/src/components/VehicleTable/VehicleTable.tsx
import React, { useEffect, useState, type JSX } from 'react';
import Toolbar from './Toolbar.tsx';
import VehicleRow from './VehicleRow.tsx';
import CreateModal from '../Modals/CreateModal.tsx';
import EditModal from '../Modals/EditModal.tsx';
import DeleteModal from '../Modals/DeleteModal.tsx';
import ErrorModal from '../Modals/ErrorModal.tsx';

type VehicleStatus = 'Available' | 'InUse' | 'Maintenance';
type Vehicle = {
  id: string;
  licensePlate: string;
  status: VehicleStatus;
  createdAt: string;
};

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

function formatDate(iso?: string) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type SortKey = 'createdAt' | 'id' | 'licensePlate' | 'status';
type SortDir = 'asc' | 'desc';

// client-side validators matching backend rules
const ID_REGEX = /^[A-Za-z0-9]{8}$/;
const LICENSE_REGEX = /^[A-Z0-9-]+$/;

export default function VehicleTable(): JSX.Element {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // create form
  const [newId, setNewId] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [saving, setSaving] = useState(false);

  // edit form
  const [editOriginalId, setEditOriginalId] = useState<string | null>(null);
  const [editId, setEditId] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editStatus, setEditStatus] = useState<VehicleStatus>('Available');

  // delete target
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetPlate, setDeleteTargetPlate] = useState<string | undefined>(undefined);
  const [processingDelete, setProcessingDelete] = useState(false);

  // ui
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | VehicleStatus>('All');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    void fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      if (!res.ok) throw await res.json();
      const data = (await res.json()) as Vehicle[];
      setVehicles(data);
    } catch (e: any) {
      setErrorBanner(e?.error ?? String(e) ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  // filtering + sorting (kept unchanged)
  const filtered = vehicles
    .filter((v) => (statusFilter === 'All' ? true : v.status === statusFilter))
    .filter((v) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return v.licensePlate.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
    });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'createdAt') {
      cmp = a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
    } else {
      const av = (a as any)[sortKey] ?? '';
      const bv = (b as any)[sortKey] ?? '';
      cmp = av.toString().localeCompare(bv.toString(), undefined, { numeric: true, sensitivity: 'base' });
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // show modal for illegal actions/errors
  function showIllegalError(msg: string) {
    setErrorModalMessage(String(msg));
    setShowErrorModal(true);
  }

  // CREATE (same logic)
  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    const idTrim = newId.trim();
    const plateTrim = newPlate.trim().toUpperCase();

    if (!ID_REGEX.test(idTrim)) {
      return showIllegalError('ID must be exactly 8 letters or digits (A-Z,0-9).');
    }
    if (!LICENSE_REGEX.test(plateTrim)) {
      return showIllegalError("License must use only CAPS letters, digits and '-' (e.g. ABC-123).");
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idTrim, licensePlate: plateTrim }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Create failed' }));
        return showIllegalError(err?.error ?? 'Create failed');
      }
      setNewId('');
      setNewPlate('');
      setShowCreate(false);
      await fetchList();
    } catch (err: any) {
      showIllegalError(err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  // OPEN EDIT
  function openEdit(v: Vehicle) {
    setEditOriginalId(v.id);
    setEditId(v.id);
    setEditPlate(v.licensePlate);
    setEditStatus(v.status);
    setShowEdit(true);
  }

  // SUBMIT EDIT
  async function handleEdit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!editOriginalId) return;
    const idTrim = editId.trim();
    const plateTrim = editPlate.trim().toUpperCase();

    if (!ID_REGEX.test(idTrim)) {
      return showIllegalError('ID must be exactly 8 letters or digits (A-Z,0-9).');
    }
    if (!LICENSE_REGEX.test(plateTrim)) {
      return showIllegalError("License must use only CAPS letters, digits and '-' (e.g. ABC-123).");
    }

    try {
      const res = await fetch(`${API_BASE}/vehicles/${encodeURIComponent(editOriginalId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: idTrim,
          licensePlate: plateTrim,
          status: editStatus,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Update failed' }));
        return showIllegalError(err?.error ?? 'Update failed');
      }
      await fetchList();
      setShowEdit(false);
    } catch (err: any) {
      showIllegalError(err?.message ?? String(err));
    }
  }

  // DELETE (open modal) - check availability first
  function openDelete(v: Vehicle) {
    if (v.status !== 'Available') {
      // immediate modal error: can't delete
      showIllegalError('Cannot delete vehicle while it is InUse or in Maintenance.');
      return;
    }
    setDeleteTargetId(v.id);
    setDeleteTargetPlate(v.licensePlate);
    setShowDelete(true);
  }

  // CONFIRM DELETE
  async function confirmDelete() {
    if (!deleteTargetId) return;
    setProcessingDelete(true);
    try {
      const res = await fetch(`${API_BASE}/vehicles/${encodeURIComponent(deleteTargetId)}`, {
        method: 'DELETE',
      });
      if (res.status === 204) {
        setShowDelete(false);
        setDeleteTargetId(null);
        setDeleteTargetPlate(undefined);
        await fetchList();
      } else {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }));
        showIllegalError(err?.error ?? 'Delete failed');
      }
    } catch (err: any) {
      showIllegalError(err?.message ?? String(err));
    } finally {
      setProcessingDelete(false);
    }
  }

  // STATUS change in table
  async function changeStatus(id: string, status: VehicleStatus) {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Status update failed' }));
        return showIllegalError(err?.error ?? 'Status update failed');
      }
      const updated = await res.json();
      setVehicles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      showIllegalError(err?.message ?? String(err));
    }
  }

  return (
    <section className="panel">
      <Toolbar
        query={query}
        setQuery={setQuery}
        vehiclesCount={vehicles.length}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortKey={sortKey}
        setSortKey={setSortKey}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onOpenCreate={() => setShowCreate(true)}
      />

      {loading ? (
        <div className="placeholder">Loading vehicles…</div>
      ) : errorBanner ? (
        <div className="error-banner" role="alert" onClick={() => setErrorBanner(null)}>
          {errorBanner} <span className="error-dismiss">· click to dismiss</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="placeholder">No vehicles found.</div>
      ) : (
        <div className="table-wrap">
          <table className="vehicle-table" role="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>License Plate</th>
                <th>Status</th>
                <th>Created</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => (
                <VehicleRow key={v.id} v={v} onStatusChange={changeStatus} onEdit={openEdit} onDelete={openDelete} formatDate={formatDate} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateModal newId={newId} setNewId={setNewId} newPlate={newPlate} setNewPlate={setNewPlate} saving={saving} onCancel={() => setShowCreate(false)} onSubmit={handleCreate} />}

      {showEdit && (
        <EditModal
          editId={editId}
          setEditId={setEditId}
          editPlate={editPlate}
          setEditPlate={setEditPlate}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          onCancel={() => setShowEdit(false)}
          onSubmit={handleEdit}
        />
      )}

      {showDelete && <DeleteModal plate={deleteTargetPlate} onCancel={() => setShowDelete(false)} onConfirm={confirmDelete} processing={processingDelete} />}

      {showErrorModal && <ErrorModal message={errorModalMessage} onClose={() => setShowErrorModal(false)} />}
    </section>
  );
}
