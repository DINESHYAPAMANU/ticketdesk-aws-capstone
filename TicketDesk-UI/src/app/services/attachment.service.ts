import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Attachment } from '../models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  uploadAttachment(ticketId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Attachment>(`${this.apiUrl}/${ticketId}/attachments`, formData);
  }

  downloadAttachment(ticketId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ticketId}/attachments/download`, {
      responseType: 'blob'
    });
  }

  deleteAttachment(ticketId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ticketId}/attachments`);
  }
}
