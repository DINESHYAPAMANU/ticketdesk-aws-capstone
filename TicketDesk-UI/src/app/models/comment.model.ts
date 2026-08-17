export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  content: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
