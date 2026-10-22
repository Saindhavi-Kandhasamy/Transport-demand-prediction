import React, { useEffect, useState } from 'react'
import { Line, Bar, Pie } from 'react-chartjs-2'
import '../chartSetup.js'
import { CHART_COLORS } from '../chartSetup.js'
import { StatCard } from './StatCard.jsx'
import { api } from '../api/client.js'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.analyticsOverview().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="tiq-card text-danger">{error}</div>
  if (!data) return <div className="tiq-card">Loading analytics…</div>

  const monthLine = {
    labels: data.by_month.map((m) => MONTH_NAMES[m.month - 1]),
    datasets: [
      {
        label: 'Avg Demand Score',
        data: data.by_month.map((m) => m.demand),
        borderColor: CHART_COLORS.teal,
        backgroundColor: 'rgba(45,212,191,0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  }

  const modeBar = {
    labels: data.by_mode.map((m) => m.transport_mode),
    datasets: [
      { label: 'Avg Demand', data: data.by_mode.map((m) => m.demand), backgroundColor: CHART_COLORS.amber },
    ],
  }

  const modePie = {
    labels: data.by_mode.map((m) => m.transport_mode),
    datasets: [
      {
        data: data.by_mode.map((m) => m.bookings),
        backgroundColor: [CHART_COLORS.teal, CHART_COLORS.amber, CHART_COLORS.coral],
      },
    ],
  }

  const weekdayBar = {
    labels: data.by_weekday.map((w) => WEEKDAY_NAMES[w.weekday]),
    datasets: [
      { label: 'Avg Occupancy %', data: data.by_weekday.map((w) => w.occupancy), backgroundColor: CHART_COLORS.ink },
    ],
  }

  const chartOpts = { responsive: true, plugins: { legend: { display: false } } }

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6"><StatCard label="Total Revenue" value={`₹${(data.totals.total_revenue / 1e7).toFixed(2)}Cr`} accent="#2DD4BF" /></div>
        <div className="col-md-3 col-6"><StatCard label="Total Profit" value={`₹${(data.totals.total_profit / 1e7).toFixed(2)}Cr`} accent="#FFB020" /></div>
        <div className="col-md-3 col-6"><StatCard label="Avg Occupancy" value={data.totals.avg_occupancy} suffix="%" /></div>
        <div className="col-md-3 col-6"><StatCard label="Total Trips Analyzed" value={data.totals.total_trips.toLocaleString()} /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="tiq-card h-100">
            <h6>Demand by Month</h6>
            <Line data={monthLine} options={chartOpts} />
          </div>
        </div>
        <div className="col-lg-5">
          <div className="tiq-card h-100">
            <h6>Bookings Share by Mode</h6>
            <Pie data={modePie} options={{ responsive: true }} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="tiq-card h-100">
            <h6>Avg Demand by Transport Mode</h6>
            <Bar data={modeBar} options={chartOpts} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="tiq-card h-100">
            <h6>Avg Occupancy by Weekday</h6>
            <Bar data={weekdayBar} options={chartOpts} />
          </div>
        </div>
        <div className="col-12">
          <div className="tiq-card">
            <h6>Top Routes by Demand</h6>
            <table className="table table-sm mb-0">
              <thead>
                <tr><th>Route</th><th>Avg Demand</th><th>Trips</th></tr>
              </thead>
              <tbody>
                {data.by_route.map((r, i) => (
                  <tr key={i}>
                    <td>{r.source} → {r.destination}</td>
                    <td>{r.demand}</td>
                    <td>{r.trips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
