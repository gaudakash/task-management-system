/**
 * Dashboard Page — The main view showing all user's tasks.
 * 
 * CONCEPT: Container/Presentational Pattern
 * Dashboard is a "container" component — it manages STATE and DATA FETCHING.
 * It passes data down to "presentational" components (TaskCard, TaskForm)
 * which just render UI based on props.
 * 
 * CONCEPT: useEffect for Data Fetching
 * useEffect with [] (empty dependency array) runs ONCE after first render.
 * This is where we fetch initial data from the API.
 */

import { useState, useEffect, useCallback } from 'react';
import { taskAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

export default function Dashboard() {
  // State management
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, personal, assigned_to_me, assigned_by_me
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const { user: currentUser } = useAuth();

  /**
   * CONCEPT: useCallback
   * Memoizes the function so it's not recreated on every render.
   * Without useCallback, fetchTasks would be a new function object each render,
   * which could cause infinite loops if used in useEffect dependencies.
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.list();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  /**
   * Create a new task
   */
  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.create(taskData);
      setShowForm(false);
      fetchTasks(); // Refresh the list
    } catch (err) {
      console.error('Error creating task:', err);
      alert(err.response?.data?.detail || 'Failed to create task');
    }
  };

  /**
   * Update an existing task
   */
  const handleUpdateTask = async (taskData) => {
    try {
      await taskAPI.update(editingTask.id, taskData);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      alert(err.response?.data?.error || err.response?.data?.detail || 'Failed to update task');
    }
  };

  /**
   * Quick status update (for assignees)
   */
  const handleStatusChange = async (taskId, statusData) => {
    try {
      await taskAPI.update(taskId, statusData);
      fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  /**
   * CONCEPT: Derived State (Filtering)
   * Instead of storing filtered tasks in state, we COMPUTE them from the
   * full task list + filter criteria. This avoids sync issues and follows
   * the React principle: "derive state, don't duplicate it."
   */
  const filteredTasks = tasks.filter(task => {
    // Category filter
    if (filter === 'personal' && task.task_type !== 'personal') return false;
    if (filter === 'assigned_to_me' && task.assigned_to?.id !== currentUser?.id) return false;
    if (filter === 'assigned_by_me' && (task.task_type !== 'assigned' || task.creator?.id !== currentUser?.id)) return false;
    
    // Status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    return true;
  });

  // Task count stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  // ============ RENDER ============

  // CONCEPT: Loading State — show spinner while data is being fetched
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with stats */}
      <div className="dashboard-header">
        <div>
          <h2>My Tasks</h2>
          <p className="dashboard-subtitle">
            Welcome back, {currentUser?.first_name || currentUser?.username}!
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingTask(null); setShowForm(true); }}
        >
          ➕ New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-todo">
          <span className="stat-number">{stats.todo}</span>
          <span className="stat-label">📋 Todo</span>
        </div>
        <div className="stat-card stat-progress">
          <span className="stat-number">{stats.inProgress}</span>
          <span className="stat-label">🔄 In Progress</span>
        </div>
        <div className="stat-card stat-done">
          <span className="stat-number">{stats.done}</span>
          <span className="stat-label">✅ Done</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Category:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="personal">Personal</option>
            <option value="assigned_to_me">Assigned to Me</option>
            <option value="assigned_by_me">Assigned by Me</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priority:</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={fetchTasks} className="btn btn-sm btn-outline" style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        /* CONCEPT: Empty State — always show a helpful message when there's no data */
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tasks found</h3>
          <p>
            {tasks.length === 0
              ? "You don't have any tasks yet. Create your first one!"
              : "No tasks match the current filters. Try changing your filters."
            }
          </p>
          {tasks.length === 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => { setEditingTask(null); setShowForm(true); }}
            >
              ➕ Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className="task-grid">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}