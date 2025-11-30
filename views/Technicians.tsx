
import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Technician } from '../types';

const Technicians: React.FC = () => {
  const { technicians, addTechnician, updateTechnician, deleteTechnician, t } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTech: Technician = {
      id: editingTech ? editingTech.id : `tech-${Date.now()}`,
      name: formData.get('name') as string,
      specialty: formData.get('specialty') as string,
      status: formData.get('status') as any,
      phone: formData.get('phone') as string
    };

    if (editingTech) updateTechnician(newTech);
    else addTechnician(newTech);
    
    setIsModalOpen(false);
    setEditingTech(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this technician?")) deleteTechnician(id);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'busy': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('technicians')} 👨‍🔧</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('technicians_desc')}</p>
        </div>
        <button 
          onClick={() => { setEditingTech(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('add_technician')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map(tech => (
          <div 
            key={tech.id} 
            className={`
              p-6 rounded-xl border shadow-sm relative group transition-all
              ${tech.status === 'available' 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}
            `}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tech.status === 'available' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{tech.name}</h3>
                <p className="text-sm text-gray-500">{tech.specialty}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(tech.status)}`}>
                {t(tech.status)}
              </span>
              <span className="text-sm text-gray-500">{tech.phone}</span>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingTech(tech); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-indigo-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(tech.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingTech ? t('edit_technician') : t('add_technician')}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('full_name')}</label>
                <input name="name" defaultValue={editingTech?.name} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('specialty')}</label>
                <input name="specialty" defaultValue={editingTech?.specialty} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
                <input name="phone" defaultValue={editingTech?.phone} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                <select name="status" defaultValue={editingTech?.status || 'available'} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white">
                  <option value="available">{t('available')}</option>
                  <option value="busy">{t('busy')}</option>
                  <option value="off_duty">{t('off_duty')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicians;
