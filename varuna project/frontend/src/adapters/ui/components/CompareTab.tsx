import React, { useState, useEffect } from 'react';
import { CompareRoutes } from '../../../core/application/useCases/CompareRoutes';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { RouteComparison } from '../../../core/ports/inbound';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';

const TARGET_INTENSITY = 89.3368; // gCO₂e/MJ

const CompareTab: React.FC = () => {
  const [comparisonData, setComparisonData] = useState<RouteComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use case
  const apiClient = new ApiClient();
  const compareRoutesUseCase = new CompareRoutes(apiClient);

  // Fetch comparison data on mount
  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await compareRoutesUseCase.execute();
      setComparisonData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = comparisonData
    ? [
        {
          name: 'Baseline',
          routeId: comparisonData.baseline.routeId,
          ghgIntensity: comparisonData.baseline.ghgIntensity,
        },
        {
          name: 'Comparison',
          routeId: comparisonData.comparison.routeId,
          ghgIntensity: comparisonData.comparison.ghgIntensity,
        },
        {
          name: 'Target',
          routeId: 'Target',
          ghgIntensity: TARGET_INTENSITY,
        },
      ]
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Route Comparison</h2>
      <p className="text-gray-600 mb-6">
        Compare baseline routes with other routes to assess compliance performance against the target intensity of {TARGET_INTENSITY.toFixed(4)} gCO₂e/MJ.
      </p>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading comparison data..." />}

      {/* Comparison Table */}
      {!loading && comparisonData && (
        <>
          <div className="mb-8 overflow-x-auto table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GHG Intensity (gCO₂e/MJ)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage Difference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliant Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Baseline
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comparisonData.baseline.routeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comparisonData.baseline.ghgIntensity.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {comparisonData.baseline.ghgIntensity < TARGET_INTENSITY ? (
                      <span className="text-green-600 font-semibold">✅ Compliant</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Non-Compliant</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Comparison
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comparisonData.comparison.routeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comparisonData.comparison.ghgIntensity.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-semibold ${
                        comparisonData.percentDiff > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {comparisonData.percentDiff > 0 ? '+' : ''}
                      {comparisonData.percentDiff.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {comparisonData.compliant ? (
                      <span className="text-green-600 font-semibold">✅ Compliant</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ Non-Compliant</span>
                    )}
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Target
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {TARGET_INTENSITY.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Comparison Chart */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">GHG Intensity Comparison</h3>
            <Card>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="routeId" />
                  <YAxis label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ghgIntensity" fill="#3B82F6" name="GHG Intensity" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Line Chart Alternative */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">GHG Intensity Trend</h3>
            <Card>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="routeId" />
                  <YAxis label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ghgIntensity"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="GHG Intensity"
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {/* No Data */}
      {!loading && !comparisonData && !error && (
        <div className="text-center py-8 text-gray-500">
          No comparison data available. Please set a baseline route in the Routes tab.
        </div>
      )}
    </div>
  );
};

export default CompareTab;
