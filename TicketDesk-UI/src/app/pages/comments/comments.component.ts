import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comments-section">
      <h5 class="fw-bold text-dark mb-3">
        <i class="bi bi-chat-left-text-fill me-2 text-primary"></i>
        Discussion & Activity ({{ comments().length }})
      </h5>

      <!-- Add Comment Form -->
      <div class="card border-0 bg-light p-3 mb-4 rounded-3">
        <div class="mb-2">
          <textarea 
            rows="3" 
            class="form-control bg-white" 
            placeholder="Write a comment or status update..." 
            [(ngModel)]="newCommentText"
          ></textarea>
        </div>
        <div class="d-flex justify-content-end">
          <button 
            type="button" 
            class="btn btn-primary btn-sm px-4 rounded-pill d-flex align-items-center gap-2"
            [disabled]="loading() || !newCommentText.trim()"
            (click)="onAddComment()"
          >
            @if (loading()) {
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            } @else {
              <i class="bi bi-send"></i>
              <span>Post Comment</span>
            }
          </button>
        </div>
      </div>

      <!-- Comments Timeline List -->
      <div class="comments-list d-flex flex-column gap-3">
        @for (comment of comments(); track comment.id) {
          <div class="card glass-card border-0 p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small">
                  {{ comment.userName.substring(0, 1) }}
                </div>
                <div>
                  <span class="fw-semibold text-dark small d-block leading-none">{{ comment.userName }}</span>
                  <span class="text-muted fs-xs">{{ comment.createdDate | date:'medium' }}</span>
                </div>
              </div>

              @if (canDelete(comment)) {
                <button type="button" class="btn btn-sm btn-link text-danger p-0" (click)="onDeleteComment(comment.id)" title="Delete Comment">
                  <i class="bi bi-trash"></i>
                </button>
              }
            </div>
            
            <p class="text-slate-700 mb-0 small ps-4 ms-2 border-start border-2 border-primary-subtle">
              {{ comment.content }}
            </p>
          </div>
        } @empty {
          <div class="text-center text-muted py-4 small">
            No comments posted yet. Be the first to start the discussion!
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm {
      width: 32px;
      height: 32px;
    }
    .fs-xs {
      font-size: 0.75rem;
    }
    .text-slate-700 {
      color: #334155;
    }
  `]
})
export class CommentsComponent implements OnInit {
  @Input() ticketId!: number;

  comments = signal<Comment[]>([]);
  newCommentText = '';
  loading = signal<boolean>(false);

  constructor(
    private commentService: CommentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.ticketId) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.commentService.getCommentsByTicketId(this.ticketId).subscribe({
      next: (data) => this.comments.set(data),
      error: (err) => console.error('Failed to load comments', err)
    });
  }

  onAddComment(): void {
    if (!this.newCommentText.trim()) return;

    this.loading.set(true);

    this.commentService.createComment(this.ticketId, {
      content: this.newCommentText.trim()
    }).subscribe({
      next: () => {
        this.newCommentText = '';
        this.loading.set(false);
        this.loadComments();
      },
      error: (err) => {
        this.loading.set(false);
        alert(err.error?.message || 'Failed to post comment.');
      }
    });
  }

  onDeleteComment(commentId: number): void {
    if (confirm('Delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => this.loadComments(),
        error: (err) => alert(err.error?.message || 'Failed to delete comment.')
      });
    }
  }

  canDelete(comment: Comment): boolean {
    const currentUserId = this.authService.currentUser()?.userId;
    return this.authService.isAdmin() || comment.userId === currentUserId;
  }
}
