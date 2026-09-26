/**
 * Support Ticket System - Main Application Component
 *
 * This file serves as the main user interface for the Support Ticket POC.
 * It provides a complete ticket management dashboard including:
 * - Metrics overview (Total, Open, In Progress, Resolved/Closed)
 * - Search by keyword and filtering by status & priority
 * - Interactive ticket list with status & priority badges
 * - Ticket creation form with client validation
 * - Detailed view modal with:
 *     - Full ticket attributes and metadata
 *     - State machine transition workflow enforcement
 *     - Inline ticket editing capabilities
 *     - Discussion comments timeline with new comment posting
 * - Comprehensive error handling and user feedback alerts
 */

import React, { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  api,
  Ticket,
  Status,
  Priority,
  CreateTicketPayload,
  UpdateTicketPayload
} from './api/client';
import './styles.css';

/** Available ticket statuses recognized by the system */
const ALL_STATUSES: Status[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'];

/** Available ticket priority levels */
const ALL_PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/**
 * State machine allowed transitions map.
 * Authoritative business rules:
 * - OPEN can transition to IN_PROGRESS or CANCELLED
 * - IN_PROGRESS can transition to RESOLVED or CANCELLED
 * - RESOLVED can transition to CLOSED
 * - CLOSED and CANCELLED are terminal states (no further transitions)
 */
const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: []
};

/**
 * Friendly action labels for status transitions
 */
const TRANSITION_LABELS: Record<Status, string> = {
  OPEN: 'Reopen Ticket',
  IN_PROGRESS: 'Start Progress',
  RESOLVED: 'Resolve Ticket',
  CLOSED: 'Close Ticket',
  CANCELLED: 'Cancel Ticket'
};

/**
 * Format date string into human-readable format
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Extract initials from author or assignee name for display avatars
 */
function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Main Application Component
 */
