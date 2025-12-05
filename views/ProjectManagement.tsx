
import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderKanban, Plus, Search, Filter, Calendar, Clock, Users, DollarSign,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, ChevronRight, X,
  Play, Pause, CheckSquare, ListTodo, Target, FileText, Timer, Wallet,
  Edit2, Trash2, Eye, MoreVertical, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, ProjectTask, ProjectTimeEntry, ProjectExpense, ProjectMilestone, Client, Employee } from '../types';

type ProjectsTab = 'dashboard' | 'projects' | 'tasks' | 'timesheet' | 'budget' | 'reports';

interface ProjectManagementProps {
  view?: string;
}

// Extracted Modal Components
interface ProjectModalProps {
  editingProject: string | null;
  projectForm: Partial<Project>;
  setProjectForm: (form: Partial<Project>) => void;
  clients: Client[];
  employees: Employee[];
  onClose: () => void;
  onSave: () => void;
}

const ProjectModalComponent: React.FC<ProjectModalProps> = React.memo(({
  editingProject,
  projectForm,
  setProjectForm,
  clients,
  employees,
  onClose,
  onSave
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">
          {editingProject ? 'Modifier le Projet' : 'Nouveau Projet'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Projet *</label>
            <input
              type="text"
              id="project-name"
              name="project-name"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.name || ''}
              onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
            <select
              id="project-client"
              name="project-client"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.clientId || ''}
              onChange={e => setProjectForm({ ...projectForm, clientId: e.target.value })}
            >
              <option value="">Projet interne</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chef de Projet</label>
            <select
              id="project-manager"
              name="project-manager"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.managerId || ''}
              onChange={e => setProjectForm({ ...projectForm, managerId: e.target.value })}
            >
              <option value="">Non assigné</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de Début *</label>
            <input
              type="date"
              id="project-start-date"
              name="project-start-date"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.startDate || ''}
              onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de Fin</label>
            <input
              type="date"
              id="project-end-date"
              name="project-end-date"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.endDate || ''}
              onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</label>
            <input
              type="number"
              id="project-budget"
              name="project-budget"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.budget || ''}
              onChange={e => setProjectForm({ ...projectForm, budget: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select
              id="project-status"
              name="project-status"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.status}
              onChange={e => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
            >
              <option value="planning">Planification</option>
              <option value="in_progress">En cours</option>
              <option value="on_hold">En pause</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
            <select
              id="project-priority"
              name="project-priority"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.priority}
              onChange={e => setProjectForm({ ...projectForm, priority: e.target.value as Project['priority'] })}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              id="project-description"
              name="project-description"
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={projectForm.description || ''}
              onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {editingProject ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </div>
  </div>
));

// Task Modal Component
interface TaskModalProps {
  editingTask: ProjectTask | null;
  taskForm: Partial<ProjectTask>;
  setTaskForm: (form: Partial<ProjectTask>) => void;
  projects: Project[];
  employees: Employee[];
  onClose: () => void;
  onSave: () => void;
}

const TaskModalComponent: React.FC<TaskModalProps> = React.memo(({
  editingTask,
  taskForm,
  setTaskForm,
  projects,
  employees,
  onClose,
  onSave
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">
          {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projet *</label>
            <select
              id="task-project"
              name="task-project"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.projectId || ''}
              onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
            >
              <option value="">Sélectionner un projet</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input
              type="text"
              id="task-title"
              name="task-title"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.title || ''}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigné à</label>
            <select
              id="task-assignee"
              name="task-assignee"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.assigneeId || ''}
              onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
            >
              <option value="">Non assigné</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'échéance</label>
            <input
              type="date"
              id="task-due-date"
              name="task-due-date"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.dueDate || ''}
              onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heures estimées</label>
            <input
              type="number"
              id="task-estimated-hours"
              name="task-estimated-hours"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.estimatedHours || ''}
              onChange={e => setTaskForm({ ...taskForm, estimatedHours: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
            <select
              id="task-priority"
              name="task-priority"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.priority}
              onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as ProjectTask['priority'] })}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select
              id="task-status"
              name="task-status"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.status}
              onChange={e => setTaskForm({ ...taskForm, status: e.target.value as ProjectTask['status'] })}
            >
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="review">En revue</option>
              <option value="completed">Terminée</option>
              <option value="blocked">Bloquée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              id="task-description"
              name="task-description"
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={taskForm.description || ''}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {editingTask ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </div>
  </div>
));

// Time Entry Modal Component
interface TimeEntryModalProps {
  timeEntryForm: Partial<ProjectTimeEntry>;
  setTimeEntryForm: (form: Partial<ProjectTimeEntry>) => void;
  projects: Project[];
  projectTasks: ProjectTask[];
  employees: Employee[];
  onClose: () => void;
  onSave: () => void;
}

