function MachineList({ machines }) {
  return (
    <table className="machine-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {machines.map((m) => (
          <tr key={m.id}>
            <td>{m.id}</td>
            <td>{m.name}</td>
            <td>{m.type}</td>
            <td>
  <span className={`status-badge status-${m.status}`}>{m.status}</span>
</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MachineList;