/**
 * Task Card Component — Displays a single task with actions.
 * 
 * CONCEPT: Component Composition
 * Each task is rendered as a "card" — a self-contained UI component.
 * The parent (TaskList) maps over an array of tasks and renders
 * one TaskCard for each. This is the "map pattern" in React.
 */

import { useAuth } from '../context/AuthContext';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { user: currentUser } = useAuth();
  
  // Determine user's role for this task
  const isCreator = task.creator?.id === currentUser?.id;
  const isAssignee = task.assigned_to?.id === currentUser?.id;
  const isPersonal = task.task_type === 'personal';

  // Status badge styling
  const statusConfig = {
    todo: { label: '📋 Todo', className: 'status-todo' },
    in_progress: { label: '🔄 In Progress', className: 'status-progress' },
    done: { label: '✅ Done', className: 'status-done' },
  };

  // Priority badge styling  
  const priorityConfig = {
    low: { label: '🟢 Low', className: 'priority-low' },
    medium: { label: '🟡 Medium', className: 'priority-medium' },
    high: { label: '🔴 High', className: 'priority-high' },
  };

  const statusInfo = statusConfig[task.status] || statusConfig.todo;
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;

  /**
   * Quick status change buttons for assignees.
   * Instead of opening the full edit form, they can click a button.
   */
  const handleQuickStatusChange = (newStatus) => {
    onStatusChange(task.id, { status: newStatus });
  };

  // Check if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div className={`task-card ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-badges">
          <span className={`badge ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
          <span className={`badge ${priorityInfo.className}`}>
            {priorityInfo.label}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.due_date && (
          <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
            📅 {new Date(task.due_date).toLocaleDateString()}
            {isOverdue && ' (Overdue!)'}
          </span>
        )}
        
        <span className="task-type-badge">
          {isPersonal ? '👤 Personal' : '👥 Assigned'}
        </span>
      </div>

      {/* Show assignment info for assigned tasks */}
      {!isPersonal && (
        <div className="task-assignment">
          {isCreator && task.assigned_to && (
            <span>📤 Assigned to: <strong>{task.assigned_to.first_name} {task.assigned_to.last_name}</strong></span>
          )}
          {isAssignee && (
            <span>📥 Assigned by: <strong>{task.creator.first_name} {task.creator.last_name}</strong></span>
          )}
        </div>
      )}

      {/* Action buttons — shown based on permissions */}
      <div className="task-actions">
        {/* Assignee quick status change */}
        {!isPersonal && isAssignee && (
          <div className="status-buttons">
            {['todo', 'in_progress', 'done'].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${task.status === s ? 'btn-active' : 'btn-outline'}`}
                onClick={() => handleQuickStatusChange(s)}
                disabled={task.status === s}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
        )}
        
        {/* Edit button */}
        {(isPersonal && isCreator) || (!isPersonal && (isCreator || isAssignee)) ? (
          <button className="btn btn-sm btn-outline" onClick={() => onEdit(task)}>
            ✏️ Edit
          </button>
        ) : null}
        
        {/* Delete button — only creator can delete */}
        {isCreator && (
          <button 
            className="btn btn-sm btn-danger" 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
              }
            }}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}