const TimeEntryModalComponent: React.FC<TimeEntryModalProps> = React.memo(({
  timeEntryForm,
  setTimeEntryForm,
  projects,
  projectTasks,
  employees,
  onClose,
  onSave
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">Enregistrer du Temps</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projet *</label>
          <select
            id="time-entry-project"
            name="time-entry-project"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            value={timeEntryForm.projectId || ''}
            onChange={e => setTimeEntryForm({ ...timeEntryForm, projectId: e.target.value, taskId: undefined })}
          >
            <option value="">Sélectionner un projet</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {timeEntryForm.projectId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tâche</label>
            <select
              id="time-entry-task"
              name="time-entry-task"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={timeEntryForm.taskId || ''}
              onChange={e => setTimeEntryForm({ ...timeEntryForm, taskId: e.target.value })}
            >
              <option value="">Aucune tâche spécifique</option>
              {projectTasks.filter(t => t.projectId === timeEntryForm.projectId).map(t =>
                <option key={t.id} value={t.id}>{t.title}</option>
              )}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employé *</label>
          <select
            id="time-entry-employee"
            name="time-entry-employee"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            value={timeEntryForm.employeeId || ''}
            onChange={e => setTimeEntryForm({ ...timeEntryForm, employeeId: e.target.value })}
          >
            <option value="">Sélectionner un employé</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
            <input
              type="date"
              id="time-entry-date"
              name="time-entry-date"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={timeEntryForm.date || ''}
              onChange={e => setTimeEntryForm({ ...timeEntryForm, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heures *</label>
            <input
              type="number"
              step="0.5"
              id="time-entry-hours"
              name="time-entry-hours"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={timeEntryForm.hours || ''}
              onChange={e => setTimeEntryForm({ ...timeEntryForm, hours: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            id="time-entry-description"
            name="time-entry-description"
            rows={2}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            value={timeEntryForm.description || ''}
            onChange={e => setTimeEntryForm({ ...timeEntryForm, description: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="time-entry-billable"
            name="time-entry-billable"
            checked={timeEntryForm.billable ?? true}
            onChange={e => setTimeEntryForm({ ...timeEntryForm, billable: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="time-entry-billable" className="text-sm text-gray-700 dark:text-gray-300">Facturable</label>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
));

// Expense Modal Component
interface ExpenseModalProps {
  expenseForm: Partial<ProjectExpense>;
  setExpenseForm: (form: Partial<ProjectExpense>) => void;
  projects: Project[];
  onClose: () => void;
  onSave: () => void;
}

const ExpenseModalComponent: React.FC<ExpenseModalProps> = React.memo(({
  expenseForm,
  setExpenseForm,
  projects,
  onClose,
  onSave
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">Nouvelle Dépense</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projet *</label>
          <select
            id="expense-project"
            name="expense-project"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            value={expenseForm.projectId || ''}
            onChange={e => setExpenseForm({ ...expenseForm, projectId: e.target.value })}
          >
            <option value="">Sélectionner un projet</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
            <select
              id="expense-category"
              name="expense-category"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={expenseForm.category}
              onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as ProjectExpense['category'] })}
            >
              <option value="materials">Matériaux</option>
              <option value="equipment">Équipement</option>
              <option value="travel">Déplacement</option>
              <option value="subcontractor">Sous-traitance</option>
              <option value="software">Logiciel</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
            <input
              type="date"
              id="expense-date"
              name="expense-date"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={expenseForm.date || ''}
              onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
          <input
            type="text"
            id="expense-description"
            name="expense-description"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            value={expenseForm.description || ''}
            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant *</label>
            <input
              type="number"
              id="expense-amount"
              name="expense-amount"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={expenseForm.amount || ''}
              onChange={e => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fournisseur</label>
            <input
              type="text"
              id="expense-vendor"
              name="expense-vendor"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={expenseForm.vendorName || ''}
              onChange={e => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Créer
        </button>
      </div>
    </div>
  </div>
));

const ProjectManagement: React.FC<ProjectManagementProps> = ({ view }) => {
  const {
    projects, addProject, updateProject, deleteProject,
    projectTasks, addProjectTask, updateProjectTask, deleteProjectTask,
    projectTimeEntries, addProjectTimeEntry, updateProjectTimeEntry, deleteProjectTimeEntry,
    projectExpenses, addProjectExpense, updateProjectExpense, deleteProjectExpense,
    projectMilestones, addProjectMilestone, updateProjectMilestone, deleteProjectMilestone,
    clients, employees, formatCurrency, settings
  } = useApp();

  // Map view prop to tab
  const getTabFromView = (viewName?: string): ProjectsTab => {
    if (!viewName) return 'dashboard';
    if (viewName === 'projects' || viewName === 'projects-dashboard') return 'dashboard';
    if (viewName === 'projects-list') return 'projects';
    if (viewName === 'projects-tasks') return 'tasks';
    if (viewName === 'projects-timesheet') return 'timesheet';
    if (viewName === 'projects-budget') return 'budget';
    if (viewName === 'projects-reports') return 'reports';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<ProjectsTab>(getTabFromView(view));

  // Update tab when view prop changes
  useEffect(() => {
    setActiveTab(getTabFromView(view));
  }, [view]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [viewingProjectDetail, setViewingProjectDetail] = useState<Project | null>(null);

  // Stats calculations
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const totalSpent = projectExpenses.filter(e => e.status === 'approved' || e.status === 'reimbursed')
      .reduce((acc, e) => acc + e.amount, 0) +
      projectTimeEntries.filter(e => e.status === 'approved')
        .reduce((acc, e) => acc + (e.totalCost || 0), 0);
    const overdueTasks = projectTasks.filter(t =>
      t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    const totalHoursLogged = projectTimeEntries.reduce((acc, e) => acc + e.hours, 0);

    return { activeProjects, completedProjects, totalBudget, totalSpent, overdueTasks, totalHoursLogged };
  }, [projects, projectTasks, projectExpenses, projectTimeEntries]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Project form state
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    status: 'planning',
    priority: 'medium',
    budget: 0,
    progress: 0,
    currency: settings.currency
  });

  // Task form state
  const [taskForm, setTaskForm] = useState<Partial<ProjectTask>>({
    status: 'todo',
    priority: 'medium',
    progress: 0
  });

  // Time entry form state
  const [timeEntryForm, setTimeEntryForm] = useState<Partial<ProjectTimeEntry>>({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    billable: true,
    status: 'draft'
  });

  // Expense form state
  const [expenseForm, setExpenseForm] = useState<Partial<ProjectExpense>>({
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    status: 'pending',
    currency: settings.currency
  });

  const resetProjectForm = () => {
    setProjectForm({
      status: 'planning',
      priority: 'medium',
      budget: 0,
      progress: 0,
      currency: settings.currency
    });
    setEditingProject(null);
  };

  const resetTaskForm = () => {
    setTaskForm({
      status: 'todo',
      priority: 'medium',
      progress: 0
    });
    setEditingTask(null);
  };

  const handleSaveProject = () => {
    if (!projectForm.name || !projectForm.startDate) {
      alert('Veuillez remplir le nom et la date de début');
      return;
    }

    const selectedClient = clients.find(c => c.id === projectForm.clientId);
    const selectedManager = employees.find(e => e.id === projectForm.managerId);

    if (editingProject) {
      updateProject({
        ...editingProject,
        ...projectForm,
        clientName: selectedClient?.company,
        managerName: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : undefined,
        updatedAt: new Date().toISOString()
      } as Project);
    } else {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        code: `PRJ-${(projects.length + 1).toString().padStart(3, '0')}`,
        name: projectForm.name!,
        description: projectForm.description,
        clientId: projectForm.clientId,
        clientName: selectedClient?.company,
        managerId: projectForm.managerId,
        managerName: selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : undefined,
        startDate: projectForm.startDate!,
        endDate: projectForm.endDate,
        deadline: projectForm.deadline,
        budget: projectForm.budget || 0,
        currency: projectForm.currency || settings.currency,
        status: projectForm.status as Project['status'],
        priority: projectForm.priority as Project['priority'],
        progress: projectForm.progress || 0,
        category: projectForm.category,
        tags: projectForm.tags,
        teamMembers: projectForm.teamMembers,
        createdAt: new Date().toISOString(),
        notes: projectForm.notes
      };
      addProject(newProject);
    }

    setShowProjectModal(false);
    resetProjectForm();
  };

  const handleSaveTask = () => {
    if (!taskForm.title || !taskForm.projectId) {
      alert('Veuillez remplir le titre et sélectionner un projet');
      return;
    }

    const project = projects.find(p => p.id === taskForm.projectId);
    const assignee = employees.find(e => e.id === taskForm.assigneeId);

    if (editingTask) {
      updateProjectTask({
        ...editingTask,
        ...taskForm,
        projectName: project?.name || '',
        assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : undefined,
        updatedAt: new Date().toISOString()
      } as ProjectTask);
    } else {
      const projectTaskCount = projectTasks.filter(t => t.projectId === taskForm.projectId).length;
      const newTask: ProjectTask = {
        id: `task-${Date.now()}`,
        projectId: taskForm.projectId!,
        projectName: project?.name || '',
        code: `TSK-${(projectTaskCount + 1).toString().padStart(3, '0')}`,
        title: taskForm.title!,
        description: taskForm.description,
        assigneeId: taskForm.assigneeId,
        assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : undefined,
        startDate: taskForm.startDate,
        dueDate: taskForm.dueDate,
        estimatedHours: taskForm.estimatedHours,
        actualHours: 0,
        priority: taskForm.priority as ProjectTask['priority'],
        status: taskForm.status as ProjectTask['status'],
        progress: taskForm.progress || 0,
        tags: taskForm.tags,
        createdAt: new Date().toISOString()
      };
      addProjectTask(newTask);
    }

    setShowTaskModal(false);
    resetTaskForm();
  };

  const handleSaveTimeEntry = () => {
    if (!timeEntryForm.projectId || !timeEntryForm.employeeId || !timeEntryForm.hours) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const project = projects.find(p => p.id === timeEntryForm.projectId);
    const task = projectTasks.find(t => t.id === timeEntryForm.taskId);
    const employee = employees.find(e => e.id === timeEntryForm.employeeId);

    const newEntry: ProjectTimeEntry = {
      id: `time-${Date.now()}`,
      projectId: timeEntryForm.projectId!,
      projectName: project?.name || '',
      taskId: timeEntryForm.taskId,
      taskName: task?.title,
      employeeId: timeEntryForm.employeeId!,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
      date: timeEntryForm.date!,
      hours: timeEntryForm.hours!,
      description: timeEntryForm.description,
      billable: timeEntryForm.billable ?? true,
      hourlyRate: timeEntryForm.hourlyRate,
      totalCost: (timeEntryForm.hours || 0) * (timeEntryForm.hourlyRate || 0),
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    addProjectTimeEntry(newEntry);

    setShowTimeEntryModal(false);
    setTimeEntryForm({
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      billable: true,
      status: 'draft'
    });
  };

  const handleSaveExpense = () => {
    if (!expenseForm.projectId || !expenseForm.description || !expenseForm.amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const project = projects.find(p => p.id === expenseForm.projectId);

    const newExpense: ProjectExpense = {
      id: `exp-${Date.now()}`,
      projectId: expenseForm.projectId!,
      projectName: project?.name || '',
      taskId: expenseForm.taskId,
      category: expenseForm.category as ProjectExpense['category'],
      description: expenseForm.description!,
      amount: expenseForm.amount!,
      currency: expenseForm.currency || settings.currency,
      date: expenseForm.date!,
      vendorName: expenseForm.vendorName,
      invoiceNumber: expenseForm.invoiceNumber,
      status: 'pending',
      submittedBy: 'Current User',
      notes: expenseForm.notes,
      createdAt: new Date().toISOString()
    };
    addProjectExpense(newExpense);

    setShowExpenseModal(false);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      status: 'pending',
      currency: settings.currency
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'review': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'blocked': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-400';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getProjectStats = (projectId: string) => {
    const tasks = projectTasks.filter(t => t.projectId === projectId);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const timeEntries = projectTimeEntries.filter(e => e.projectId === projectId);
    const totalHours = timeEntries.reduce((acc, e) => acc + e.hours, 0);
    const expenses = projectExpenses.filter(e => e.projectId === projectId && (e.status === 'approved' || e.status === 'reimbursed'));
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const laborCost = timeEntries.reduce((acc, e) => acc + (e.totalCost || 0), 0);
    return { completedTasks, totalTasks, totalHours, totalExpenses, laborCost, totalCost: totalExpenses + laborCost };
  };

  // Project Detail View
  const ProjectDetailView = ({ project }: { project: Project }) => {
    const projectStats = getProjectStats(project.id);
    const tasks = projectTasks.filter(t => t.projectId === project.id);
    const timeEntries = projectTimeEntries.filter(e => e.projectId === project.id);
    const expenses = projectExpenses.filter(e => e.projectId === project.id);
    const pendingExpenses = expenses.filter(e => e.status === 'pending');
    const approvedExpenses = expenses.filter(e => e.status === 'approved' || e.status === 'reimbursed');

    const progressPercent = projectStats.totalTasks > 0
      ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)
      : project.progress;
    const budgetUsed = project.budget > 0 ? (projectStats.totalCost / project.budget) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewingProjectDetail(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Retour aux projets"
          >
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-400">{project.code}</span>
              <h2 className="text-2xl font-bold dark:text-white">{project.name}</h2>
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status === 'planning' ? 'Planification' :
                 project.status === 'in_progress' ? 'En cours' :
                 project.status === 'on_hold' ? 'En pause' :
                 project.status === 'completed' ? 'Terminé' : 'Annulé'}
              </span>
            </div>
            {project.clientName && <p className="text-sm text-gray-500 mt-1">{project.clientName}</p>}
            {project.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{project.description}</p>}
          </div>
          <button
            onClick={() => {
              setEditingProject(project);
              setProjectForm(project);
              setShowProjectModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
          >
            <Edit2 className="w-4 h-4" /> Modifier
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avancement</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{progressPercent}%</h3>
                <p className="text-xs text-gray-400 mt-1">{projectStats.completedTasks}/{projectStats.totalTasks} tâches complétées</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(project.budget)}</h3>
                <p className={`text-xs mt-1 ${budgetUsed > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {budgetUsed.toFixed(0)}% utilisé
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Temps Consommé</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{projectStats.totalHours.toFixed(1)}h</h3>
                <p className="text-xs text-gray-400 mt-1">{timeEntries.length} entrée(s)</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dépenses</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(projectStats.totalCost)}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {approvedExpenses.length} approuvée(s), {pendingExpenses.length} en attente
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-600" /> Tâches du Projet
            </h3>
            <button
              onClick={() => {
                resetTaskForm();
                setTaskForm({ ...taskForm, projectId: project.id });
                setShowTaskModal(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Nouvelle Tâche
            </button>
          </div>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Aucune tâche pour ce projet</p>
            ) : (
              tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                return (
                  <div key={task.id} className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => {
                            if (task.status !== 'completed') {
                              updateProjectTask({ ...task, status: 'completed', completedDate: new Date().toISOString().split('T')[0], progress: 100 });
                            }
                          }}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-gray-400">{task.code}</span>
                            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'dark:text-white'}`}>
                              {task.title}
                            </h4>
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getTaskStatusColor(task.status)}`}>
                              {task.status === 'todo' ? 'À faire' :
                               task.status === 'in_progress' ? 'En cours' :
                               task.status === 'review' ? 'En revue' :
                               task.status === 'completed' ? 'Terminée' :
                               task.status === 'blocked' ? 'Bloquée' : 'Annulée'}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {task.assigneeName && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {task.assigneeName}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                                <Calendar className="w-3 h-3" /> {task.dueDate}
                              </span>
                            )}
                            {task.estimatedHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {task.actualHours || 0}/{task.estimatedHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setTaskForm(task);
                          setShowTaskModal(true);
                        }}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Time Entries Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-indigo-600" /> Temps Consommé
            </h3>
            <button
              onClick={() => {
                setTimeEntryForm({ ...timeEntryForm, projectId: project.id });
                setShowTimeEntryModal(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Enregistrer du Temps
            </button>
          </div>
          {timeEntries.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucune entrée de temps pour ce projet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tâche</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employé</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Heures</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Coût</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {timeEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm dark:text-white">{entry.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{entry.taskName || '-'}</td>
                      <td className="px-4 py-3 text-sm dark:text-white">{entry.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-right dark:text-white">{entry.hours}h</td>
                      <td className="px-4 py-3 text-sm text-right dark:text-white">
                        {entry.totalCost ? formatCurrency(entry.totalCost) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          entry.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          entry.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          entry.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {entry.status === 'draft' ? 'Brouillon' :
                           entry.status === 'submitted' ? 'Soumis' :
                           entry.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" /> Dépenses du Projet
            </h3>
            <button
              onClick={() => {
                setExpenseForm({ ...expenseForm, projectId: project.id });
                setShowExpenseModal(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Nouvelle Dépense
            </button>
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Budget Total</p>
              <p className="text-lg font-bold dark:text-white">{formatCurrency(project.budget)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Dépensé</p>
              <p className={`text-lg font-bold ${projectStats.totalCost > project.budget ? 'text-red-500' : 'dark:text-white'}`}>
                {formatCurrency(projectStats.totalCost)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Restant</p>
              <p className={`text-lg font-bold ${project.budget - projectStats.totalCost < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(project.budget - projectStats.totalCost)}
              </p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucune dépense pour ce projet</p>
          ) : (
            <div className="space-y-2">
              {expenses.map(expense => (
                <div key={expense.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium dark:text-white">{expense.description}</h5>
                        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">
                          {expense.category === 'materials' ? 'Matériaux' :
                           expense.category === 'equipment' ? 'Équipement' :
                           expense.category === 'travel' ? 'Déplacement' :
                           expense.category === 'subcontractor' ? 'Sous-traitance' :
                           expense.category === 'software' ? 'Logiciel' : 'Autre'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          expense.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          expense.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {expense.status === 'pending' ? 'En attente' :
                           expense.status === 'approved' ? 'Approuvé' :
                           expense.status === 'rejected' ? 'Rejeté' : 'Remboursé'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Date: {expense.date}</span>
                        {expense.vendorName && <span>Fournisseur: {expense.vendorName}</span>}
                        {expense.invoiceNumber && <span>Facture: {expense.invoiceNumber}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold dark:text-white">{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Dashboard Tab
  const DashboardTab = () => {
    const pendingExpenses = projectExpenses.filter(e => e.status === 'pending');
    const totalPendingAmount = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);

    return (
      <div className="space-y-6">
        {/* Pending Expenses Alert */}
        {pendingExpenses.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-300">
                    {pendingExpenses.length} dépense(s) en attente d'approbation
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Montant total: {formatCurrency(totalPendingAmount)} - Ces dépenses doivent être approuvées pour être imputées au budget des projets.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('budget')}
                className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 flex items-center gap-1 whitespace-nowrap"
              >
                Gérer <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Projets Actifs</p>
              <h3 className="text-2xl font-bold mt-1 dark:text-white">{stats.activeProjects}</h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats.completedProjects} terminés</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tâches en Retard</p>
              <h3 className="text-2xl font-bold mt-1 text-red-500">{stats.overdueTasks}</h3>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Nécessitent une attention</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Heures Enregistrées</p>
              <h3 className="text-2xl font-bold mt-1 dark:text-white">{stats.totalHoursLogged.toFixed(1)}h</h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Ce mois</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Budget vs. Dépenses</p>
              <h3 className="text-xl font-bold mt-1 dark:text-white">{formatCurrency(stats.totalSpent)}</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">sur {formatCurrency(stats.totalBudget)} budgété</p>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg dark:text-white">Projets en Cours</h3>
          <button
            onClick={() => { resetProjectForm(); setShowProjectModal(true); }}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Nouveau Projet
          </button>
        </div>
        <div className="space-y-3">
          {projects.filter(p => p.status === 'in_progress').slice(0, 5).map(project => {
            const projectStats = getProjectStats(project.id);
            const progressPercent = projectStats.totalTasks > 0
              ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)
              : project.progress;
            return (
              <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{project.code}</span>
                      <h4 className="font-medium dark:text-white">{project.name}</h4>
                    </div>
                    {project.clientName && <p className="text-xs text-gray-500 mt-0.5">{project.clientName}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(project.status)}`}>
                      En cours
                    </span>
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setProjectForm(project);
                        setShowProjectModal(true);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Modifier le projet"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" /> {projectStats.completedTasks}/{projectStats.totalTasks} tâches
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {projectStats.totalHours.toFixed(1)}h
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {formatCurrency(projectStats.totalCost)} / {formatCurrency(project.budget)}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Avancement</span>
                    <span className="font-medium dark:text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {projects.filter(p => p.status === 'in_progress').length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucun projet en cours</p>
          )}
        </div>
      </div>

      {/* Overdue Tasks */}
      {stats.overdueTasks > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Tâches en Retard
          </h3>
          <div className="space-y-2">
            {projectTasks.filter(t =>
              t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate && new Date(t.dueDate) < new Date()
            ).slice(0, 5).map(task => (
              <div key={task.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm dark:text-white">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.projectName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 dark:text-red-400">Échéance: {task.dueDate}</p>
                  {task.assigneeName && <p className="text-xs text-gray-400">{task.assigneeName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    );
  };

  // Projects Tab
  const ProjectsTab = () => {
    // If viewing project detail, show the detail view
    if (viewingProjectDetail) {
      return <ProjectDetailView project={viewingProjectDetail} />;
    }

    return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="planning">Planification</option>
          <option value="in_progress">En cours</option>
          <option value="on_hold">En pause</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
        </select>
        <button
          onClick={() => { resetProjectForm(); setShowProjectModal(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Nouveau Projet
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => {
          const projectStats = getProjectStats(project.id);
          const progressPercent = projectStats.totalTasks > 0
            ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)
            : project.progress;
          const budgetUsed = project.budget > 0 ? (projectStats.totalCost / project.budget) * 100 : 0;

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-mono text-gray-400">{project.code}</span>
                  <h4 className="font-bold text-gray-900 dark:text-white mt-0.5">{project.name}</h4>
                  {project.clientName && (
                    <p className="text-xs text-gray-500 mt-1">{project.clientName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status === 'planning' ? 'Planification' :
                     project.status === 'in_progress' ? 'En cours' :
                     project.status === 'on_hold' ? 'En pause' :
                     project.status === 'completed' ? 'Terminé' : 'Annulé'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingProjectDetail(project);
                    }}
                    className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Vue d'ensemble"
                  >
                    <Eye className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                      setProjectForm(project);
                      setShowProjectModal(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Modifier le projet"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
                        deleteProject(project.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer le projet"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{project.description}</p>

              <div className="space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Avancement</span>
                    <span className="font-medium dark:text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Budget utilisé</span>
                    <span className={`font-medium ${budgetUsed > 100 ? 'text-red-500' : 'dark:text-white'}`}>
                      {budgetUsed.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" /> {projectStats.completedTasks}/{projectStats.totalTasks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {projectStats.totalHours.toFixed(0)}h
                  </span>
                </div>
                {project.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {project.deadline}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun projet trouvé</p>
        </div>
      )}
    </div>
    );
  };

  // Tasks Tab
  const TasksTab = () => {
    const [taskFilter, setTaskFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');

    const filteredTasks = projectTasks.filter(t => {
      const matchesStatus = taskFilter === 'all' || t.status === taskFilter;
      const matchesProject = projectFilter === 'all' || t.projectId === projectFilter;
      return matchesStatus && matchesProject;
    });

    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
          >
            <option value="all">Tous les projets</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
            value={taskFilter}
            onChange={e => setTaskFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="review">En revue</option>
            <option value="completed">Terminée</option>
            <option value="blocked">Bloquée</option>
          </select>
          <div className="flex-1" />
          <button
            onClick={() => { resetTaskForm(); setShowTaskModal(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Nouvelle Tâche
          </button>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
              return (
                <div key={task.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isOverdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          if (task.status !== 'completed') {
                            updateProjectTask({ ...task, status: 'completed', completedDate: new Date().toISOString().split('T')[0], progress: 100 });
                          }
                        }}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400">{task.code}</span>
                          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'dark:text-white'}`}>
                            {task.title}
                          </h4>
                          <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{task.projectName}</p>
                        {task.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${getTaskStatusColor(task.status)}`}>
                        {task.status === 'todo' ? 'À faire' :
                         task.status === 'in_progress' ? 'En cours' :
                         task.status === 'review' ? 'En revue' :
                         task.status === 'completed' ? 'Terminée' :
                         task.status === 'blocked' ? 'Bloquée' : 'Annulée'}
                      </span>
                      <button
                        onClick={() => { setEditingTask(task); setTaskForm(task); setShowTaskModal(true); }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 ml-8 text-xs text-gray-500">
                    {task.assigneeName && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {task.assigneeName}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                        <Calendar className="w-3 h-3" /> {task.dueDate}
                      </span>
                    )}
                    {task.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.actualHours || 0}/{task.estimatedHours}h
                      </span>
                    )}
                    {task.progress > 0 && task.progress < 100 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {task.progress}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune tâche trouvée</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Timesheet Tab
  const TimesheetTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg dark:text-white">Suivi du Temps</h3>
        <button
          onClick={() => setShowTimeEntryModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Enregistrer du Temps
        </button>
      </div>

      {/* Time Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Projet</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tâche</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Heures</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Coût</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {projectTimeEntries.slice(0, 20).map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm dark:text-white">{entry.date}</td>
                  <td className="px-4 py-3 text-sm dark:text-white">{entry.projectName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.taskName || '-'}</td>
                  <td className="px-4 py-3 text-sm dark:text-white">{entry.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-right dark:text-white">{entry.hours}h</td>
                  <td className="px-4 py-3 text-sm text-right dark:text-white">
                    {entry.totalCost ? formatCurrency(entry.totalCost) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                      entry.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                      entry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.status === 'draft' ? 'Brouillon' :
                       entry.status === 'submitted' ? 'Soumis' :
                       entry.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {projectTimeEntries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Timer className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune entrée de temps</p>
          </div>
        )}
      </div>
    </div>
  );

  // Budget Tab
  const BudgetTab = () => {
    const pendingExpenses = projectExpenses.filter(e => e.status === 'pending');
    const approvedExpenses = projectExpenses.filter(e => e.status === 'approved' || e.status === 'reimbursed');
    const totalPending = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalApproved = approvedExpenses.reduce((acc, e) => acc + e.amount, 0);

    const handleApproveExpense = (expense: ProjectExpense) => {
      updateProjectExpense({
        ...expense,
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString()
      });
    };

    const handleRejectExpense = (expense: ProjectExpense) => {
      if (confirm('Êtes-vous sûr de vouloir rejeter cette dépense ?')) {
        updateProjectExpense({
          ...expense,
          status: 'rejected',
          approvedBy: 'Current User',
          approvedAt: new Date().toISOString()
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg dark:text-white">Suivi des Coûts et Budget</h3>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Nouvelle Dépense
          </button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget Total</p>
            <h3 className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(stats.totalBudget)}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Dépenses Approuvées</p>
            <h3 className="text-2xl font-bold mt-1 text-orange-500">{formatCurrency(totalApproved)}</h3>
            <p className="text-xs text-gray-400 mt-1">{approvedExpenses.length} dépense(s)</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">En Attente</p>
            <h3 className="text-2xl font-bold mt-1 text-yellow-500">{formatCurrency(totalPending)}</h3>
            <p className="text-xs text-gray-400 mt-1">{pendingExpenses.length} dépense(s)</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Restant</p>
            <h3 className={`text-2xl font-bold mt-1 ${stats.totalBudget - stats.totalSpent < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {formatCurrency(stats.totalBudget - stats.totalSpent)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {stats.totalBudget > 0 ? Math.round(((stats.totalBudget - stats.totalSpent) / stats.totalBudget) * 100) : 0}% disponible
            </p>
          </div>
        </div>

        {/* Pending Expenses for Approval */}
        {pendingExpenses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h4 className="font-bold dark:text-white">Dépenses en Attente d'Approbation ({pendingExpenses.length})</h4>
            </div>
            <div className="space-y-3">
              {pendingExpenses.map(expense => {
                const project = projects.find(p => p.id === expense.projectId);
                return (
                  <div key={expense.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium dark:text-white">{expense.description}</h5>
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
                            {expense.category === 'materials' ? 'Matériaux' :
                             expense.category === 'equipment' ? 'Équipement' :
                             expense.category === 'travel' ? 'Déplacement' :
                             expense.category === 'subcontractor' ? 'Sous-traitance' :
                             expense.category === 'software' ? 'Logiciel' : 'Autre'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          Projet: <span className="font-medium">{expense.projectName}</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Date: {expense.date}</span>
                          {expense.vendorName && <span>Fournisseur: {expense.vendorName}</span>}
                          {expense.invoiceNumber && <span>Facture: {expense.invoiceNumber}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right mr-3">
                          <p className="text-xl font-bold dark:text-white">{formatCurrency(expense.amount)}</p>
                          {project && (
                            <p className="text-xs text-gray-500">
                              Budget: {formatCurrency(project.budget)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleApproveExpense(expense)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approuver
                        </button>
                        <button
                          onClick={() => handleRejectExpense(expense)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> Rejeter
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-bold dark:text-white">Toutes les Dépenses</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Projet</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {projectExpenses.map(expense => {
                  const project = projects.find(p => p.id === expense.projectId);
                  const budgetImpact = project ? (expense.amount / project.budget) * 100 : 0;

                  return (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm dark:text-white">{expense.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium dark:text-white">{expense.projectName}</p>
                          {expense.status === 'approved' && project && (
                            <p className="text-xs text-gray-500">
                              Impact: {budgetImpact.toFixed(1)}% du budget
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
                          {expense.category === 'materials' ? 'Matériaux' :
                           expense.category === 'equipment' ? 'Équipement' :
                           expense.category === 'travel' ? 'Déplacement' :
                           expense.category === 'subcontractor' ? 'Sous-traitance' :
                           expense.category === 'software' ? 'Logiciel' : 'Autre'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div>
                          <p>{expense.description}</p>
                          {expense.vendorName && (
                            <p className="text-xs text-gray-400">Fournisseur: {expense.vendorName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium dark:text-white">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            expense.status === 'approved' || expense.status === 'reimbursed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {expense.status === 'pending' ? 'En attente' :
                             expense.status === 'approved' ? 'Approuvé' :
                             expense.status === 'reimbursed' ? 'Remboursé' : 'Rejeté'}
                          </span>
                          {expense.approvedBy && (
                            <p className="text-xs text-gray-400">par {expense.approvedBy}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {expense.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveExpense(expense)}
                                className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                                title="Approuver et imputer au budget"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectExpense(expense)}
                                className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                                title="Rejeter"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
                                deleteProjectExpense(expense.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {projectExpenses.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune dépense enregistrée</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Reports Tab
  const ReportsTab = () => {
    const projectsWithStats = projects.map(p => ({
      ...p,
      ...getProjectStats(p.id)
    }));

    return (
      <div className="space-y-6">
        <h3 className="font-bold text-lg dark:text-white">Rapports et Analyses</h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Total Projets</p>
            <h3 className="text-2xl font-bold mt-1 dark:text-white">{projects.length}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Total Tâches</p>
            <h3 className="text-2xl font-bold mt-1 dark:text-white">{projectTasks.length}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Taux de Complétion</p>
            <h3 className="text-2xl font-bold mt-1 text-green-500">
              {projectTasks.length > 0
                ? Math.round((projectTasks.filter(t => t.status === 'completed').length / projectTasks.length) * 100)
                : 0}%
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Heures Totales</p>
            <h3 className="text-2xl font-bold mt-1 dark:text-white">{stats.totalHoursLogged.toFixed(0)}h</h3>
          </div>
        </div>

        {/* Projects Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-bold dark:text-white">Performance des Projets</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Projet</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tâches</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Heures</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dépenses</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {projectsWithStats.map(project => {
                  const margin = project.budget - project.totalCost;
                  const marginPercent = project.budget > 0 ? (margin / project.budget) * 100 : 0;
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium dark:text-white">{project.name}</p>
                          <p className="text-xs text-gray-500">{project.code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(project.status)}`}>
                          {project.status === 'planning' ? 'Planification' :
                           project.status === 'in_progress' ? 'En cours' :
                           project.status === 'on_hold' ? 'En pause' :
                           project.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center dark:text-white">
                        {project.completedTasks}/{project.totalTasks}
                      </td>
                      <td className="px-4 py-3 text-right dark:text-white">{project.totalHours.toFixed(1)}h</td>
                      <td className="px-4 py-3 text-right dark:text-white">{formatCurrency(project.budget)}</td>
                      <td className="px-4 py-3 text-right dark:text-white">{formatCurrency(project.totalCost)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${margin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(margin)}
                        </span>
                        <span className={`text-xs ml-1 ${marginPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ({marginPercent >= 0 ? '+' : ''}{marginPercent.toFixed(0)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const tabs: { id: ProjectsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'projects', label: 'Projets', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tâches', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'timesheet', label: 'Temps', icon: <Timer className="w-4 h-4" /> },
    { id: 'budget', label: 'Budget', icon: <Wallet className="w-4 h-4" /> },
    { id: 'reports', label: 'Rapports', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-indigo-600" /> Gestion de Projets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Planifier, suivre et contrôler vos projets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'timesheet' && <TimesheetTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>

      {/* Modals */}
      {showProjectModal && (
        <ProjectModalComponent
          editingProject={editingProject}
          projectForm={projectForm}
          setProjectForm={setProjectForm}
          clients={clients}
          employees={employees}
          onClose={() => { setShowProjectModal(false); resetProjectForm(); }}
          onSave={handleSaveProject}
        />
      )}
      {showTaskModal && (
        <TaskModalComponent
          editingTask={editingTask}
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          projects={projects}
          employees={employees}
          onClose={() => { setShowTaskModal(false); resetTaskForm(); }}
          onSave={handleSaveTask}
        />
      )}
      {showTimeEntryModal && (
        <TimeEntryModalComponent
          timeEntryForm={timeEntryForm}
          setTimeEntryForm={setTimeEntryForm}
          projects={projects}
          projectTasks={projectTasks}
          employees={employees}
          onClose={() => setShowTimeEntryModal(false)}
          onSave={handleSaveTimeEntry}
        />
      )}
      {showExpenseModal && (
        <ExpenseModalComponent
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
          projects={projects}
          onClose={() => setShowExpenseModal(false)}
          onSave={handleSaveExpense}
        />
      )}
    </div>
  );
};

export default ProjectManagement;
