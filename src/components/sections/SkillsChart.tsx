'use client';

import { ResponsiveRadar } from '@nivo/radar';

const skillsData = [
  { skill: 'Frontend', level: 90 },
  { skill: 'Backend', level: 85 },
  { skill: 'Data Science', level: 80 },
  { skill: 'Project Management', level: 85 },
  { skill: 'Database', level: 85 },
];

/**
 * Skills distribution chart using Nivo Radar
 * Modern, smooth, and elegant design
 */
export function SkillsChart() {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveRadar
        data={skillsData}
        keys={['level']}
        indexBy="skill"
        maxValue={100}
        margin={{ top: 60, right: 80, bottom: 40, left: 80 }}
        // Circular grid for smooth appearance
        gridShape="circular"
        // Smooth curved lines
        curve="catmullRomClosed"
        // Border styling
        borderColor="#3b82f6"
        borderWidth={2}
        // Fill styling with transparency
        colors={['#3b82f6']}
        fillOpacity={0.35}
        blendMode="normal"
        // Enable dots at vertices
        enableDots={true}
        dotSize={8}
        dotColor="#1e293b"
        dotBorderWidth={2}
        dotBorderColor="#3b82f6"
        // Grid levels
        gridLevels={5}
        gridLabelOffset={24}
        // Dark mode theme customization
        theme={{
          axis: {
            ticks: {
              text: {
                fill: '#94a3b8',
                fontSize: 13,
                fontWeight: 500,
              },
            },
          },
          grid: {
            line: {
              stroke: '#334155',
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: '#1e293b',
              color: '#e2e8f0',
              fontSize: 14,
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              border: '1px solid #334155',
            },
          },
        }}
        // Animation
        animate={true}
        motionConfig="gentle"
        // Value format
        valueFormat={(value) => `${value}%`}
        // Interactivity
        isInteractive={true}
        // Slot props for labels
        sliceTooltip={({ index, data }) => (
          <div
            style={{
              background: '#1e293b',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #334155',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <strong style={{ color: '#e2e8f0' }}>{index}</strong>
            <div style={{ color: '#94a3b8', marginTop: '4px' }}>
              Skill Level: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{data[0].value}%</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
