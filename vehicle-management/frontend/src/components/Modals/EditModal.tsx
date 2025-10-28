// frontend/src/components/Modals/EditModal.tsx
import React from 'react';

type VehicleStatus = 'Available' | 'InUse' | 'Maintenance';

type Props = {
  editId: string;
  setEditId: (v: string) => void;
  editPlate: string;
  setEditPlate: (v: string) => void;
  editStatus: VehicleStatus;
  setEditStatus: (s: VehicleStatus) => void;
  onCancel: () => void;
  onSubmit: (e?: React.FormEvent) => Promise<void>;
};

export default function EditModal({ editId, setEditId, editPlate, setEditPlate, editStatus, setEditStatus, onCancel, onSubmit }: Props) {
  return (
    <div className="modal-backdrop" onClick={() => onCancel()}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => void onSubmit(e)}>
        <h3>Edit Vehicle</h3>
        <label>ID (exactly 8 letters or digits)</label>
        <input value={editId} onChange={(e) => setEditId(e.target.value)} placeholder="8 chars, letters and digits" />
        <label>License plate</label>
        <input value={editPlate} onChange={(e) => setEditPlate(e.target.value.toUpperCase())} placeholder="CAPS letters, digits, and '-' only" />
        <label>Status</label>
        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as VehicleStatus)}>
          <option value="Available">Available</option>
          <option value="InUse">InUse</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className="btn" type="button" onClick={() => onCancel()}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
