import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Ticket, 
  TicketDetail, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  AssignTicketRequest, 
  TicketSearchFilter, 
  PaginatedResponse 
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/Ticket`;

  constructor(private http: HttpClient) {}

  getTickets(filter: TicketSearchFilter = {}): Observable<PaginatedResponse<Ticket>> {
    let params = new HttpParams();
    if (filter.searchQuery) params = params.set('searchQuery', filter.searchQuery);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.createdById) params = params.set('createdById', filter.createdById.toString());
    if (filter.assignedToId) params = params.set('assignedToId', filter.assignedToId.toString());
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<PaginatedResponse<Ticket>>(this.apiUrl, { params });
  }

  getTicketById(id: number): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${this.apiUrl}/${id}`);
  }

  createTicket(data: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, data);
  }

  updateTicket(id: number, data: UpdateTicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, data);
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTicket(id: number, data: AssignTicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}/assign`, data);
  }
}
