import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Note, ActionItem } from '../types';

interface GrowthStatsProps {
  notes: Note[];
  allActions: ActionItem[];
}

const GrowthStats: React.FC<GrowthStatsProps> = ({ notes, allActions }) => {
  const completedActions = allActions.filter(a => a.isCompleted).length;
  const totalActions = allActions.length;
  const rate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Prepare data for category chart (tags)
  const tagCounts: Record<string, number> = {};
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const pieData = Object.keys(tagCounts).map(tag => ({
    name: tag,
    value: tagCounts[tag]
  })).slice(0, 5); // Top 5 tags

  const COLORS = ['#D4A373', '#A3B18A', '#588157', '#3A5A40', '#DAD7CD'];

  // Calculate weekly activity from actual action data
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Count actions by day of week
  const actionsByDay: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
  };

  allActions.forEach(action => {
    const date = new Date(action.createdAt);
    const dayOfWeek = weekDays[date.getDay()]; // 0 = Sun, 1 = Mon, etc.
    actionsByDay[dayOfWeek]++;
  });

  // Build activity data in correct order
  const activityData = dayOrder.map(day => ({
    day,
    actions: actionsByDay[day]
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wider">Total Notes</p>
          <p className="text-3xl font-serif text-ink font-bold mt-1">{notes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wider">Actions Done</p>
          <p className="text-3xl font-serif text-action font-bold mt-1">{completedActions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wider">Completion Rate</p>
          <p className="text-3xl font-serif text-ink font-bold mt-1">{rate}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-xs text-stone-500 uppercase tracking-wider">Focus Area</p>
          <p className="text-lg font-serif text-ink font-bold mt-2 truncate">{pieData[0]?.name || 'General'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-[300px]">
          <h3 className="text-lg font-serif mb-4 text-ink">Weekly Action Flow</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <Bar dataKey="actions" fill="#D4A373" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Knowledge Distribution */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm h-[300px]">
          <h3 className="text-lg font-serif mb-4 text-ink">Knowledge Themes</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GrowthStats;
