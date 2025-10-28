// frontend/src/components/Modals/CreateModal.tsx
import React from 'react';

type Props = {
  newId: string;
  setNewId: (v: string) => void;
  newPlate: string;
  setNewPlate: (v: string) => void;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (e?: React.FormEvent) => Promise<void>;
};

export default function CreateModal({ newId, setNewId, newPlate, setNewPlate, saving, onCancel, onSubmit }: Props) {
  return (
    <div className="modal-backdrop" onClick={() => onCancel()}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => void onSubmit(e)}>
        <h3>Create Vehicle</h3>
        <label>ID (exactly 8 letters or digits)</label>
        <input autoFocus value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="8 chars, letters and digits" />
        <label>License plate</label>
        <input value={newPlate} onChange={(e) => setNewPlate(e.target.value.toUpperCase())} placeholder="CAPS letters, digits, and '-' only" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className="btn" type="button" onClick={() => onCancel()}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
