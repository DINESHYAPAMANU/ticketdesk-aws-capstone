import { Comment } from './comment.model';
import { Attachment } from './attachment.model';

export enum Category {
  Bug = 'Bug',
  Hardware = 'Hardware',
  Software = 'Software',
  Network = 'Network',
  Access = 'Access',
  Other = 'Other'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum Status {
  Open = 'Open',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: Category;
  categoryName: string;
  priority: Priority;
  priorityName: string;
  status: Status;
  statusName: string;
  createdById: number;
  createdByName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdDate: string;
  updatedDate?: string;
  commentsCount: number;
  hasAttachment: boolean;
}

export interface TicketDetail extends Ticket {
  comments: Comment[];
  attachment?: Attachment;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
}

export interface AssignTicketRequest {
  assignedToId: number;
}

export interface TicketSearchFilter {
  searchQuery?: string;
  category?: Category;
  priority?: Priority;
  status?: Status;
  createdById?: number;
  assignedToId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}
