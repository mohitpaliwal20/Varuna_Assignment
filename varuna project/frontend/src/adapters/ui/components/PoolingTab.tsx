import React, { useState, useEffect } from 'react';
import { CreatePool } from '../../../core/application/useCases/CreatePool';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { AdjustedComplianceBalance } from '../../../core/ports/outbound';
import { PoolMember } from '../../../core/domain';

interface ShipMember extends AdjustedComplianceBalance {
  selected: boolean;
}

const PoolingTab: React.FC = () => {
  const [ships, setShips] = useState<ShipMember[]>([]);
  const [year, setYear] = useState<number>(2024);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);

  // Use case
  const apiClient = new ApiClient();
  const createPoolUseCase = new CreatePool(apiClient);

  // Sample ship IDs for demo
  const sampleShipIds = ['SHIP001', 'SHIP002', 'SHIP003', 'SHIP004', 'SHIP005'];

  // Fetch adjusted compliance balances on mount and when year changes
  useEffect(() => {
    loadShipBalances();
  }, [year]);

  const loadShipBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const balances = await Promise.all(
        sampleShipIds.map(async (shipId) => {
          try {
            const balance = await apiClient.getAdjustedComplianceBalance(shipId, year);
            return { ...balance, selected: false };
          } catch (err) {
            // If ship doesn't have data, return with 0 balance
            return {
              shipId,
              year,
              adjustedCbGco2eq: 0,
              selected: false,
            };
          }
        })
      );
      setShips(balances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ship balances');
    } finally {
      setLoading(false);
    }
  };

  const toggleShipSelection = (shipId: string) => {
    setShips((prevShips) =>
      prevShips.map((ship) =>
        ship.shipId === shipId ? { ...ship, selected: !ship.selected } : ship
      )
    );
  };

  const getSelectedShips = () => ships.filter((ship) => ship.selected);

  const calculatePoolSum = () => {
    return getSelectedShips().reduce((sum, ship) => sum + ship.adjustedCbGco2eq, 0);
  };

  const isPoolValid = () => {
    const selectedShips = getSelectedShips();
    if (selectedShips.length < 2) return false;
    return calculatePoolSum() >= 0;
  };

  const getValidationMessage = () => {
    const selectedShips = getSelectedShips();
    if (selectedShips.length === 0) {
      return 'Please select at least 2 ships to create a pool.';
    }
    if (selectedShips.length === 1) {
      return 'Pool must have at least 2 members. Please select more ships.';
    }
    if (calculatePoolSum() < 0) {
      return `Pool sum is negative (${calculatePoolSum().toFixed(2)} gCO₂e). The sum of adjusted compliance balances must be ≥ 0.`;
    }
    return null;
  };

  const handleCreatePool = async () => {
    if (!isPoolValid()) {
      setError(getValidationMessage() || 'Pool validation failed');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const selectedShipIds = getSelectedShips().map((ship) => ship.shipId);
      const response = await createPoolUseCase.execute({
        year,
        memberShipIds: selectedShipIds,
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Pool created successfully');
        setPoolMembers(response.pool.members);
        // Reset selections
        setShips((prevShips) =>
          prevShips.map((ship) => ({ ...ship, selected: false }))
        );
      } else {
        setError(response.message || 'Failed to create pool');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pooling Management</h2>
      <p className="text-gray-600 mb-6">
        Create and manage pooling arrangements according to Fuel EU Article 21. Combine compliance balances across multiple ships.
      </p>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Year Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year
        </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter year"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading ship balances...</p>
        </div>
      )}

      {/* Ship Member List */}
      {!loading && ships.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Available Ships</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ship ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adjusted CB (gCO₂e)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ships.map((ship) => (
                    <tr
                      key={ship.shipId}
                      className={ship.selected ? 'bg-blue-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={ship.selected}
                          onChange={() => toggleShipSelection(ship.shipId)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ship.shipId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`font-semibold ${
                            ship.adjustedCbGco2eq >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {ship.adjustedCbGco2eq.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ship.adjustedCbGco2eq >= 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Surplus
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Deficit
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pool Sum Indicator */}
          {getSelectedShips().length > 0 && (
            <div className="mb-6">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <h4 className="text-lg font-semibold mb-4">Pool Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Selected Ships
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getSelectedShips().length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Pool Sum
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        calculatePoolSum() >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {calculatePoolSum().toFixed(2)} gCO₂e
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Pool Status
                    </div>
                    <div className="text-2xl">
                      {calculatePoolSum() >= 0 ? (
                        <span className="text-green-600 font-bold">✅ Valid</span>
                      ) : (
                        <span className="text-red-600 font-bold">❌ Invalid</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pool Creation Form */}
          <div className="mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4">Create Pool</h4>
              
              {/* Validation Messages */}
              {getSelectedShips().length > 0 && getValidationMessage() && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-yellow-600 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{getValidationMessage()}</span>
                  </div>
                </div>
              )}

              {/* Pool Creation Instructions */}
              <div className="mb-4 text-sm text-gray-600">
                <p className="mb-2">Pool creation requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Select at least 2 ships to form a pool</li>
                  <li>The sum of adjusted compliance balances must be ≥ 0</li>
                  <li>Deficit ships cannot exit with a worse balance</li>
                  <li>Surplus ships cannot exit with a negative balance</li>
                </ul>
              </div>

              {/* Create Pool Button */}
              <button
                onClick={handleCreatePool}
                disabled={!isPoolValid() || loading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  isPoolValid() && !loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Pool...' : 'Create Pool'}
              </button>
            </div>
          </div>

          {/* Pool Members Result */}
          {poolMembers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Pool Created Successfully</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ship ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CB Before (gCO₂e)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CB After (gCO₂e)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {poolMembers.map((member) => {
                      const change = member.cbAfter - member.cbBefore;
                      return (
                        <tr key={member.shipId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.shipId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-semibold ${
                                member.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {member.cbBefore.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-semibold ${
                                member.cbAfter >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {member.cbAfter.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-semibold ${
                                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Data */}
      {!loading && ships.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          No ship data available for the selected year.
        </div>
      )}
    </div>
  );
};

export default PoolingTab;
