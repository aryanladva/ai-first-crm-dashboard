import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function App() {

  const [form, setForm] = useState({ name: "", type: "", notes: "" });
  const [output, setOutput] = useState(null);
  const [history, setHistory] = useState([]);

  const sendData = async () => {
    const text = `${form.name} ${form.type} ${form.notes}`;

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: text,
      });

      setOutput(res.data);
      setHistory([{ input: text, result: res.data }, ...history]);

    } catch {
      setOutput({ error: "❌ Backend not connected" });
    }
  };

  // Chart data
  const chartData = [
    { name: "Positive", value: history.filter(h => h.result?.ai_output?.sentiment==="positive").length },
    { name: "Negative", value: history.filter(h => h.result?.ai_output?.sentiment==="negative").length },
    { name: "Neutral", value: history.filter(h => h.result?.ai_output?.sentiment==="neutral").length }
  ];

  //  Colors (PRO LOOK)
  const COLORS = {
    Positive: "#22c55e", // green
    Negative: "#ef4444", // red
    Neutral: "#f59e0b"   // yellow
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>AI CRM</h2>
        <ul>
          <li>Dashboard</li>
          <li>Analytics</li>
          <li>History</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main">

        <h1>🚀 AI CRM Dashboard</h1>

        {/* FORM + OUTPUT */}
        <div className="grid">

          <div className="card">
            <h3>Log Interaction</h3>

            <input placeholder="Name"
              onChange={(e)=>setForm({...form, name:e.target.value})}
            />

            <input placeholder="Type"
              onChange={(e)=>setForm({...form, type:e.target.value})}
            />

            <textarea placeholder="Notes"
              onChange={(e)=>setForm({...form, notes:e.target.value})}
            />

            <button onClick={sendData}>Submit</button>
          </div>

          <div className="card">
            <h3>AI Output</h3>

            {output ? (
              output.error ? (
                <p>{output.error}</p>
              ) : (
                <>
                  <p><b>Summary:</b> {output.ai_output.summary}</p>
                  <p><b>Sentiment:</b> {output.ai_output.sentiment}</p>
                  <p><b>Follow-up:</b> {output.ai_output.follow_up}</p>
                </>
              )
            ) : <p>Waiting...</p>}
          </div>

        </div>

        {/* CHART WITH COLORS */}
        <div className="chart">
          <h3>📊 Sentiment Analysis</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>

              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
