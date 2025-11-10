import React, { useState, useEffect } from 'react';
import { ComplianceBalance } from '../../../core/domain';
import { BankBalance } from '../../../core/application/useCases/BankBalance';
import { ApplyBanked } from '../../../core/application/useCases/ApplyBanked';
import { ApiClient } from '../../infrastructure/api/ApiClient';

const BankingTab: React.FC = () => {
  const [complianceBalance, setComplianceBalance] = useState<ComplianceBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [shipId, setShipId] = useState<string>('SHIP001');
  const [year, setYear] = useState<number>(2024);
  const [bankAmount, setBankAmount] = useState<string>('');
  const [applyAmount, setApplyAmount] = useState<string>('');

  // Use cases
  const apiClient = new ApiClient();
  const bankBalanceUseCase = new BankBalance(apiClient);
  const applyBankedUseCase = new ApplyBanked(apiClient);

  // Fetch compliance balance on mount and when shipId/year changes
  useEffect(() => {
    loadComplianceBalance();
  }, [shipId, year]);

  const loadComplianceBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const balance = await apiClient.getComplianceBalance(shipId, year);
      setComplianceBalance(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance balance');
    } finally {
      setLoading(false);
    }
  };

  const handleBankSurplus = async () => {
    if (!bankAmount || parseFloat(bankAmount) <= 0) {
      setError('Please enter a valid positive amount to bank');
      return;
    }

    if (!complianceBalance || complianceBalance.cbGco2eq <= 0) {
      setError('Cannot bank when compliance balance is zero or negative');
      return;
    }

    if (parseFloat(bankAmount) > complianceBalance.cbGco2eq) {
      setError('Bank amount cannot exceed available compliance balance');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await bankBalanceUseCase.execute({
        shipId,
        year,
        amount: parseFloat(bankAmount),
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Surplus banked successfully');
        setBankAmount('');
        // Reload compliance balance to reflect changes
        await loadComplianceBalance();
      } else {
        setError(response.message || 'Failed to bank surplus');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bank surplus');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBanked = async () => {
    if (!applyAmount || parseFloat(applyAmount) <= 0) {
      setError('Please enter a valid positive amount to apply');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await applyBankedUseCase.execute({
        shipId,
        year,
        amount: parseFloat(applyAmount),
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Banked surplus applied successfully');
        setApplyAmount('');
        // Reload compliance balance to reflect changes
        await loadComplianceBalance();
      } else {
        setError(response.message || 'Failed to apply banked surplus');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply banked surplus');
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const cbBefore = complianceBalance?.cbGco2eq || 0;
  const applied = 0; // This would come from banking records in a full implementation
  const cbAfter = cbBefore; // This would be calculated after applying banked amounts

  // Determine if banking actions should be enabled
  const canBank = complianceBalance !== null && complianceBalance.cbGco2eq > 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Banking Management</h2>
      <p className="text-gray-600 mb-6">
        Manage compliance balance banking according to Fuel EU Article 20. Bank positive compliance balances or apply previously banked surplus to deficits.
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

      {/* Ship and Year Selection */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ship ID
          </label>
          <input
            type="text"
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ship ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter year"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading compliance balance...</p>
        </div>
      )}

      {/* KPIs Section */}
      {!loading && complianceBalance && (
        <>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Compliance Balance KPIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CB Before */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  CB Before
                </div>
                <div className={`text-3xl font-bold ${cbBefore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cbBefore.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">gCO₂e</div>
                <div className="mt-2">
                  {cbBefore >= 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Surplus
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Deficit
                    </span>
                  )}
                </div>
              </div>

              {/* Applied */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Applied
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {applied.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">gCO₂e</div>
              </div>

              {/* CB After */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  CB After
                </div>
                <div className={`text-3xl font-bold ${cbAfter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cbAfter.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 mt-1">gCO₂e</div>
              </div>
            </div>
          </div>

          {/* Banking Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Positive CB */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4">Bank Positive CB</h4>
              <p className="text-sm text-gray-600 mb-4">
                Store positive compliance balance for future use.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Bank (gCO₂e)
                </label>
                <input
                  type="number"
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  disabled={!canBank || loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <button
                onClick={handleBankSurplus}
                disabled={!canBank || loading || !bankAmount}
                className={`w-full px-4 py-2 rounded font-medium ${
                  canBank && !loading && bankAmount
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : 'Bank Positive CB'}
              </button>

              {!canBank && (
                <p className="mt-2 text-sm text-red-600">
                  Banking is disabled when compliance balance is zero or negative.
                </p>
              )}
            </div>

            {/* Apply Banked Surplus */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4">Apply Banked Surplus</h4>
              <p className="text-sm text-gray-600 mb-4">
                Apply previously banked surplus to current deficit.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Apply (gCO₂e)
                </label>
                <input
                  type="number"
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <button
                onClick={handleApplyBanked}
                disabled={loading || !applyAmount}
                className={`w-full px-4 py-2 rounded font-medium ${
                  !loading && applyAmount
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : 'Apply Banked Surplus'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* No Data */}
      {!loading && !complianceBalance && !error && (
        <div className="text-center py-8 text-gray-500">
          No compliance balance data available for the selected ship and year.
        </div>
      )}
    </div>
  );
};

export default BankingTab;
