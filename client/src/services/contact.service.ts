// ============================================
// FILE: src/services/contact.service.ts
// Contact management service
// ============================================

import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { Contact } from '@/types/user.types';

export interface SendContactRequestPayload {
  email: string;
}

export interface AddContactByQRPayload {
  qrData: string;
}

class ContactService {
  async getContacts(): Promise<ApiResponse<Contact[]>> {
    const response = await apiClient.get<ApiResponse<Contact[]>>('/contacts');
    return response.data;
  }

  async getPendingRequests(): Promise<ApiResponse<Contact[]>> {
    const response = await apiClient.get<ApiResponse<Contact[]>>('/contacts/pending');
    return response.data;
  }

  async sendRequest(payload: SendContactRequestPayload): Promise<ApiResponse<Contact>> {
    const response = await apiClient.post<ApiResponse<Contact>>('/contacts/request', payload);
    return response.data;
  }

  async acceptRequest(contactId: string): Promise<ApiResponse<Contact>> {
    const response = await apiClient.put<ApiResponse<Contact>>(
      `/contacts/${contactId}/accept`
    );
    return response.data;
  }

  async blockContact(contactId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.put<ApiResponse<void>>(`/contacts/${contactId}/block`);
    return response.data;
  }

  async deleteContact(contactId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/contacts/${contactId}`);
    return response.data;
  }

  async addContactByQR(payload: AddContactByQRPayload): Promise<ApiResponse<Contact>> {
    const response = await apiClient.post<ApiResponse<Contact>>('/contacts/qr', payload);
    return response.data;
  }
}

export const contactService = new ContactService();