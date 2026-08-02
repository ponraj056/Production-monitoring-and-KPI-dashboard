import { useState } from 'react';

function MachineForm({ onAddMachine }) {
  const [name, setName] = useState('');
  const [lineId, setLineId] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !lineId) return;

    const newMachine = {
      name,
      line_id: lineId,
      status,
    };

    onAddMachine(newMachine);
    setName('');
    setLineId('');
    setStatus('idle');
  };

  return (
    <form onSubmit={handleSubmit} className="machine-form">
      <input
        placeholder="Machine name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Line ID (e.g. Line-A)"
        value={lineId}
        onChange={(e) => setLineId(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="idle">Idle</option>
        <option value="running">Running</option>
        <option value="down">Down</option>
      </select>
      <button type="submit">Add Machine</button>
    </form>
  );
}

export default MachineForm;