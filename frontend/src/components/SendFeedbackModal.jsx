// src/components/SendFeedbackModal.jsx
import React, { useState, useEffect } from 'react';
import { getAvailableReports, sendFeedback } from '../api/api';
import { Modal, Button, Textarea, Select, Alert, Spinner } from './SharedUI';
import { Toast } from '../utils/toast';

const SendFeedbackModal = ({ isOpen, onClose, candidate, onSuccess }) => {
    const [availableReports, setAvailableReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({
        message_type: 'General',
        content: '',
        reportid: null,
    });

    useEffect(() => {
        if (isOpen && candidate) {
            setFeedbackForm({ message_type: 'General', content: '', reportid: null });
            setAvailableReports([]);
            fetchReports(candidate.candid);
        }
    }, [isOpen, candidate]);

    const fetchReports = async (candid) => {
        setLoadingReports(true);
        try {
            const reports = await getAvailableReports(candid);
            setAvailableReports(reports);
        } catch (error) {
            console.error("Error fetching reports:", error);
            Toast.error("Failed to load reports. You can still send a general message.");
        } finally {
            setLoadingReports(false);
        }
    };

    // --- THIS FUNCTION IS NO LONGER NEEDED ---
    // const parseRemarks = (remarksString) => { ... };

    // --- THIS FUNCTION IS NOW FIXED AND SIMPLIFIED ---
    const handleReportSelection = (e) => {
        const reportId = Number(e.target.value);
        if (!reportId) {
            setFeedbackForm(prev => ({ ...prev, reportid: null, content: '' }));
            return;
        }

        const report = availableReports.find(r => r.reportid === reportId);
        
        if (report) {
            // FIX: Our backend already built the entire report and saved it
            // in the 'feedback' column. We just need to load it.
            const prefilledContent = (report.feedback || "Error: Could not load AI report text.") +
                "\n\n----------------------------\n\n" +
                "[HR MESSAGE: Add your personal message here (e.g., rejection or invitation)....]";

            setFeedbackForm({
                message_type: 'Report_Based',
                reportid: reportId,
                content: prefilledContent // <-- Use the correct prefilled content
            });
        }
    };
    // --- END OF FIX ---

    const handleMessageTypeChange = (type) => {
        setFeedbackForm({
            message_type: type,
            content: '',
            reportid: null
        });
    };

    const handleSubmit = async () => {
        if (!feedbackForm.content.trim()) {
            Toast.error("Message content cannot be empty.");
            return;
        }

        setSubmitting(true);
        try {
            await sendFeedback({
                candid: candidate.candid,
                content: feedbackForm.content,
                message_type: feedbackForm.message_type,
                reportid: feedbackForm.message_type === 'Report_Based' ? feedbackForm.reportid : null
            });
            
            Toast.success(`Feedback sent to ${candidate.firstname} ${candidate.lastname}!`);
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Send feedback failed:", error);
            const errorMessage = error.response?.data?.detail || "Failed to send feedback. Please try again.";
            Toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!candidate) return null;

    // (The rest of the JSX return is identical to your file, no changes needed there)
    return (
        <Modal
            title={`Send Feedback to ${candidate.firstname} ${candidate.lastname}`}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Message Type Selection */}
                <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px' 
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="messageType"
                            value="General"
                            checked={feedbackForm.message_type === 'General'}
                            onChange={() => handleMessageTypeChange('General')}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span style={{ fontWeight: '500' }}>General Message</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="messageType"
                            value="Report_Based"
                            checked={feedbackForm.message_type === 'Report_Based'}
                            onChange={() => handleMessageTypeChange('Report_Based')}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span style={{ fontWeight: '500' }}>Report-Based Feedback</span>
                    </label>
                </div>

                {/* Report Selection */}
                {feedbackForm.message_type === 'Report_Based' && (
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            marginBottom: '8px',
                            color: '#374151'
                        }}>
                            Select Analysis Report:
                        </label>
                        {loadingReports ? (
                            <Spinner size="sm" />
                        ) : availableReports.length > 0 ? (
                            <Select 
                                onChange={handleReportSelection} 
                                value={feedbackForm.reportid || ''}
                            >
                                <option value="">-- Select a Report --</option>
                                {availableReports.map(r => (
                                    <option key={r.reportid} value={r.reportid}>
                                        Report #{r.reportid}: {r.job?.title || 'Unknown Job'} 
                                        (Score: {r.overall_score || 0}/{r.total_possible_score || 500})
                                    </option>
                                ))}
                            </Select>
                        ) : (
                            <Alert type="warning">
                                No completed analysis reports are available for this candidate on your jobs.
                            </Alert>
                        )}
                    </div>
                )}

                {/* Message Content */}
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        marginBottom: '8px',
                        color: '#374151'
                    }}>
                        Message Content:
                    </label>
                    <Textarea
                        placeholder={
                            feedbackForm.message_type === 'General'
                                ? "Type your custom message here..."
                                : "Select a report above to load AI analysis. You can then edit and personalize the content before sending."
                        }
                        value={feedbackForm.content}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                        rows={12}
                        disabled={
                            feedbackForm.message_type === 'Report_Based' &&
                            !feedbackForm.reportid &&
                            availableReports.length > 0
                        }
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        {feedbackForm.content.length} characters
                    </p>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '12px', 
                    paddingTop: '16px' 
                }}>
                    <Button 
                        onClick={onClose} 
                        disabled={submitting}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!feedbackForm.content.trim() || submitting}
                    >
                        {submitting ? 'Sending...' : 'Send Feedback'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SendFeedbackModal;