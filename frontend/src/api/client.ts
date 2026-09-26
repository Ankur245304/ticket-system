/**
 * Support Ticket System - API Client Module
 *
 * This module handles all HTTP interactions with the backend REST API.
 * It provides strongly typed methods for fetching, creating, updating,
 * and transitioning tickets, as well as managing ticket comments.
 */

/** Possible lifecycle states for a support ticket enforced by the state machine */
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

/** Priority levels for categorizing ticket urgency */
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/** Interface representing a comment associated with a ticket */
export interface Comment {
  id: number;
  author: string;
  body: string;
  createdAt: string;
}

/** Complete Support Ticket entity structure returned by the backend */
export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

/** Payload structure for creating a new ticket */
export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: Priority;
  assignee?: string;
}

/** Payload structure for updating an existing ticket's details */
export interface UpdateTicketPayload {
  title: string;
  description: string;
  priority: Priority;
  assignee?: string;
}

/** Payload structure for posting a comment */
export interface AddCommentPayload {
  author: string;
  body: string;
}

/**
 * Base API endpoint URL.
 * Defaults to the versioned REST endpoint `/api/v1/support-tickets` on localhost:8080.
 * Can be overridden at runtime via the `VITE_API_URL` environment variable.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1/support-tickets';

/**
 * Generic request wrapper around the native Fetch API.
 * Automatically injects JSON headers, handles JSON serialization/deserialization,
 * and extracts standard API error envelopes ({ code, message, fields }).
 *
 * @param path Relative path suffix appended to BASE_URL (e.g. "/1/status")
 * @param init Standard RequestInit options (method, headers, body)
 * @returns Parsed JSON response of type T
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  // Attempt to parse JSON response body
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Empty or non-JSON body
  }

  // Handle HTTP error responses
  if (!response.ok) {
    const error = new Error(data?.message ?? `Request failed with status ${response.status}`) as Error & {
      fields?: Record<string, string>;
      code?: string;
      status?: number;
    };
    error.fields = data?.fields;
    error.code = data?.code;
    error.status = response.status;
    throw error;
  }

  return data as T;
}

/**
 * API Service Object
 * Exposes methods matching the RESTful endpoints for the Support Ticket system.
 */
export const api = {
  /**
   * Retrieves tickets using a keyword matched against title, description, and
   * assignee, with an optional status filter.
   * Calls: GET /api/v1/support-tickets?search={keyword}&status={status}
   */
  list: (keyword: string = '', status: string = ''): Promise<Ticket[]> => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('search', keyword.trim());
    if (status.trim()) params.append('status', status.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Ticket[]>(query);
  },

  /**
   * Retrieves a single support ticket by its ID, including full comment history.
   * Calls: GET /api/v1/support-tickets/{id}
   */
  get: (id: number): Promise<Ticket> => {
    return request<Ticket>(`/${id}`);
  },

  /**
   * Creates a new support ticket. Status starts as 'OPEN'.
   * Calls: POST /api/v1/support-tickets
   */
  create: (payload: CreateTicketPayload): Promise<Ticket> => {
    return request<Ticket>('', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Updates an existing ticket's title, description, priority, and assignee.
   * Calls: PUT /api/v1/support-tickets/{id}
   */
  update: (id: number, payload: UpdateTicketPayload): Promise<Ticket> => {
    return request<Ticket>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Transitions a ticket to a new status according to backend state machine rules.
   * Calls: PATCH /api/v1/support-tickets/{id}/status
   */
  status: (id: number, status: Status): Promise<Ticket> => {
    return request<Ticket>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  /**
   * Adds a new comment to an existing ticket.
   * Calls: POST /api/v1/support-tickets/{id}/comments
   */
  comment: (id: number, payload: AddCommentPayload): Promise<Comment> => {
    return request<Comment>(`/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
