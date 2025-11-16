// ============================================
// FILE: src/stores/contactStore.ts
// Contact state management
// ============================================

import { create } from 'zustand';
import type { Contact } from '@/types/user.types';

interface ContactState {
  contacts: Contact[];
  pendingRequests: Contact[];
  selectedContact: Contact | null;

  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;

  setPendingRequests: (requests: Contact[]) => void;
  addPendingRequest: (request: Contact) => void;
  removePendingRequest: (requestId: string) => void;

  setSelectedContact: (contact: Contact | null) => void;

  clearContacts: () => void;
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  pendingRequests: [],
  selectedContact: null,

  setContacts: (contacts) => set({ contacts }),

  addContact: (contact) =>
    set((state) => ({
      contacts: [...state.contacts, contact],
    })),

  removeContact: (contactId) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== contactId),
    })),

  updateContact: (contactId, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === contactId ? { ...c, ...updates } : c)),
    })),

  setPendingRequests: (requests) => set({ pendingRequests: requests }),

  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [...state.pendingRequests, request],
    })),

  removePendingRequest: (requestId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r.id !== requestId),
    })),

  setSelectedContact: (contact) => set({ selectedContact: contact }),

  clearContacts: () =>
    set({
      contacts: [],
      pendingRequests: [],
      selectedContact: null,
    }),
}));