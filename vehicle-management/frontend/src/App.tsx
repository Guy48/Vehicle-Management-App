// src/App.tsx
import VehicleTable from './components/VehicleTable'
import './styles.css'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">🚘</div>
          <div className="brand-text">
            <h1 className="brand-title">Vehicle Management</h1>
            <div className="brand-sub">Manage fleet status, add vehicles, and keep things moving</div>
          </div>
        </div>
      </header>

      <main className="container">
        <VehicleTable />
      </main>

      <footer className="app-footer">
        <small>© {new Date().getFullYear()} Vehicle Management by Guy Ashury • Simple demo UI</small>
      </footer>
    </div>
  )
}
