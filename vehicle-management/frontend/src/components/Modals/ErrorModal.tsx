// frontend/src/components/Modals/ErrorModal.tsx

type Props = {
  message: string;
  onClose: () => void;
};

export default function ErrorModal({ message, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={() => onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Action not allowed</h3>
        <p style={{ color: '#7b1111', marginTop: 8 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={() => onClose()}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
