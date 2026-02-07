import React, { useState } from 'react';
import { formatCurrencyINR } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar } from 'lucide-react';

export default function NetWorthDashboard({ 
  assets, 
  logs, 
  onAddAsset, 
  onAddLog, 
  onDeleteAsset, 
  isLoading 
}) {
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', type: 'ASSET' });
  
  const [showAddLog, setShowAddLog] = useState(null); // Asset ID
  const [newLog, setNewLog] = useState({ balance: '', date: new Date().toISOString().split('T')[0], note: '' });

  // Group logs by asset for easier display
  const logsByAsset = logs.reduce((acc, log) => {
    if (!acc[log.asset_id]) acc[log.asset_id] = [];
    acc[log.asset_id].push(log);
    return acc;
  }, {});

  // Calculate current net worth
  // Get the latest log for each asset
  const latestBalances = assets.reduce((acc, asset) => {
    const assetLogs = logsByAsset[asset.id] || [];
    const latestLog = assetLogs[0]; // logs are sorted desc by date
    const balance = latestLog ? Number(latestLog.balance) : 0;
    
    if (asset.type === 'ASSET') acc.assets += balance;
    else acc.liabilities += balance;
    
    return acc;
  }, { assets: 0, liabilities: 0 });

  const netWorth = latestBalances.assets - latestBalances.liabilities;

  const handleAddAsset = async (e) => {
    e.preventDefault();
    await onAddAsset(newAsset);
    setNewAsset({ name: '', type: 'ASSET' });
    setShowAddAsset(false);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    await onAddLog({ ...newLog, asset_id: showAddLog, balance: Number(newLog.balance) });
    setNewLog({ balance: '', date: new Date().toISOString().split('T')[0], note: '' });
    setShowAddLog(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Net Worth</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyINR(netWorth)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Total Assets</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyINR(latestBalances.assets)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2 text-red-600 dark:text-red-400">
            <TrendingDown className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Total Liabilities</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyINR(latestBalances.liabilities)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Accounts & Assets</h2>
        <button 
          onClick={() => setShowAddAsset(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {showAddAsset && (
        <form onSubmit={handleAddAsset} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-blue-500/30 shadow-xl flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Name</label>
            <input 
              required
              value={newAsset.name}
              onChange={e => setNewAsset({...newAsset, name: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl" 
              placeholder="e.g. HDFC Bank, SBI Home Loan"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
            <select 
              value={newAsset.type}
              onChange={e => setNewAsset({...newAsset, type: e.target.value})}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl"
            >
              <option value="ASSET">Asset (Positive)</option>
              <option value="LIABILITY">Liability (Negative)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Save</button>
            <button type="button" onClick={() => setShowAddAsset(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl">Cancel</button>
          </div>
        </form>
      )}

      {/* Assets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map(asset => {
          const assetLogs = logsByAsset[asset.id] || [];
          const latestLog = assetLogs[0];
          const isAsset = asset.type === 'ASSET';

          return (
            <div key={asset.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{asset.name}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isAsset ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {asset.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isAsset ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrencyINR(latestLog?.balance || 0)}
                    </p>
                    <p className="text-xs text-slate-500">Latest update: {latestLog ? formatDate(latestLog.date) : 'Never'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddLog(asset.id)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                  >
                    Update Balance
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Delete this account and all its history?')) onDeleteAsset(asset.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* History Preview */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Recent History</h4>
                {assetLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex justify-between text-xs py-1.5">
                    <span className="text-slate-500">{formatDate(log.date)}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrencyINR(log.balance)}</span>
                  </div>
                ))}
              </div>

              {/* Update Modal Overlay */}
              {showAddLog === asset.id && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Update Balance: {asset.name}</h3>
                    <form onSubmit={handleAddLog} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Balance (as of today)</label>
                        <input 
                          type="number"
                          required
                          value={newLog.balance}
                          onChange={e => setNewLog({...newLog, balance: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700" 
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date</label>
                        <input 
                          type="date"
                          required
                          value={newLog.date}
                          onChange={e => setNewLog({...newLog, date: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Update</button>
                        <button type="button" onClick={() => setShowAddLog(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}