// src/pages/HRFeedbackPage.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { getAllHrApplicants, getJobsByHr } from '../api/api'; 
import SendFeedbackModal from '../components/SendFeedbackModal'; 
// Ensure Table is imported here
import { Table, Select, Button, Alert, Spinner } from '../components/SharedUI'; 

const HRFeedbackPage = () => {
    // FIX: Retrieve user data from the parent DashboardLayout
    const { user } = useOutletContext(); 
    const hr_id = user?.hr_id;
    
    // Optional UX improvement: Check if a candidate was passed from the Dashboard
    const location = useLocation();
    const preSelectedCandidateId = location.state?.preSelectedCandidateId;
    
    const [allApplicants, setAllApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [hrJobs, setHrJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!hr_id) {
                setLoading(false);
                return;
            }
            try {
                const [applicantsRes, jobsRes] = await Promise.all([
                    getAllHrApplicants(),
                    getJobsByHr(hr_id)
                ]);

                setAllApplicants(applicantsRes);
                setFilteredApplicants(applicantsRes);
                setHrJobs(jobsRes);
                setLoading(false);

                // Check if a candidate was pre-selected from the Dashboard
                if (preSelectedCandidateId) {
                    const candidateToSelect = applicantsRes.find(a => a.candid === preSelectedCandidateId);
                    if (candidateToSelect) {
                        setSelectedCandidate(candidateToSelect);
                        setIsModalOpen(true);
                        // You might want to use navigate here to clear location.state if you have access
                    }
                }

            } catch (err) {
                console.error("Error fetching HR data:", err);
                setError('Failed to load dashboard data.');
                setLoading(false);
            }
        };
        fetchData();
    }, [hr_id, preSelectedCandidateId]);


    // Filter Logic
    const handleJobFilter = (e) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);
        if (jobId === 'all') {
            setFilteredApplicants(allApplicants);
        } else {
            setFilteredApplicants(allApplicants.filter(a => a.job_id === Number(jobId)));
        }
    };

    const openFeedbackModal = (candidate) => {
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
    };

    const applicantColumns = [
        { header: 'Applicant Name', accessor: 'firstname', render: (a) => `${a.firstname} ${a.lastname}` },
        { header: 'Email', accessor: 'email' },
        { header: 'Job Applied', accessor: 'job_title' },
        { 
            header: 'Action', 
            accessor: 'action', 
            render: (a) => (
                <Button onClick={() => openFeedbackModal(a)}>Send Feedback</Button>
            ) 
        },
    ];

    if (loading) return <Spinner />;
    if (error) return <Alert type="error">{error}</Alert>;

    return (
        <div className="hr-feedback-page">
            <h2>✉️ Candidate Messaging & Feedback Center</h2>
            
            <Select onChange={handleJobFilter} value={selectedJobId}>
                <option value="all">All Applicants for My Jobs</option>
                {hrJobs.map(job => (
                    <option key={job.job_id} value={job.job_id}>
                        {job.title} ({job.location})
                    </option>
                ))}
            </Select>

            {/* FIX: UN-COMMENTING THE TABLE AND REMOVING PLACEHOLDER */}
            <div className="mt-4">
                <p className="mb-2 text-sm text-slate-500">Displaying {filteredApplicants.length} applicants.</p>
                {/* 🎯 THIS LINE IS NOW UN-COMMENTED AND RENDERS THE DATA */}
                <Table data={filteredApplicants} columns={applicantColumns} keyField="candid" />
            </div>
            
            <SendFeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidate={selectedCandidate}
            />
        </div>
    );
};

export default HRFeedbackPage;