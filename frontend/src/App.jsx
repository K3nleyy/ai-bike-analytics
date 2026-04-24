import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { 
  Users, 
  Map, 
  Sun, 
  CloudSun, 
  CloudRain,
  Activity,
  BarChart2,
  Database,
  CloudLightning,
  Settings
} from 'lucide-react'
import './index.css'

// Vibrant neon colors matching index.css vars for recharts
const COLORS = ['#ff0a54', '#00f0ff', '#00ff88', '#ffaa00']
const CLUSTER_NAMES = [
  'Casual Weekend Riders',
  'Weekday Commuters',
  'Core Subscribers',
  'Tourists & Explorers'
]

function App() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [activeCluster, setActiveCluster] = useState('all')

  useEffect(() => {
    // Determine the API URL depending on the environment (local vs production)
    const apiURL = window.location.origin.includes('localhost') 
      ? 'http://localhost:8000/api/segments/' 
      : '/api/segments/';

    axios.get(apiURL)
      .then((res) => {
        setData(res.data)
        setFilteredData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching data:", err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (activeCluster === 'all') {
      setFilteredData(data)
    } else {
      setFilteredData(data.filter(item => item.cluster === parseInt(activeCluster)))
    }
  }, [activeCluster, data])

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const apiURL = window.location.origin.includes('localhost') 
      ? 'http://localhost:8000/api/upload/' 
      : '/api/upload/';

    axios.post(apiURL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setData(res.data);
      setFilteredData(res.data);
      setActiveCluster('all');
      setIsUploading(false);
    })
    .catch(err => {
      console.error("Upload failed", err);
      alert("Failed to process the dataset.");
      setIsUploading(false);
    });
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <motion.h2 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ repeat: Infinity, duration: 1.5, direction: 'alternate' }}
        >
          Loading Intel Insights...
        </motion.h2>
      </div>
    )
  }

  // Calculate some stats
  const totalRiders = filteredData.reduce((acc, curr) => acc + curr.cnt, 0)
  const avgTemp = filteredData.length ? (filteredData.reduce((acc, curr) => acc + curr.temp, 0) / filteredData.length * 41).toFixed(1) : 0

  // Calculate Hourly Bar Chart Data
  const hourlyStats = Array.from({ length: 24 }).map((_, hour) => ({
    hour: `${hour}:00`,
    avgRentals: 0,
    count: 0
  }))
  
  filteredData.forEach(row => {
    hourlyStats[row.hr].avgRentals += row.cnt;
    hourlyStats[row.hr].count += 1;
  });

  const hourlyChartData = hourlyStats.map(stat => ({
    hour: stat.hour,
    avgRentals: stat.count > 0 ? Math.round(stat.avgRentals / stat.count) : 0
  }));

  return (
    <div className="dashboard-layout">
      {/* Immersive Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      {/* Modern Sidebar */}
      <motion.aside 
        className="sidebar"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
      >
        <div className="brand-logo">
          <CloudLightning color="#06b6d4" size={28} />
          <span>Bikelytics.</span><span style={{ color: '#06b6d4' }}>AI</span>
        </div>
        
        <nav className="nav-menu">
          <a href="#" className="nav-item active"><BarChart2 size={20} /> Dashboard</a>
          
          {/* File Upload Button */}
          <div style={{ marginTop: '2.5rem', padding: '0 1rem' }}>
            <label className="filter-btn" style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              {isUploading ? 'Analyzing Data...' : 'Import Dataset (.csv)'}
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
            </label>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.4' }}>
              Upload external spreadsheets to uncover hidden customer patterns.
            </p>
          </div>
        </nav>

        <div className="filters-section glass-card" style={{marginTop: 'auto'}}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Activity size={18} color="#8b5cf6" /> Segmentation
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`filter-btn ${activeCluster === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCluster('all')}
            >
              All Segments
              <span className="cluster-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{data.length}</span>
            </motion.button>
            
            <AnimatePresence>
              {CLUSTER_NAMES.map((name, idx) => {
                const count = data.filter(d => d.cluster === idx).length
                return (
                  <motion.button 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`filter-btn ${activeCluster === idx ? 'active' : ''}`}
                    onClick={() => setActiveCluster(idx)}
                    style={activeCluster === idx ? { borderColor: COLORS[idx], boxShadow: `0 0 15px ${COLORS[idx]}40`, background: `${COLORS[idx]}15` } : {}}
                  >
                    {name}
                    <span className="cluster-badge" style={{ background: COLORS[idx], color: '#000' }}>{count}</span>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Board */}
      <main className="main-content">
        <motion.header 
          className="top-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-text">
            <h1>AI Customer Behavior Segmentation</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Unsupervised machine learning to discover historical rider profiles and usage patterns.</p>
          </div>
        </motion.header>

        <div className="dashboard-grid">
          {/* Top Metrics Cards */}
          <motion.div 
            className="metrics-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="metric-card glass-card">
              <span className="metric-title">Total Active Rentals</span>
              <div className="metric-val text-neon-blue">{totalRiders.toLocaleString()}</div>
            </div>
            <div className="metric-card glass-card">
              <span className="metric-title">Average Operational Temp</span>
              <div className="metric-val text-neon-orange">{avgTemp}°C</div>
            </div>
          </motion.div>

          {/* Scatter Plot */}
          <motion.div 
            className="glass-card plot-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="section-title">
              <BarChart2 size={20} color="#8b5cf6" />
              Customer Activity by Hour of Day
              <span className="subtitle-hint">(Average Rentals per Hour)</span>
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={hourlyChartData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" stroke="#475569" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="avgRentals" stroke="#475569" tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    color: '#fff',
                    backdropFilter: 'blur(8px)'
                  }} 
                  formatter={(value) => [`${value} Rentals`, "Average"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar 
                  dataKey="avgRentals" 
                  fill={activeCluster === 'all' ? '#8b5cf6' : COLORS[parseInt(activeCluster) % COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Data Table */}
          <motion.div 
            className="glass-card table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="section-title" style={{ padding: '0 1rem' }}>
              <Users size={20} color="#00ff88" />
              Machine Learning Raw Inference Log
            </h2>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Season</th>
                    <th>Environment</th>
                    <th>Casual</th>
                    <th>Subscribed</th>
                    <th>Volume</th>
                    <th>Assigned Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 50).map((row, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 + 0.5 }}
                    >
                      <td className="text-dim">{row.dteday} <span style={{color: '#fff'}}>{row.hr}:00</span></td>
                      <td className="text-dim">{row.season_name}</td>
                      <td>
                        <div className="weather-pill">
                          {row.weathersit === 1 ? <Sun size={14} color="#ffaa00" /> : 
                           row.weathersit === 2 ? <CloudSun size={14} color="#94a3b8" /> : 
                           <CloudRain size={14} color="#00f0ff" />}
                          {row.weather_name}
                        </div>
                      </td>
                      <td className="text-dim">{row.casual}</td>
                      <td className="text-dim">{row.registered}</td>
                      <td style={{ fontWeight: '600', color: '#f8fafc' }}>{row.cnt}</td>
                      <td>
                        <div 
                          className="segment-pill" 
                          style={{ 
                            background: `${COLORS[row.cluster]}15`, 
                            color: COLORS[row.cluster],
                            border: `1px solid ${COLORS[row.cluster]}30`
                          }}
                        >
                          {CLUSTER_NAMES[row.cluster]}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default App
