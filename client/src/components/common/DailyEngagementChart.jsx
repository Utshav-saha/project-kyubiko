import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DailyEngagementChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-dark-chocolate/60">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" stroke="#877569" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#877569" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#fff' }} 
          labelStyle={{ color: '#3E2723', fontWeight: 'bold' }} 
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
        <Line type="monotone" name="New Views" dataKey="new_views" stroke="#FDBA74" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" name="New Bookings" dataKey="new_bookings" stroke="#34D399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" name="Added to Mini Museums" dataKey="new_inclusions" stroke="#A78BFA" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}