function App() {
  // -------------------------------------------------------------
  // Application State
  // -------------------------------------------------------------

  /** Full list of tickets loaded from the backend API */
  const [tickets, setTickets] = useState<Ticket[]>([]);

  /** Currently selected ticket for detailed modal view */
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  /** Search keyword filter (applied against title, description, and assignee) */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /** Status filter dropdown selection */
  const [statusFilter, setStatusFilter] = useState<string>('');

  /** Priority filter dropdown selection */
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  /** Global error message displayed in alert banner */
  const [errorMessage, setErrorMessage] = useState<string>('');

  /** Success notification message */
  const [successMessage, setSuccessMessage] = useState<string>('');

  /** Loading indicator for API operations */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** Submitting state for create form */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /** Flag to toggle edit mode in detail modal */
  const [isEditing, setIsEditing] = useState<boolean>(false);

  /** Form state for creating a new ticket */
  const [createForm, setCreateForm] = useState<CreateTicketPayload>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignee: ''
  });

  /** Form state for editing an existing ticket inside the modal */
  const [editForm, setEditForm] = useState<UpdateTicketPayload>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignee: ''
  });

  /** Form state for adding comments inside the modal */
  const [commentForm, setCommentForm] = useState<{ author: string; body: string }>({
    author: '',
    body: ''
  });

  // -------------------------------------------------------------
  // Data Fetching and Synchronization
  // -------------------------------------------------------------

  /**
   * Fetches the ticket list from backend REST API using current search and status filters.
   */
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.list(searchQuery, statusFilter);
      setTickets(data);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch tickets from server.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect hook: Reload tickets whenever search query or status filter changes.
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      loadTickets();
    }, 200); // 200ms debounce for smoother searching

    return () => clearTimeout(handler);
  }, [searchQuery, statusFilter]);

  /**
   * Refreshes the currently selected ticket data and syncs it with the list.
   */
  const refreshSelectedTicket = async (ticketId: number) => {
    try {
      const updated = await api.get(ticketId);
      setSelectedTicket(updated);
      setEditForm({
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        assignee: updated.assignee ?? ''
      });
      // Also refresh the background ticket list
      loadTickets();
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to refresh ticket #${ticketId}`);
    }
  };

  // -------------------------------------------------------------
  // Computed Metrics & Filtered Data
  // -------------------------------------------------------------

  /** Dashboard metrics calculated from ticket list */
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = tickets.filter((t) => t.status === 'CLOSED').length;
    return { total, open, inProgress, resolved, closed };
  }, [tickets]);

  /** Tickets filtered by client-side priority filter (if active) */
  const displayedTickets = useMemo(() => {
    if (!priorityFilter) return tickets;
    return tickets.filter((t) => t.priority === priorityFilter);
  }, [tickets, priorityFilter]);

  // -------------------------------------------------------------
  // Event Handlers: Ticket Operations
  // -------------------------------------------------------------

  /**
   * Handles creation of a new ticket.
   */
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const payload: CreateTicketPayload = {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        priority: createForm.priority,
        assignee: createForm.assignee?.trim() || undefined
      };

      const newTicket = await api.create(payload);

      // Reset form on success
      setCreateForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignee: ''
      });

      setSuccessMessage(`Ticket #${newTicket.id} created successfully!`);
      await loadTickets();
      // Open the newly created ticket in the modal
      setSelectedTicket(newTicket);
      setEditForm({
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        assignee: newTicket.assignee ?? ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles opening a ticket into detail modal
   */
  const handleOpenTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditing(false);
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      assignee: ticket.assignee ?? ''
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  /**
   * Handles saving edited ticket attributes (title, description, priority, assignee).
   */
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setErrorMessage('');

    try {
      const payload: UpdateTicketPayload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
        assignee: editForm.assignee?.trim() || undefined
      };

      await api.update(selectedTicket.id, payload);
      setIsEditing(false);
      setSuccessMessage('Ticket details updated successfully.');
      await refreshSelectedTicket(selectedTicket.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update ticket.');
    }
  };

  /**
   * Handles state machine transitions for the currently selected ticket.
   * Validates if transition is allowed before submitting to backend.
   */
  const handleTransitionStatus = async (nextStatus: Status) => {
    if (!selectedTicket) return;
    setErrorMessage('');

    try {
      await api.status(selectedTicket.id, nextStatus);
      setSuccessMessage(`Ticket status transitioned to ${nextStatus}.`);
      await refreshSelectedTicket(selectedTicket.id);
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to transition status to ${nextStatus}.`);
    }
  };

  /**
   * Handles adding a new comment to the currently selected ticket.
   */
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!commentForm.author.trim() || !commentForm.body.trim()) return;
    setErrorMessage('');

    try {
      await api.comment(selectedTicket.id, {
        author: commentForm.author.trim(),
        body: commentForm.body.trim()
      });

      // Clear comment inputs
      setCommentForm({ author: '', body: '' });
      setSuccessMessage('Comment added successfully.');
      await refreshSelectedTicket(selectedTicket.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add comment.');
    }
  };

  // -------------------------------------------------------------
  // UI Render
  // -------------------------------------------------------------

  return (
    <div className="app-container">
      {/* -------------------------------------------------------- */}
      {/* 1. Header & Navigation Banner */}
      {/* -------------------------------------------------------- */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">DeskFlow Support Hub</h1>
              <p className="brand-subtitle">Enterprise Ticket Management &amp; State Machine POC</p>
            </div>
          </div>

          <div className="header-badges">
            <span className="badge-pill live-indicator">
              <span className="pulse-dot"></span> REST v1 Connected
            </span>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------- */}
      {/* 2. Global Feedback Alerts (Error / Success) */}
      {/* -------------------------------------------------------- */}
      <div className="alerts-container">
        {errorMessage && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-body">
              <strong>Error:</strong> {errorMessage}
            </div>
            <button
              className="alert-close"
              onClick={() => setErrorMessage('')}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            <span className="alert-icon">✓</span>
            <div className="alert-body">{successMessage}</div>
            <button
              className="alert-close"
              onClick={() => setSuccessMessage('')}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* 3. Dashboard Metrics Overview */}
      {/* -------------------------------------------------------- */}
      <section className="metrics-section">
        <div
          className={`metric-card ${statusFilter === '' ? 'metric-card-active' : ''}`}
          onClick={() => setStatusFilter('')}
          title="Click to view all tickets"
        >
          <div className="metric-label">All Tickets</div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-desc">Total across all states</div>
        </div>

        <div
          className={`metric-card metric-card-open ${statusFilter === 'OPEN' ? 'metric-card-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'OPEN' ? '' : 'OPEN')}
          title="Click to filter OPEN tickets"
        >
          <div className="metric-label">Open</div>
          <div className="metric-value text-blue">{metrics.open}</div>
          <div className="metric-desc">Awaiting triage &amp; action</div>
        </div>

        <div
          className={`metric-card metric-card-progress ${statusFilter === 'IN_PROGRESS' ? 'metric-card-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? '' : 'IN_PROGRESS')}
          title="Click to filter IN_PROGRESS tickets"
        >
          <div className="metric-label">In Progress</div>
          <div className="metric-value text-amber">{metrics.inProgress}</div>
          <div className="metric-desc">Currently being addressed</div>
        </div>

        <div
          className={`metric-card metric-card-resolved ${statusFilter === 'RESOLVED' ? 'metric-card-active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? '' : 'RESOLVED')}
          title="Click to filter RESOLVED tickets"
        >
          <div className="metric-label">Resolved / Closed</div>
          <div className="metric-value text-emerald">{metrics.resolved + metrics.closed}</div>
          <div className="metric-desc">Successfully completed</div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 4. Main Two-Column Layout (Create Card + Ticket Browser) */}
      {/* -------------------------------------------------------- */}
      <main className="dashboard-grid">
        {/* Left Column: Create Ticket Form */}
        <aside className="sidebar-column">
          <div className="card form-card">
            <div className="card-header">
              <h2 className="card-title">Create Ticket</h2>
              <p className="card-subtitle">Log a new support issue into the system</p>
            </div>

            <form onSubmit={handleCreateTicket} className="ticket-form">
              <div className="form-group">
                <label htmlFor="create-title" className="form-label">
                  Title <span className="required">*</span>
                </label>
                <input
                  id="create-title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="e.g. Database connection timeout"
                  className="form-input"
                  value={createForm.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                />
                <span className="char-count">{createForm.title.length}/200</span>
              </div>

              <div className="form-group">
                <label htmlFor="create-description" className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="create-description"
                  required
                  maxLength={5000}
                  rows={4}
                  placeholder="Detailed explanation of the issue, symptoms, and impact..."
                  className="form-textarea"
                  value={createForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                />
                <span className="char-count">{createForm.description.length}/5000</span>
              </div>

              <div className="form-group">
                <label htmlFor="create-priority" className="form-label">
                  Priority <span className="required">*</span>
                </label>
                <select
                  id="create-priority"
                  className="form-select"
                  value={createForm.priority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCreateForm({ ...createForm, priority: e.target.value as Priority })
                  }
                >
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p} Priority
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="create-assignee" className="form-label">
                  Assignee <span className="optional">(optional)</span>
                </label>
                <input
                  id="create-assignee"
                  type="text"
                  maxLength={200}
                  placeholder="e.g. John Doe"
                  className="form-input"
                  value={createForm.assignee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateForm({ ...createForm, assignee: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Ticket...' : '+ Create Ticket'}
              </button>
            </form>
          </div>
        </aside>

        {/* Right Column: Search, Filter, and Ticket List */}
        <section className="content-column">
          {/* Search & Filter Toolbar */}
          <div className="toolbar-card">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search title, description, or assignee..."
                className="search-input"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-controls">
              {/* Status Filter */}
              <div className="select-wrapper">
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setStatusFilter(e.target.value)
                  }
                  className="filter-select"
                  aria-label="Filter by Status"
                >
                  <option value="">All Statuses</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="select-wrapper">
                <select
                  value={priorityFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setPriorityFilter(e.target.value)
                  }
                  className="filter-select"
                  aria-label="Filter by Priority"
                >
                  <option value="">All Priorities</option>
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset active filters */}
              {(statusFilter || priorityFilter || searchQuery) && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setSearchQuery('');
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Ticket List Header */}
          <div className="list-header">
            <span className="list-count">
              Showing <strong>{displayedTickets.length}</strong> {displayedTickets.length === 1 ? 'ticket' : 'tickets'}
            </span>
            {isLoading && <span className="loading-tag">Updating...</span>}
          </div>

          {/* Ticket List Display */}
          {isLoading && tickets.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching support tickets from server...</p>
            </div>
          ) : displayedTickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tickets found</h3>
              <p>No support tickets match your current filter criteria.</p>
              {(statusFilter || priorityFilter || searchQuery) && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="ticket-cards-grid">
              {displayedTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="ticket-card"
                  onClick={() => handleOpenTicket(ticket)}
                >
                  <div className="ticket-card-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <div className="ticket-badges">
                      <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                        <span className="badge-dot"></span>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>

                  <h3 className="ticket-card-title">{ticket.title}</h3>

                  <p className="ticket-card-snippet">
                    {ticket.description.length > 120
                      ? `${ticket.description.substring(0, 120)}...`
                      : ticket.description}
                  </p>

                  <div className="ticket-card-footer">
                    <div className="ticket-assignee">
                      <span className="avatar-circle">
                        {getInitials(ticket.assignee)}
                      </span>
                      <span className="assignee-name">
                        {ticket.assignee || 'Unassigned'}
                      </span>
                    </div>

                    <div className="ticket-meta-info">
                      {ticket.comments && ticket.comments.length > 0 && (
                        <span className="comments-count" title={`${ticket.comments.length} comments`}>
                          💬 {ticket.comments.length}
                        </span>
                      )}
                      <span className="ticket-date">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* -------------------------------------------------------- */}
      {/* 5. Ticket Detail & State Machine Workflow Modal */}
      {/* -------------------------------------------------------- */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div
            className="modal-container"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-ticket-id">#{selectedTicket.id}</span>
                <h2 className="modal-ticket-title">
                  {isEditing ? 'Edit Ticket' : selectedTicket.title}
                </h2>
              </div>
              <div className="modal-header-actions">
                {!isEditing && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Edit
                  </button>
                )}
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedTicket(null)}
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              {/* State Machine Transition Workflow Actions */}
              <div className="workflow-card">
                <div className="workflow-header">
                  <span className="workflow-label">Current Status:</span>
                  <span className={`status-badge status-${selectedTicket.status.toLowerCase()}`}>
                    <span className="badge-dot"></span>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="workflow-actions">
                  <span className="workflow-subtext">Allowed Transitions:</span>
                  {ALLOWED_TRANSITIONS[selectedTicket.status].length === 0 ? (
                    <span className="terminal-state-text">
                      🔒 Terminal State — No further transitions allowed
                    </span>
                  ) : (
                    <div className="transition-buttons-group">
                      {ALLOWED_TRANSITIONS[selectedTicket.status].map((targetStatus) => (
                        <button
                          key={targetStatus}
                          className={`btn btn-sm btn-transition btn-transition-${targetStatus.toLowerCase()}`}
                          onClick={() => handleTransitionStatus(targetStatus)}
                        >
                          → {TRANSITION_LABELS[targetStatus] || targetStatus}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Details / Edit Form */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="edit-form-card">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      required
                      maxLength={200}
                      className="form-input"
                      value={editForm.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      required
                      maxLength={5000}
                      rows={5}
                      className="form-textarea"
                      value={editForm.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group form-col">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={editForm.priority}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setEditForm({ ...editForm, priority: e.target.value as Priority })
                        }
                      >
                        {ALL_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group form-col">
                      <label className="form-label">Assignee</label>
                      <input
                        maxLength={200}
                        placeholder="Unassigned"
                        className="form-input"
                        value={editForm.assignee}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditForm({ ...editForm, assignee: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="edit-form-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="ticket-detail-view">
                  <div className="ticket-detail-meta">
                    <div className="meta-item">
                      <span className="meta-label">Priority</span>
                      <span className={`priority-badge priority-${selectedTicket.priority.toLowerCase()}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Assignee</span>
                      <span className="meta-value">
                        {selectedTicket.assignee || 'Unassigned'}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Created</span>
                      <span className="meta-value">
                        {formatDate(selectedTicket.createdAt)}
                      </span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-label">Last Updated</span>
                      <span className="meta-value">
                        {formatDate(selectedTicket.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="ticket-detail-description">
                    <h4 className="detail-section-title">Description</h4>
                    <p className="description-text">{selectedTicket.description}</p>
                  </div>
                </div>
              )}

              {/* Comments & Discussion Section */}
              <div className="comments-section">
                <h3 className="comments-heading">
                  Activity &amp; Comments ({selectedTicket.comments?.length || 0})
                </h3>

                <div className="comments-timeline">
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                    <p className="no-comments-msg">
                      No comments recorded yet. Add the first update below.
                    </p>
                  ) : (
                    selectedTicket.comments.map((comment) => (
                      <div key={comment.id} className="comment-bubble">
                        <div className="comment-header">
                          <span className="comment-avatar">
                            {getInitials(comment.author)}
                          </span>
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-time">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="comment-body">{comment.body}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="comment-form-card">
                  <h4 className="comment-form-title">Add Comment</h4>
                  <div className="form-group">
                    <input
                      required
                      maxLength={100}
                      placeholder="Your Name / Handle"
                      className="form-input"
                      value={commentForm.author}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCommentForm({ ...commentForm, author: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      required
                      maxLength={5000}
                      rows={3}
                      placeholder="Type your notes or response here..."
                      className="form-textarea"
                      value={commentForm.body}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCommentForm({ ...commentForm, body: e.target.value })
                      }
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary btn-sm">
                    Post Comment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mount the React application to the DOM root element
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
