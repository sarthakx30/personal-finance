import React, { useState } from 'react';
import { formatCurrencyINR } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar, PlusCircle } from 'lucide-react';
import Modal from '../common/Modal';
import NetWorthChart from './NetWorthChart';
import { useConfirm } from '../../context/ConfirmContext';

export default function NetWorthDashboard({ 
  assets, 
  logs, 
  onAddAsset, 
  onAddLog, 
  onDeleteAsset, 
  isLoading 
}) {
  const confirm = useConfirm();
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Bank Account' });
  
  const accountCategories = [
    { label: 'Bank Account', type: 'ASSET' },
    { label: 'Savings/FD', type: 'ASSET' },
    { label: 'Stocks/Mutual Funds', type: 'ASSET' },
    { label: 'Cash', type: 'ASSET' },
    { label: 'Real Estate', type: 'ASSET' },
    { label: 'Gold', type: 'ASSET' },
    { label: 'Retirement Account', type: 'ASSET' },
    { label: 'Home Loan', type: 'LIABILITY' },
    { label: 'Personal Loan', type: 'LIABILITY' },
    { label: 'Credit Card', type: 'LIABILITY' },
    { label: 'Car Loan', type: 'LIABILITY' },
    { label: 'Other Liability', type: 'LIABILITY' },
  ];

  const [showAddLog, setShowAddLog] = useState(null); // Asset ID
  const [newLog, setNewLog] = useState({ balance: '', date: new Date().toISOString().split('T')[0], note: '' });

  // Group logs by asset for easier display
  const logsByAsset = logs.reduce((acc, log) => {
    if (!acc[log.asset_id]) acc[log.asset_id] = [];
    acc[log.asset_id].push(log);
    return acc;
  }, {});

  // Calculate current net worth
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
    const selectedCat = accountCategories.find(c => c.label === newAsset.category);
    await onAddAsset({ 
      name: newAsset.name, 
      type: selectedCat.type,
      tags: [newAsset.category] 
    });
    setNewAsset({ name: '', category: 'Bank Account' });
    setShowAddAsset(false);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    await onAddLog({ ...newLog, asset_id: showAddLog, balance: Number(newLog.balance) });
    setNewLog({ balance: '', date: new Date().toISOString().split('T')[0], note: '' });
    setShowAddLog(null);
  };

  const handleDelete = async (assetId) => {
    const isConfirmed = await confirm({
      title: 'Delete Account?',
      message: 'This will permanently remove this account and all its history. This action cannot be undone.',
      type: 'danger'
    });

    if (isConfirmed) {
      onDeleteAsset(assetId);
    }
  };

  const SummaryCard = ({ title, amount, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg relative overflow-hidden group transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorClass}`}>
         <Icon className="w-24 h-24 transform rotate-12 -mr-4 -mt-4" />
      </div>
      <div className="relative z-10">
        <div className={`flex items-center gap-3 mb-3 ${colorClass}`}>
          <div className="p-2.5 bg-current/10 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</h3>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {formatCurrencyINR(amount)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Net Worth" 
          amount={netWorth} 
          icon={Wallet} 
          colorClass="text-blue-600 dark:text-blue-400" 
        />
        <SummaryCard 
          title="Total Assets" 
          amount={latestBalances.assets} 
          icon={TrendingUp} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
        />
        <SummaryCard 
          title="Total Liabilities" 
          amount={latestBalances.liabilities} 
          icon={TrendingDown} 
          colorClass="text-red-600 dark:text-red-400" 
        />
      </div>

      {/* Net Worth Chart */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Wealth Journey</h3>
          <p className="text-xs text-slate-500">Visualization of your total net worth over time.</p>
        </div>
        <NetWorthChart assets={assets} logs={logs} />
      </section>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Accounts & Balances</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track your individual asset and liability accounts.</p>
        </div>
        <button 
          onClick={() => setShowAddAsset(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" /> Add Account
        </button>
      </div>

      {/* Assets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => {
          const assetLogs = logsByAsset[asset.id] || [];
          const latestLog = assetLogs[0];
          const isAsset = asset.type === 'ASSET';

          return (
            <div key={asset.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{asset.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isAsset ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {asset.tags?.[0] || asset.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold tracking-tight ${isAsset ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrencyINR(latestLog?.balance || 0)}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Current Balance</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setNewLog({ ...newLog, balance: latestLog?.balance || '' });
                      setShowAddLog(asset.id);
                    }}
                    className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-bold transition-all border border-slate-100 dark:border-slate-700"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDelete(asset.id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors border border-transparent"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* History Preview */}
              <div className="bg-slate-50/50 dark:bg-slate-900/50 p-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Last update: {latestLog ? formatDate(latestLog.date) : 'Never'}</p>
                </div>
                <div className="space-y-2">
                  {assetLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No logs yet.</p>
                  ) : (
                    assetLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">{formatDate(log.date)}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrencyINR(log.balance)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showAddAsset} 
        onClose={() => setShowAddAsset(false)} 
        title="Add New Account"
      >
        <form onSubmit={handleAddAsset} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Account Name</label>
              <input 
                required
                value={newAsset.name}
                onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-white outline-none font-semibold" 
                placeholder="e.g. HDFC Bank, SBI Home Loan"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Account Category</label>
              <select 
                value={newAsset.category}
                onChange={e => setNewAsset({...newAsset, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-white cursor-pointer outline-none font-semibold appearance-none"
              >
                {accountCategories.map(cat => (
                  <option key={cat.label} value={cat.label}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">Create Account</button>
            <button type="button" onClick={() => setShowAddAsset(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!showAddLog} 
        onClose={() => setShowAddLog(null)} 
        title={`Update Balance: ${assets.find(a => a.id === showAddLog)?.name}`}
      >
        <form onSubmit={handleAddLog} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">New Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={newLog.balance}
                  onChange={e => setNewLog({...newLog, balance: e.target.value})}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-white font-bold outline-none" 
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Effective Date</label>
              <input 
                type="date"
                required
                value={newLog.date}
                onChange={e => setNewLog({...newLog, date: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-white cursor-pointer outline-none font-semibold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Note (Optional)</label>
            <input 
              type="text"
              value={newLog.note}
              onChange={e => setNewLog({...newLog, note: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 dark:text-white outline-none font-medium" 
              placeholder="e.g. Salary credited, monthly repayment"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">Update Balance</button>
            <button type="button" onClick={() => setShowAddLog(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
