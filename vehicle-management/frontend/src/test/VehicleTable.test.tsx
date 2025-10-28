// frontend/src/test/VehicleTable.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VehicleTable from '../components/VehicleTable';

// helper
function makeVehicle(id: string, plate: string, status = 'Available', createdAt?: string) {
  return {
    id,
    licensePlate: plate,
    status,
    createdAt: createdAt ?? new Date().toISOString(),
  };
}

describe('VehicleTable — more advanced flows', () => {
  let vehiclesState: any[] = [];
  let fetchMock: any;

  beforeEach(() => {
    // Reset an initial state for each test
    vehiclesState = [
      makeVehicle('AAA00001', 'ONE-001', 'Available', '2025-01-01T09:00:00.000Z'),
      makeVehicle('BBB00002', 'TWO-002', 'InUse', '2025-02-01T09:00:00.000Z'),
    ];

    // stateful fetch mock that updates vehiclesState for POST/PATCH/DELETE
    fetchMock = vi.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.url;
      const method = (init && init.method) || 'GET';
      // GET /vehicles
      if (url?.endsWith('/vehicles') && method === 'GET') {
        return { ok: true, json: async () => vehiclesState.slice() };
      }

      // POST /vehicles
      if (url?.endsWith('/vehicles') && method === 'POST') {
        const body = JSON.parse(init.body);
        // simulate server validation (unique id/license)
        if (!/^[A-Za-z0-9]{8}$/.test(body.id)) {
          return { ok: false, status: 400, json: async () => ({ error: 'Invalid id format' }) };
        }
        const license = (body.licensePlate || '').toUpperCase();
        if (!/^[A-Z0-9-]+$/.test(license)) {
          return { ok: false, status: 400, json: async () => ({ error: 'Invalid license format' }) };
        }
        if (vehiclesState.some((v) => v.id === body.id)) {
          return { ok: false, status: 400, json: async () => ({ error: 'id must be unique' }) };
        }
        if (vehiclesState.some((v) => v.licensePlate === license)) {
          return { ok: false, status: 400, json: async () => ({ error: 'licensePlate must be unique' }) };
        }
        const created = { id: body.id, licensePlate: license, status: 'Available', createdAt: new Date().toISOString() };
        vehiclesState.push(created);
        return { ok: true, status: 201, json: async () => created };
      }

      // PATCH /vehicles/:id
      if (url?.match(/\/vehicles\/[^/]+$/) && method === 'PATCH') {
        const id = decodeURIComponent(url.split('/').pop());
        const idx = vehiclesState.findIndex((v) => v.id === id);
        if (idx === -1) return { ok: false, status: 404, json: async () => ({ error: 'Vehicle not found' }) };

        const body = JSON.parse(init.body);
        // id change
        if (body.id && body.id !== vehiclesState[idx].id) {
          if (!/^[A-Za-z0-9]{8}$/.test(body.id)) {
            return { ok: false, status: 400, json: async () => ({ error: 'Invalid id format' }) };
          }
          if (vehiclesState.some((v) => v.id === body.id && v.id !== vehiclesState[idx].id)) {
            return { ok: false, status: 400, json: async () => ({ error: 'id must be unique' }) };
          }
          vehiclesState[idx].id = body.id;
        }
        // license change
        if (body.licensePlate && body.licensePlate !== vehiclesState[idx].licensePlate) {
          const up = body.licensePlate.toUpperCase();
          if (!/^[A-Z0-9-]+$/.test(up)) {
            return { ok: false, status: 400, json: async () => ({ error: 'Invalid license format' }) };
          }
          if (vehiclesState.some((v) => v.licensePlate === up && v.id !== vehiclesState[idx].id)) {
            return { ok: false, status: 400, json: async () => ({ error: 'licensePlate must be unique' }) };
          }
          vehiclesState[idx].licensePlate = up;
        }
        // status change (enforce maintenance cap floor)
        if (body.status && body.status !== vehiclesState[idx].status) {
          if (vehiclesState[idx].status === 'Maintenance' && body.status !== 'Available') {
            return { ok: false, status: 400, json: async () => ({ error: 'Vehicles in Maintenance can only move to Available' }) };
          }
          if (body.status === 'Maintenance') {
            const total = vehiclesState.length;
            const currentMaintenance = vehiclesState.filter((v) => v.status === 'Maintenance').length;
            const allowed = Math.floor((total * 5) / 100); // 5% floor
            const adding = vehiclesState[idx].status === 'Maintenance' ? 0 : 1;
            if (currentMaintenance + adding > allowed) {
              return { ok: false, status: 400, json: async () => ({ error: `Maintenance quota reached: ${currentMaintenance} of ${total} ...` }) };
            }
          }
          vehiclesState[idx].status = body.status;
        }

        const updated = { ...vehiclesState[idx] };
        return { ok: true, status: 200, json: async () => updated };
      }

      // DELETE /vehicles/:id
      if (url?.match(/\/vehicles\/[^/]+$/) && method === 'DELETE') {
        const id = decodeURIComponent(url.split('/').pop());
        const idx = vehiclesState.findIndex((v) => v.id === id);
        if (idx === -1) return { ok: false, status: 404, json: async () => ({ error: 'Vehicle not found' }) };
        if (vehiclesState[idx].status === 'InUse' || vehiclesState[idx].status === 'Maintenance') {
          return { ok: false, status: 400, json: async () => ({ error: 'Cannot delete vehicle while InUse or Maintenance' }) };
        }
        vehiclesState.splice(idx, 1);
        return { ok: true, status: 204, text: async () => '' };
      }

      return { ok: false, status: 404, json: async () => ({ error: 'not found' }) };
    });

    vi.stubGlobal('fetch', fetchMock as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('create -> invalid id then valid create results in table update', async () => {
    render(<VehicleTable />);

    const addBtn = await screen.findByText('+ Add Vehicle');
    fireEvent.click(addBtn);

    const idInput = await screen.findByPlaceholderText(/8 chars, letters and digits/i);
    const plateInput = screen.getByPlaceholderText(/CAPS letters, digits, and '-' only/i);
    const createBtn = screen.getByRole('button', { name: /create/i });

    // invalid ID
    fireEvent.change(idInput, { target: { value: 'SHORT' } });
    fireEvent.change(plateInput, { target: { value: 'NEW-001' } });
    fireEvent.click(createBtn);

    await screen.findByText(/ID must be exactly 8 letters or digits/i);

    // close
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    // valid create
    fireEvent.change(idInput, { target: { value: 'DDD00004' } });
    fireEvent.change(plateInput, { target: { value: 'NEW-001' } });
    fireEvent.click(createBtn);

    // after create, table should include the new id and license
    const idCell = await screen.findByText('DDD00004');
    expect(idCell).toBeInTheDocument();
    expect(screen.getByText('NEW-001')).toBeInTheDocument();
  });

  it('edit flow: change id and license and reflect in table', async () => {
    render(<VehicleTable />);

    // initial rows loaded
    await screen.findByText('AAA00001');

    // click edit on first row (find by edit button near AAA00001)
    const editButtons = screen.getAllByTitle(/edit vehicle/i);
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);

    // edit modal appears
    const idInput = await screen.findByPlaceholderText(/8 chars, letters and digits/i);
    const plateInput = screen.getByPlaceholderText(/CAPS letters, digits, and '-' only/i);
    const saveBtn = screen.getByRole('button', { name: /save/i });

    // change id and license
    fireEvent.change(idInput, { target: { value: 'ZZZ99999' } });
    fireEvent.change(plateInput, { target: { value: 'CHG-111' } });
    fireEvent.click(saveBtn);

    // await table refresh and verify changes
    const updatedId = await screen.findByText('ZZZ99999');
    expect(updatedId).toBeInTheDocument();
    expect(screen.getByText('CHG-111')).toBeInTheDocument();
  });

  it('delete blocked when status not Available (frontend prevents DELETE call)', async () => {
    render(<VehicleTable />);
    await screen.findByText('AAA00001');
    // find delete button for the InUse vehicle (BBB00002)
    const rows = screen.getAllByRole('row');
    // Find row containing BBB00002 and click its delete button
    let targetDeleteBtn: HTMLElement | null = null;
    for (const row of rows) {
      if (row.textContent?.includes('BBB00002')) {
        targetDeleteBtn = row.querySelector('button[title="Delete vehicle"]') as HTMLElement;
        break;
      }
    }
    expect(targetDeleteBtn).not.toBeNull();
    const initialFetchCalls = (fetchMock as any).mock.calls.length;

    // Click delete -> frontend should show modal error immediately and NOT call DELETE
    fireEvent.click(targetDeleteBtn!);
    const err = await screen.findByText(/Cannot delete vehicle while it is InUse or in Maintenance/i);
    expect(err).toBeInTheDocument();

    // ensure no new fetch DELETE call was made (only initial GET)
    expect((fetchMock as any).mock.calls.length).toBe(initialFetchCalls);
  });

  it('delete succeeds when Available', async () => {
    render(<VehicleTable />);
    await screen.findByText('AAA00001');

    // find delete button for AAA00001 (Available)
    const rows = screen.getAllByRole('row');
    let deleteBtn: HTMLElement | null = null;
    for (const row of rows) {
      if (row.textContent?.includes('AAA00001')) {
        deleteBtn = row.querySelector('button[title="Delete vehicle"]') as HTMLElement;
        break;
      }
    }
    expect(deleteBtn).not.toBeNull();
    // click -> should open confirmation modal
    fireEvent.click(deleteBtn!);
    const confirmBtn = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(confirmBtn);

    // after delete, AAA00001 should disappear
    await waitFor(() => {
      expect(screen.queryByText('AAA00001')).not.toBeInTheDocument();
    });
  });

  it('maintenance cap enforced: with 5 vehicles, cannot set Maintenance (floor => allowed 0)', async () => {
    // set vehiclesState to 5 items
    vehiclesState = [
      makeVehicle('A0000001', 'V1-001', 'Available'),
      makeVehicle('A0000002', 'V2-002', 'Available'),
      makeVehicle('A0000003', 'V3-003', 'Available'),
      makeVehicle('A0000004', 'V4-004', 'Available'),
      makeVehicle('A0000005', 'V5-005', 'Available'),
    ];
    // re-stub fetch with the same fetchMock implementation referencing vehiclesState
    vi.stubGlobal('fetch', fetchMock as any);

    render(<VehicleTable />);
    // wait for one row
    await screen.findByText('A0000001');

    // try to set first vehicle to Maintenance using the status select in its row
    const rows = screen.getAllByRole('row');
    let statusSelect: HTMLSelectElement | null = null;
    for (const row of rows) {
      if (row.textContent?.includes('A0000001')) {
        statusSelect = row.querySelector('select[aria-label^="Change status"]') as HTMLSelectElement;
        break;
      }
    }
    expect(statusSelect).not.toBeNull();

    // change to Maintenance -> server should reject and frontend show modal error
    fireEvent.change(statusSelect!, { target: { value: 'Maintenance' } });

    const capErr = await screen.findByText(/Maintenance quota reached/i);
    expect(capErr).toBeInTheDocument();
  });

  it('sort by id toggles direction and affects order', async () => {
    // prepare three vehicles
    vehiclesState = [
      makeVehicle('00000003', 'C-003'),
      makeVehicle('00000001', 'A-001'),
      makeVehicle('00000002', 'B-002'),
    ];
    vi.stubGlobal('fetch', fetchMock as any);

    render(<VehicleTable />);
    await screen.findByText('00000001');

    // sort by id
    const sortBy = screen.getByLabelText(/sort by/i) as HTMLSelectElement;
    fireEvent.change(sortBy, { target: { value: 'id' } });

    // ensure descending -> click to toggle to ascending
    const sortDirBtn = screen.getByTitle(/toggle sort direction/i);
    fireEvent.click(sortDirBtn); // now asc

    // rows[1] should be 00000001 (first data row)
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(firstDataRow).toHaveTextContent('00000001');
  });
});
