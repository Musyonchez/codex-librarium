'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { styles } from '@/lib/design-system';
import { BookRequest, BookRequestStatus } from '@/lib/types';

type SubTab = 'pending' | 'approved' | 'waitlist' | 'refused';

export default function RequestsDashboardPage() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>('pending');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<BookRequestStatus>('pending');
  const [refusalComment, setRefusalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create request modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestAuthor, setNewRequestAuthor] = useState('');
  const [newRequestType, setNewRequestType] = useState('single');
  const [newRequestInfo, setNewRequestInfo] = useState('');

  useEffect(() => {
    fetchRequests();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/import/check-admin');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/requests');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
    setLoading(false);
  };

  const getRequestsByTab = (tab: SubTab) => {
    let filtered = requests.filter(r => r.status === tab);

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const handleStatusChange = async () => {
    if (!selectedRequest) return;

    if (newStatus === 'refused' && !refusalComment.trim()) {
      alert('Refusal comment is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          refusalComment: newStatus === 'refused' ? refusalComment : undefined
        })
      });

      if (response.ok) {
        await fetchRequests();
        setShowStatusModal(false);
        setSelectedRequest(null);
        setRefusalComment('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
    setIsSubmitting(false);
  };

  const openStatusModal = (request: BookRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setRefusalComment(request.refusal_comment || '');
    setShowStatusModal(true);
  };

  const handleCreateRequest = async () => {
    if (!newRequestTitle.trim() || !newRequestAuthor.trim()) {
      alert('Title and author are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRequestTitle,
          author: newRequestAuthor,
          bookType: newRequestType,
          additionalInfo: newRequestInfo
        })
      });

      if (response.ok) {
        await fetchRequests();
        setShowCreateModal(false);
        setNewRequestTitle('');
        setNewRequestAuthor('');
        setNewRequestType('single');
        setNewRequestInfo('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    }
    setIsSubmitting(false);
  };

  const getUsernameFromEmail = (email: string | undefined) => {
    if (!email) return 'Unknown';
    return email.split('@')[0];
  };

  const renderRequestCard = (request: BookRequest) => (
    <div key={request.id} className={`${styles.card} p-4 space-y-3`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>
            {request.title}
          </h3>
          <p className={`text-sm ${styles.textSecondary}`}>by {request.author}</p>
          <p className={`text-xs ${styles.textSecondary} mt-1`}>
            Type: {request.book_type}
          </p>
          {request.additional_info && (
            <p className={`text-sm ${styles.textSecondary} mt-2`}>
              {request.additional_info}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={() => openStatusModal(request)}
            className={`px-3 py-1 rounded ${styles.btnPrimary} text-sm`}
          >
            Change Status
          </button>
        )}
      </div>

      <div className={`text-xs ${styles.textSecondary} pt-2 border-t border-slate-700`}>
        <p>Requested: {new Date(request.created_at).toLocaleDateString()}</p>
      </div>

      {/* Show refusal comment if it exists */}
      {request.status === 'refused' && request.refusal_comment && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded">
          <p className={`text-sm ${styles.textPrimary} font-semibold mb-1`}>Refusal Reason:</p>
          <p className={`text-sm ${styles.textSecondary}`}>{request.refusal_comment}</p>
          {request.refusal_comment_created_by && (
            <p className={`text-xs ${styles.textSecondary} mt-2`}>
              Created by: {getUsernameFromEmail(request.refusal_comment_created_by)}
              {request.refusal_comment_updated_by && (
                <span> • Last edited by: {getUsernameFromEmail(request.refusal_comment_updated_by)}</span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const currentRequests = getRequestsByTab(activeTab);

  const subTabs = [
    { id: 'pending' as SubTab, label: 'Requests', count: getRequestsByTab('pending').length },
    { id: 'approved' as SubTab, label: 'Approved', count: getRequestsByTab('approved').length },
    { id: 'waitlist' as SubTab, label: 'Waitlist', count: getRequestsByTab('waitlist').length },
    { id: 'refused' as SubTab, label: 'Refused', count: getRequestsByTab('refused').length },
  ];

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">Book Requests</h1>
            <p className="text-slate-400">
              Manage user book requests
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.btnPrimary}
          >
            + New Request
          </button>
        </div>

        {/* Sub-tabs for request statuses */}
        <div className="border-b border-slate-700 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${styles.textGold} border-b-2 border-[#D4AF37]`
                    : `${styles.textSecondary} hover:${styles.textPrimary}`
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Sort controls */}
        {activeTab === 'pending' && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSortOrder('newest')}
              className={`px-3 py-1 rounded text-sm ${
                sortOrder === 'newest' ? styles.btnPrimary : styles.btnSecondary
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortOrder('oldest')}
              className={`px-3 py-1 rounded text-sm ${
                sortOrder === 'oldest' ? styles.btnPrimary : styles.btnSecondary
              }`}
            >
              Oldest First
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#D4AF37] text-xl">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentRequests.length === 0 ? (
              <div className={`${styles.card} p-8 text-center`}>
                <p className={styles.textSecondary}>No requests in this category</p>
              </div>
            ) : (
              currentRequests.map(renderRequestCard)
            )}
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${styles.card} max-w-md w-full p-6 space-y-4`}>
              <h2 className={`text-2xl font-bold ${styles.textGold}`}>Change Request Status</h2>

              <div>
                <p className={`${styles.textPrimary} font-semibold`}>{selectedRequest.title}</p>
                <p className={`${styles.textSecondary} text-sm`}>by {selectedRequest.author}</p>
              </div>

              <div>
                <label className={`block ${styles.textSecondary} text-sm mb-2`}>
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BookRequestStatus)}
                  className={`w-full px-3 py-2 ${styles.bgElevated} ${styles.textPrimary} rounded border border-slate-600`}
                >
                  <option value="pending">Pending</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="approved">Approved</option>
                  <option value="refused">Refused</option>
                </select>
              </div>

              {newStatus === 'refused' && (
                <div>
                  <label className={`block ${styles.textSecondary} text-sm mb-2`}>
                    Refusal Reason *
                  </label>
                  <textarea
                    value={refusalComment}
                    onChange={(e) => setRefusalComment(e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 ${styles.bgElevated} ${styles.textPrimary} rounded border border-slate-600`}
                    placeholder="Explain why this request is being refused..."
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedRequest(null);
                    setRefusalComment('');
                  }}
                  className={`px-4 py-2 ${styles.btnSecondary} rounded`}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  className={`px-4 py-2 ${styles.btnPrimary} rounded`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${styles.card} max-w-md w-full p-6 space-y-4`}>
              <h2 className={`text-2xl font-bold ${styles.textGold}`}>Request a Book</h2>

              <div>
                <label className={`block ${styles.textSecondary} text-sm mb-2`}>
                  Book Title *
                </label>
                <input
                  type="text"
                  value={newRequestTitle}
                  onChange={(e) => setNewRequestTitle(e.target.value)}
                  className={`w-full px-3 py-2 ${styles.bgElevated} ${styles.textPrimary} rounded border border-slate-600`}
                  placeholder="Enter book title..."
                />
              </div>

              <div>
                <label className={`block ${styles.textSecondary} text-sm mb-2`}>
                  Author *
                </label>
                <input
                  type="text"
                  value={newRequestAuthor}
                  onChange={(e) => setNewRequestAuthor(e.target.value)}
                  className={`w-full px-3 py-2 ${styles.bgElevated} ${styles.textPrimary} rounded border border-slate-600`}
                  placeholder="Enter author name..."
                />
              </div>

              <div>
                <label className={`block ${styles.textSecondary} text-sm mb-2`}>
                  Book Type
                </label>
                <select
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value)}
                  className={`w-full px-3 py-2 ${styles.bgElevated} ${styles.textPrimary} rounded border border-slate-600`}
                >
                  <option value="single">Single</option>
                  <option value="novella">Novella</option>
                  <option value="anthology">Anthology</option>
                  <option value="series">Series</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block ${styles.textSecondary} text-sm mb-2`}>
                  Additional Information (optional)
                </label>
                <textarea
                  value={newRequestInfo}
                  onChange={(e) => setNewRequestInfo(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 ${styles.bgElevated} ${styles.textPrimary} rounded border border-slate-600`}
                  placeholder="Any additional details about the book..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRequestTitle('');
                    setNewRequestAuthor('');
                    setNewRequestType('single');
                    setNewRequestInfo('');
                  }}
                  className={`px-4 py-2 ${styles.btnSecondary} rounded`}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequest}
                  className={`px-4 py-2 ${styles.btnPrimary} rounded`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
