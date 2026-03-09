// frontend/src/components/Modals/DeleteModal.tsx

type Props = {
  plate?: string | undefined;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  processing?: boolean;
};

export default function DeleteModal({ plate, onCancel, onConfirm, processing }: Props) {
  return (
    <div className="modal-backdrop" onClick={() => onCancel()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete vehicle</h3>
        <p>
          Are you sure you want to delete <strong>{plate ?? ''}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className="btn" onClick={() => onCancel()}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => void onConfirm()} disabled={processing}>
            {processing ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
