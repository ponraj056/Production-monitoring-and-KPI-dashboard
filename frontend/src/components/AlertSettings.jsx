import { useState, useEffect } from 'react';
import { api } from '../api';
import { toast } from 'react-hot-toast';
import { Bell, Save } from 'lucide-react';

function AlertSettings() {
  const [threshold, setThreshold] = useState(10);
  const [emails, setEmails] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getAlertConfig();
        setThreshold(data.threshold_minutes || 10);
        setEmails(data.email_recipients || '');
        setWhatsapp(data.whatsapp_recipients || '');
      } catch (err) {
        toast.error('Failed to load alert configuration');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateAlertConfig({
        threshold_minutes: parseInt(threshold),
        email_recipients: emails,
        whatsapp_recipients: whatsapp
      });
      toast.success('Alert settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save alert settings');
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><Bell size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Alert Settings</h1>
      </div>
      
      <div className="login-card" style={{ maxWidth: '600px', margin: '0' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Configure automatic notifications for when machines experience extended downtime.
        </p>

        <form onSubmit={handleSave} className="machine-form">
          <div className="form-group">
            <label>Downtime Threshold (Minutes)</label>
            <input 
              type="number" 
              min="1"
              value={threshold} 
              onChange={e => setThreshold(e.target.value)} 
              required 
            />
            <small style={{ color: 'var(--text-muted)' }}>Alerts will trigger when a machine is DOWN for longer than this.</small>
          </div>

          <div className="form-group">
            <label>Email Recipients (comma separated)</label>
            <input 
              type="text" 
              placeholder="supervisor@manufacturing.local, manager@manufacturing.local"
              value={emails} 
              onChange={e => setEmails(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>WhatsApp Recipients (comma separated)</label>
            <input 
              type="text" 
              placeholder="+1234567890"
              value={whatsapp} 
              onChange={e => setWhatsapp(e.target.value)} 
            />
          </div>

          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}

export default AlertSettings;
