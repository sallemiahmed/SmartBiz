
import React, { useState, useMemo } from 'react';
import { 
  Car, MapPin, Calendar, Settings, Plus, Search, 
  Filter, Wrench, FileText, Trash2, Pencil, X, Fuel, User, ArrowRight, CheckCircle,
  DollarSign, File, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vehicle, FleetMission, FleetMaintenance, FleetExpense, FleetDocument } from '../types';

interface FleetManagementProps {
  view?: string;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ view }) => {
  const { 
    vehicles, fleetMissions, fleetMaintenances, fleetExpenses, fleetDocuments,
    addVehicle, updateVehicle, deleteVehicle, 
    addFleetMission, updateFleetMission, deleteFleetMission,
    addFleetMaintenance, deleteFleetMaintenance,
    addFleetExpense, deleteFleetExpense,
    addFleetDocument, deleteFleetDocument,
    formatCurrency, t 
  } = useApp();

  // --- STATE ---
  // Map view prop to internal tab
  const activeTab = view?.replace('fleet-', '') || 'dashboard';
  
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // --- DERIVED DATA ---
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const inUseVehicles = vehicles.filter(v => v.status === 'in_use').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  
  const upcomingMaintenance = fleetMaintenances.filter(m => m.status === 'scheduled').length;
  const activeMissions = fleetMissions.filter(m => m.status === 'in_progress').length;

  const totalFleetCost = [...fleetMaintenances, ...fleetExpenses].reduce((acc, m) => acc + (m.hasOwnProperty('cost') ? (m as any).cost : m.amount), 0);

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const alerts = useMemo(() => {
    const list = [];
    vehicles.forEach(v => {
        if (v.technicalCheckExpiry) {
            const expiry = new Date(v.technicalCheckExpiry);
            const diffTime = expiry.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 30) {
                list.push({ type: 'warning', message: `Technical check expiring soon for ${v.plate} (${diffDays} days)` });
            }
        }
        if (v.insuranceExpiry) {
             const expiry = new Date(v.insuranceExpiry);
            const diffTime = expiry.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             if (diffDays < 30) {
                list.push({ type: 'warning', message: `Insurance expiring soon for ${v.plate} (${diffDays} days)` });
            }
        }
    });
    return list;
  }, [vehicles]);


  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicles')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{vehicles.length}</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <Car className="w-6 h-6" />
                    </div>
                </div>
                <div className="mt-4 flex gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{availableVehicles} Available</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{inUseVehicles} In Use</span>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Missions</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeMissions}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <MapPin className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance Alert</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{maintenanceVehicles}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                        <Wrench className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{upcomingMaintenance} Scheduled</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Costs (YTD)</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalFleetCost)}</h3>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
        
        {alerts.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <h4 className="text-yellow-800 dark:text-yellow-400 font-bold flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" /> Alerts
                </h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                    {alerts.map((alert, idx) => (
                        <li key={idx}>{alert.message}</li>
                    ))}
                </ul>
            </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
             <button onClick={() => { setEditingVehicle(null); setIsVehicleModalOpen(true); }} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-indigo-500 transition-all">
                 <div className="p-1 bg-indigo-100 text-indigo-600 rounded-full"><Plus className="w-4 h-4" /></div>
                 <span className="font-medium text-gray-700 dark:text-gray-200">{t('add_vehicle')}</span>
             </button>
             <button onClick={() => setIsMissionModalOpen(true)} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-indigo-500 transition-all">
                 <div className="p-1 bg-blue-100 text-blue-600 rounded-full"><MapPin className="w-4 h-4" /></div>
                 <span className="font-medium text-gray-700 dark:text-gray-200">{t('new_mission')}</span>
             </button>
        </div>
    </div>
  );

  const renderVehiclesList = () => (
    <div className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map(v => (
              <div key={v.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group">
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 relative">
                      {v.image ? <img src={v.image} alt={v.model} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Car className="w-12 h-12" /></div>}
                      <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase shadow-sm
                            ${v.status === 'available' ? 'bg-green-500 text-white' : 
                              v.status === 'in_use' ? 'bg-blue-500 text-white' : 
                              'bg-orange-500 text-white'}
                          `}>
                              {t(v.status)}
                          </span>
                      </div>
                  </div>
                  <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{v.make} {v.model} <span className="text-sm font-normal text-gray-500">({v.year})</span></h3>
                      <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded w-fit">
                          {v.plate}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Fuel className="w-4 h-4" /> {v.fuelType}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                              <Settings className="w-4 h-4" /> {v.mileage.toLocaleString()} km
                          </div>
                      </div>
                      
                      {/* Quick Documents Status */}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs flex justify-between text-gray-500">
                         <span>Ins: {v.insuranceExpiry || 'N/A'}</span>
                         <span>Tech: {v.technicalCheckExpiry || 'N/A'}</span>
                      </div>

                      <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                          <button 
                            onClick={() => { setSelectedVehicleId(v.id); setIsDocumentModalOpen(true); }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="Documents"
                          >
                            <File className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingVehicle(v); setIsVehicleModalOpen(true); }} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteVehicle(v.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
       </div>
    </div>
  );

  const renderMissions = () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <tr>
                      <th className="px-6 py-3">Vehicle</th>
                      <th className="px-6 py-3">Driver</th>
                      <th className="px-6 py-3">Route</th>
                      <th className="px-6 py-3">Dates</th>
                      <th className="px-6 py-3">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fleetMissions.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{m.vehicleName}</td>
                          <td className="px-6 py-3">{m.driverName}</td>
                          <td className="px-6 py-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" /> {m.destination}
                          </td>
                          <td className="px-6 py-3 text-gray-500">
                              {m.startDate} <ArrowRight className="w-3 h-3 inline mx-1" /> {m.endDate}
                          </td>
                          <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                ${m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                                  m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                              `}>
                                  {m.status}
                              </span>
                          </td>
                      </tr>
                  ))}
                  {fleetMissions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No missions logged.</td></tr>}
              </tbody>
          </table>
      </div>
  );

  const renderMaintenance = () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Vehicle</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Cost</th>
                      <th className="px-6 py-3 text-center">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fleetMaintenances.map(m => {
                      const v = vehicles.find(v => v.id === m.vehicleId);
                      return (
                        <tr key={m.id}>
                            <td className="px-6 py-3 text-gray-500">{m.date}</td>
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{v?.make} {v?.model}</td>
                            <td className="px-6 py-3 capitalize">{m.type.replace('_', ' ')}</td>
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{m.description}</td>
                            <td className="px-6 py-3 text-right font-bold text-red-600 dark:text-red-400">{formatCurrency(m.cost)}</td>
                            <td className="px-6 py-3 text-center">
                                {m.status === 'completed' 
                                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> 
                                    : <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">Scheduled</span>}
                            </td>
                        </tr>
                      );
                  })}
                  {fleetMaintenances.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No maintenance records.</td></tr>}
              </tbody>
          </table>
      </div>
  );

  const renderCosts = () => (
      <div className="space-y-6">
          <div className="flex justify-end">
               <button 
                   onClick={() => setIsExpenseModalOpen(true)}
                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
               >
                   <Plus className="w-4 h-4" /> Add Expense
               </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                      <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Vehicle</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Combine maintenance and expenses */}
                      {[...fleetExpenses, ...fleetMaintenances.map(m => ({ ...m, amount: m.cost, type: 'maintenance' as any }))]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((exp: any) => {
                              const v = vehicles.find(v => v.id === exp.vehicleId);
                              return (
                                  <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                      <td className="px-6 py-3 text-gray-500">{exp.date}</td>
                                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{v?.plate}</td>
                                      <td className="px-6 py-3 capitalize">
                                          <span className={`px-2 py-0.5 rounded text-xs ${
                                              exp.type === 'fuel' ? 'bg-blue-100 text-blue-700' :
                                              exp.type === 'insurance' ? 'bg-purple-100 text-purple-700' :
                                              exp.type === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                                              'bg-gray-100 text-gray-700'
                                          }`}>
                                              {exp.type}
                                          </span>
                                      </td>
                                      <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{exp.description}</td>
                                      <td className="px-6 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(exp.amount)}</td>
                                      <td className="px-6 py-3 text-right">
                                          <button onClick={() => exp.cost ? deleteFleetMaintenance(exp.id) : deleteFleetExpense(exp.id)} className="text-red-500 hover:text-red-700">
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })
                      }
                  </tbody>
              </table>
          </div>
      </div>
  );

  // --- MODALS ---

  const AddVehicleModal = () => {
      const [formData, setFormData] = useState<Partial<Vehicle>>({
          status: 'available',
          fuelType: 'Diesel',
          mileage: 0,
          ...editingVehicle
      });

      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (editingVehicle) {
              updateVehicle({ ...editingVehicle, ...formData } as Vehicle);
          } else {
              addVehicle({ ...formData, id: `v-${Date.now()}` } as Vehicle);
          }
          setIsVehicleModalOpen(false);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{editingVehicle ? 'Edit' : 'Add'} Vehicle</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('make')}</label>
                            <input required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.make || ''} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('model')}</label>
                            <input required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Corolla" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('plate')}</label>
                            <input required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.plate || ''} onChange={e => setFormData({...formData, plate: e.target.value})} placeholder="123 TN 4567" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Year</label>
                            <input type="number" required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.year || ''} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('fuel_type')}</label>
                            <select className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value as any})}>
                                <option value="Diesel">Diesel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Electric">Electric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('mileage')}</label>
                            <input type="number" required className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.mileage} onChange={e => setFormData({...formData, mileage: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">{t('insurance_expiry')}</label>
                             <input type="date" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.insuranceExpiry || ''} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">{t('tech_check_expiry')}</label>
                             <input type="date" className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                                value={formData.technicalCheckExpiry || ''} onChange={e => setFormData({...formData, technicalCheckExpiry: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
      );
  };

  const ExpenseModal = () => {
      const [expData, setExpData] = useState<Partial<FleetExpense>>({ type: 'fuel', date: new Date().toISOString().split('T')[0] });
      
      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!expData.vehicleId) return alert("Select vehicle");
          addFleetExpense({
              id: `fe-${Date.now()}`,
              ...expData as any
          });
          setIsExpenseModalOpen(false);
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">Add Expense</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm mb-1 dark:text-gray-300">Vehicle</label>
                          <select required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              onChange={e => setExpData({...expData, vehicleId: e.target.value})}>
                              <option value="">Select...</option>
                              {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm mb-1 dark:text-gray-300">Type</label>
                          <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={expData.type} onChange={e => setExpData({...expData, type: e.target.value as any})}>
                              <option value="fuel">Fuel</option>
                              <option value="insurance">Insurance</option>
                              <option value="tax">Tax</option>
                              <option value="other">Other</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm mb-1 dark:text-gray-300">Amount</label>
                          <input type="number" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              onChange={e => setExpData({...expData, amount: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                          <label className="block text-sm mb-1 dark:text-gray-300">Description</label>
                          <input type="text" required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              onChange={e => setExpData({...expData, description: e.target.value})} />
                      </div>
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };
  
  const DocumentsModal = () => {
      const [newDoc, setNewDoc] = useState<Partial<FleetDocument>>({ type: 'insurance' });
      const docs = fleetDocuments.filter(d => d.vehicleId === selectedVehicleId);
      
      const handleAdd = () => {
          if (!newDoc.number) return;
          addFleetDocument({
              id: `fd-${Date.now()}`,
              vehicleId: selectedVehicleId,
              ...newDoc as any
          });
          setNewDoc({ type: 'insurance', number: '', expiryDate: '' });
      };

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
                  <div className="flex justify-between mb-4">
                     <h3 className="text-lg font-bold dark:text-white">Vehicle Documents</h3>
                     <button onClick={() => setIsDocumentModalOpen(false)}><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                      {docs.map(doc => (
                          <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div>
                                  <p className="font-medium text-sm dark:text-white capitalize">{doc.type} - {doc.number}</p>
                                  <p className="text-xs text-gray-500">Exp: {doc.expiryDate || 'N/A'}</p>
                              </div>
                              <button onClick={() => deleteFleetDocument(doc.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      ))}
                      {docs.length === 0 && <p className="text-sm text-gray-500 text-center">No documents found.</p>}
                  </div>

                  <div className="border-t pt-4 dark:border-gray-700">
                      <h4 className="text-sm font-bold mb-2 dark:text-gray-300">Add New Document</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                          <select className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                              value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value as any})}>
                              <option value="insurance">Insurance</option>
                              <option value="registration">Registration</option>
                              <option value="inspection">Inspection</option>
                              <option value="other">Other</option>
                          </select>
                          <input type="text" placeholder="Doc Number" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                              value={newDoc.number || ''} onChange={e => setNewDoc({...newDoc, number: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                          <input type="date" className="p-2 border rounded flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                              value={newDoc.expiryDate || ''} onChange={e => setNewDoc({...newDoc, expiryDate: e.target.value})} />
                          <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded text-sm">Add</button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };
  
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('fleet_management')} 🚗</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track vehicles, missions, and maintenance.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'vehicles' && (
              <>
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Search vehicles..." 
                        className="w-full max-w-md px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {renderVehiclesList()}
              </>
          )}
          {activeTab === 'missions' && renderMissions()}
          {activeTab === 'maintenance' && renderMaintenance()}
          {activeTab === 'costs' && renderCosts()}
      </div>

      {isVehicleModalOpen && <AddVehicleModal />}
      {isExpenseModalOpen && <ExpenseModal />}
      {isDocumentModalOpen && <DocumentsModal />}
      
      {/* Placeholder Modals for Mission/Maintenance (Logic is similar to add vehicle) */}
      {isMissionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4 dark:text-white">New Mission</h3>
                  <p className="text-gray-500 mb-4">Feature implementation: Select Vehicle, Driver, Dates, Destination.</p>
                  <div className="flex justify-end"><button onClick={() => setIsMissionModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button></div>
              </div>
          </div>
      )}
      {isMaintenanceModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
               <h3 className="text-lg font-bold mb-4 dark:text-white">Log Maintenance</h3>
               <p className="text-gray-500 mb-4">Feature implementation: Select Vehicle, Type, Cost, Date.</p>
               <div className="flex justify-end"><button onClick={() => setIsMaintenanceModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button></div>
           </div>
       </div>
      )}
    </div>
  );
};

export default FleetManagement;
