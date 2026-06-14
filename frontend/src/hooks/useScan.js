import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useSocket from './useSocket';

export default function useScan(scanId) {
  const [scan, setScan] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId) return;
    axios.get(`/api/scan/${scanId}`)
      .then(r => setScan(r.data))
      .catch(() => setScan(null))
      .finally(() => setLoading(false));
  }, [scanId]);

  const handleUpdate = useCallback(data => {
    if (data.message) {
      setMessages(prev => [...prev, data.message]);
    }
    if (data.finding) {
      setScan(prev => prev ? { ...prev, findings: [...prev.findings, data.finding] } : prev);
    }
    if (data.status || data.summary) {
      setScan(prev => prev
        ? { ...prev, status: data.status ?? prev.status, summary: data.summary ?? prev.summary }
        : prev
      );
    }
  }, []);

  useSocket(scanId, handleUpdate);

  return { scan, messages, loading };
}
