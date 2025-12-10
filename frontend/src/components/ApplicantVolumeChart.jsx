// src/components/ApplicantVolumeChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiLoader } from 'react-icons/fi';

// Register the components Chart.js needs
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ApplicantVolumeChart = ({ chartData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FiLoader className="animate-spin text-2xl text-primary" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return <p>No applicant data available for the last 14 days.</p>;
  }

  // Format the data for the chart
  const data = {
    labels: chartData.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    ),
    datasets: [
      {
        label: 'New Applicants',
        data: chartData.map(d => d.count),
        backgroundColor: '#10B981', // Your app's primary green color
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'New Applicants (Last 14 Days)',
        font: {
            size: 16,
            weight: 'bold',
        },
        color: '#1f2937',
        padding: {
            bottom: 20,
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: {
            weight: 'bold',
        },
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += context.parsed.y;
                }
                return label;
            }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
            color: '#e5e7eb',
        },
        ticks: {
            color: '#6b7280',
            precision: 0 // Ensure no decimal points on the Y-axis
        }
      },
      x: {
        grid: {
            display: false,
        },
        ticks: {
            color: '#6b7280'
        }
      },
    },
  };

  // Set a fixed height for the chart container
  return (
    <div style={{ height: '400px' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default ApplicantVolumeChart;