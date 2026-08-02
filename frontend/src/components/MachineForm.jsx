import { useState } from 'react';

function MachineForm({ onAddMachine }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !type) return;

    const newMachine = {
      id: Date.now(),
      name,
      type,
      status: 'idle',
    };

    onAddMachine(newMachine);
    setName('');
    setType('');
  };

  return (
    <form onSubmit={handleSubmit} className="machine-form">
      <input
        placeholder="Machine name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Machine type"
        value={type}
        onChange={(e) => setType(e.target.value)}
      />
      <button type="submit">Add Machine</button>
    </form>
  );
}

export default MachineForm;