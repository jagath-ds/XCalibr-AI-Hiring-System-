// src/pages/CandidateFeedbackPage.jsx

import React, { useState, useEffect } from 'react';
import { getMyFeedback } from '../api/api'; 
import { Card, Spinner, Alert } from '../components/SharedUI';
// --- Import a new icon for the expand/collapse indicator ---
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Helper function for date formatting
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

// --- Helper function to create a short preview ---
const createPreview = (content) => {
    // FIX: Guard clause to prevent crash if content is null
    if (!content) return "No preview available";

    const preview = content.split('\n')[0]; // Get the first line
    if (preview.length > 100) {
        return preview.substring(0, 100) + "...";
    }
    return preview;
};

const CandidateFeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. Add state to track which feedback item is expanded ---
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await getMyFeedback();
                setFeedbackList(response); 
                setLoading(false);
            } catch (err) {
                console.error("Error fetching candidate feedback:", err);
                setError('Failed to load your feedback messages.');
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    // --- 2. Toggle function ---
    const handleToggleExpand = (feedbackid) => {
        setExpandedId(currentId => (currentId === feedbackid ? null : feedbackid));
    };

    if (loading) return <Spinner size="lg" />;
    if (error) return <Alert type="error">{error}</Alert>;
    
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
                ✉️ Your Feedback Inbox
            </h2>
            
            {feedbackList.length === 0 && (
                <Alert type="info">You have not received any feedback yet.</Alert>
            )}

            {/* --- 3. Main render logic updated --- */}
            {feedbackList.map((feedback) => {
                const isReportBased = feedback.message_type === 'Report_Based';
                const isExpanded = expandedId === feedback.feedbackid;

                // --- 4. FIX for Sender Name ---
                // Handle cases where sender is null (deleted HR or System message)
                const senderName = feedback.sender 
                    ? `${feedback.sender.firstname} ${feedback.sender.lastname}`
                    : `Recruiter #${feedback.hr_id || 'System'}`;
                
                const senderDesignation = feedback.sender?.designation 
                    ? `(${feedback.sender.designation})`
                    : '';

                return (
                    <Card 
                        key={feedback.feedbackid} 
                        style={{ 
                            marginBottom: '15px', 
                            borderLeft: isReportBased ? '5px solid #007bff' : '5px solid #10b981',
                            padding: 0 // Remove default card padding
                        }}
                    >
                        {/* --- 5. Clickable Header --- */}
                        <div 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '16px 24px', 
                                borderBottom: isExpanded ? '1px solid #eee' : 'none',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleToggleExpand(feedback.feedbackid)}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ 
                                    margin: 0, 
                                    color: isReportBased ? '#007bff' : '#10b981',
                                    fontSize: '18px',
                                    fontWeight: '600'
                                }}>
                                    {isReportBased ? '📊 Official Performance Feedback' : '✉️ General Message'}
                                </h3>
                                
                                {/* --- 6. Show preview ONLY if not expanded --- */}
                                {!isExpanded && !isReportBased && (
                                    <p style={{ margin: '8px 0 0', color: '#666' }}>
                                        {createPreview(feedback.content)}
                                    </p>
                                )}
                            </div>
                            <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                                <span style={{ fontSize: '0.8em', color: '#999', display: 'block', marginBottom: '4px' }}>
                                    {formatDate(feedback.sent_at)}
                                </span>
                                <span style={{ fontSize: '0.9em', color: '#333', display: 'block', fontWeight: 'bold' }}>
                                    From: {senderName} {senderDesignation}
                                </span>
                            </div>
                            {/* --- 7. Expand/Collapse Icon --- */}
                            <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', color: '#666' }}>
                                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                            </div>
                        </div>

                        {/* --- 8. Conditionally Rendered Content with Scrollbar --- */}
                        {isExpanded && (
                            <div 
                                style={{
                                    padding: '16px 24px',
                                    maxHeight: '400px', 
                                    overflowY: 'auto'  // Add a scrollbar if content overflows
                                }}
                            >
                                <p style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    lineHeight: '1.6',
                                    color: '#374151',
                                    margin: 0
                                }}>
                                    {/* FIX: Handle null content safely */}
                                    {feedback.content || "No detailed message content provided."}
                                </p>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default CandidateFeedbackPage;