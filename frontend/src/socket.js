import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://production-monitoring-and-kpi-dashboard-1.onrender.com';
const socket = io(SOCKET_URL);

export default socket;