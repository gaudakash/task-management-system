/**
 * Task Form Component — Handles both creating and editing tasks.
 * 
 * CONCEPT: Modal Pattern
 * A modal is a dialog that overlays the current page.
 * Instead of navigating to a new page, we show a form "on top of" the dashboard.
 * 
 * CONCEPT: Lifting State Up
 * The parent (Dashboard) controls whether the modal is open/closed
 * and passes callbacks (onSubmit, onClose) to the child (TaskForm).
 * This pattern keeps the parent in control of the data flow.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TaskForm({ task, users, onSubmit, onClose }) {
  // If 'task' prop exists → editing mode. Otherwise → creating mode.
  const isEditing = !!task;
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    task_type: 'personal',
    assigned_to_id: '',
  });

  const [error, setError] = useState('');

  /**
   * CONCEPT: useEffect for Initialization
   * When editing, pre-fill the form with existing task data.
   * useEffect runs AFTER the component renders.
   * The dependency array [task] means it re-runs when 'task' changes.
   */
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        task_type: task.task_type || 'personal',
        assigned_to_id: task.assigned_to?.id || '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // If switching to personal, clear assignee
      if (name === 'task_type' && value === 'personal') {
        newData.assigned_to_id = '';
      }
      return newData;
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.task_type === 'assigned' && !formData.assigned_to_id) {
      setError('Please select a user to assign this task to');
      return;
    }

    // Prepare data for API
    const submitData = { ...formData };
    if (submitData.task_type === 'personal') {
      delete submitData.assigned_to_id;
    }
    if (submitData.assigned_to_id) {
      submitData.assigned_to_id = parseInt(submitData.assigned_to_id);
    }
    if (!submitData.due_date) {
      submitData.due_date = null;
    }

    onSubmit(submitData);
  };

  /**
   * Determine which fields the current user can edit.
   * This mirrors the backend permission logic on the frontend
   * for a better user experience (disable fields they can't change).
   */
  const getEditableFields = () => {
    if (!isEditing) return 'all'; // Creating — all fields editable
    
    if (task.task_type === 'personal') {
      if (task.creator?.id === currentUser?.id) return 'all';
      return 'none';
    }
    
    if (task.task_type === 'assigned') {
      if (task.assigned_to?.id === currentUser?.id) return 'status_only';
      if (task.creator?.id === currentUser?.id) return 'due_date_only';
      return 'none';
    }
    
    return 'none';
  };

  const editableFields = getEditableFields();

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* CONCEPT: stopPropagation prevents the click from reaching the overlay */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {editableFields === 'status_only' && (
          <div className="alert alert-info">
            ℹ️ As the assignee, you can only update the task status.
          </div>
        )}

        {editableFields === 'due_date_only' && (
          <div className="alert alert-info">
            ℹ️ As the assigner, you can only update the due date.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              disabled={editableFields === 'status_only' || editableFields === 'due_date_only'}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task..."
              rows={3}
              disabled={editableFields === 'status_only' || editableFields === 'due_date_only'}
            />
          </div>

          <div className="form-row">
            {/* Status */}
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={editableFields === 'due_date_only'}
              >
                <option value="todo">📋 Todo</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={editableFields === 'status_only' || editableFields === 'due_date_only'}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Due Date */}
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={editableFields === 'status_only'}
              />
            </div>

            {/* Task Type — only when creating */}
            {!isEditing && (
              <div className="form-group">
                <label>Task Type</label>
                <select
                  name="task_type"
                  value={formData.task_type}
                  onChange={handleChange}
                >
                  <option value="personal">👤 Personal</option>
                  <option value="assigned">👥 Assign to Someone</option>
                </select>
              </div>
            )}
          </div>

          {/* Assign To — shown only for assigned tasks during creation */}
          {!isEditing && formData.task_type === 'assigned' && (
            <div className="form-group">
              <label>Assign To *</label>
              <select
                name="assigned_to_id"
                value={formData.assigned_to_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a user...</option>
                {users?.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}