import React, { useState, useEffect } from 'react';
import { Route } from '../../../core/domain';
import { FetchRoutes } from '../../../core/application/useCases/FetchRoutes';
import { SetBaseline } from '../../../core/application/useCases/SetBaseline';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import Alert from './Alert';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

const RoutesTab: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  // Use cases
  const apiClient = new ApiClient();
  const fetchRoutesUseCase = new FetchRoutes(apiClient);
  const setBaselineUseCase = new SetBaseline(apiClient);

  // Fetch routes on mount
  useEffect(() => {
    loadRoutes();
  }, []);

  // Apply filters whenever routes or filter values change
  useEffect(() => {
    applyFilters();
  }, [routes, vesselTypeFilter, fuelTypeFilter, yearFilter]);

  const loadRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRoutes = await fetchRoutesUseCase.execute();
      setRoutes(fetchedRoutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...routes];

    if (vesselTypeFilter) {
      filtered = filtered.filter(
        (route) => route.vesselType.toLowerCase() === vesselTypeFilter.toLowerCase()
      );
    }

    if (fuelTypeFilter) {
      filtered = filtered.filter(
        (route) => route.fuelType.toLowerCase() === fuelTypeFilter.toLowerCase()
      );
    }

    if (yearFilter) {
      filtered = filtered.filter((route) => route.year === parseInt(yearFilter));
    }

    setFilteredRoutes(filtered);
  };

  const handleSetBaseline = async (routeId: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await setBaselineUseCase.execute(routeId);
      setSuccessMessage(`Route ${routeId} set as baseline successfully`);
      // Reload routes to reflect the baseline change
      await loadRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set baseline');
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filter dropdowns
  const uniqueVesselTypes = Array.from(new Set(routes.map((r) => r.vesselType)));
  const uniqueFuelTypes = Array.from(new Set(routes.map((r) => r.fuelType)));
  const uniqueYears = Array.from(new Set(routes.map((r) => r.year))).sort();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Routes Management</h2>
      <p className="text-gray-600 mb-6">
        View and manage vessel route data. Set baseline routes for compliance comparison.
      </p>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />
      )}

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vessel Type
          </label>
          <select
            value={vesselTypeFilter}
            onChange={(e) => setVesselTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vessel Types</option>
            {uniqueVesselTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type
          </label>
          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Fuel Types</option>
            {uniqueFuelTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner message="Loading routes..." />}

      {/* Routes Table */}
      {!loading && filteredRoutes.length > 0 && (
        <div className="overflow-x-auto table-container">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vessel Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GHG Intensity (gCO₂e/MJ)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Consumption (t)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance (nm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Emissions (t)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className={route.isBaseline ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {route.routeId}
                    {route.isBaseline && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded">
                        Baseline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.vesselType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.fuelType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.ghgIntensity.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.fuelConsumption.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.distance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {route.totalEmissions.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      onClick={() => handleSetBaseline(route.routeId)}
                      disabled={route.isBaseline}
                      loading={loading}
                      variant={route.isBaseline ? 'outline' : 'primary'}
                      size="sm"
                    >
                      {route.isBaseline ? 'Current Baseline' : 'Set Baseline'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredRoutes.length === 0 && routes.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No routes match the selected filters.
        </div>
      )}

      {/* No Data */}
      {!loading && routes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No routes available. Please check your backend connection.
        </div>
      )}
    </div>
  );
};

export default RoutesTab;
