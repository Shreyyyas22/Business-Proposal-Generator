import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../service/FirebaseConfig.js';
import { useParams, useNavigate } from 'react-router-dom';
import { chatSession } from '../service/AIModel.js';
import MarkdownViewer from "../MarkdownViewer.jsx";
import jsPDF from 'jspdf';
import LoadingScreen from '../LoadingScreen.jsx';

const ViewProposal = () => {
    const { docId } = useParams();
    const navigate = useNavigate();
    const [proposal, setProposal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                if (!docId) {
                    throw new Error("Document ID is missing");
                }

                const docRef = doc(db, 'proposals', docId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const fetchedProposal = docSnap.data();
                    setProposal(fetchedProposal);
                    await handleGenerateProposal(fetchedProposal);
                } else {
                    throw new Error('No such document exists');
                }
            } catch (err) {
                setError('Error fetching proposal: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProposal();
    }, [docId]);

    const handleGenerateProposal = async (fetchedProposal) => {
        setIsGenerating(true);
        try {
            const generatedProposal = await chatSession({
                companyName: fetchedProposal.companyName,
                clientName: fetchedProposal.clientName,
                projectTitle: fetchedProposal.projectTitle,
                selectedServices: fetchedProposal.selectedServices,
                projectScope: fetchedProposal.projectScope,
                budget: fetchedProposal.projectBudget,
                paymentTerms: fetchedProposal.paymentTerms,
                projectTeam: fetchedProposal.projectTeam,
                companyEmail: fetchedProposal.companyEmail,
                expectedDeadline: fetchedProposal.expectedDeadline, 
                startDate: fetchedProposal.startDate, // Add startDate here
                additionalInfo: {
                    reasonsForService: "Why the client needs these services",
                    enhancementBenefits: "How these services can enhance their business operations",
                    neglectConsequences: "The consequences of neglecting these solutions",
                    advantagesOfChoosingUs: "The advantages they will gain by choosing us"
                }
            });
    
            console.log(generatedProposal);
    
            setProposal((prev) => ({
                ...prev,
                generatedText: generatedProposal.generatedText || 'No generated text available',
            }));
        } catch (err) {
            setError('Error generating proposal: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAcceptProposal = async () => {
        const pdf = new jsPDF();
        
        // Set up document formatting
        const margin = 10;
        const lineHeight = 10;
        let yPosition = margin;
    
        const addTextWithPageBreaks = (textArray) => {
            for (const line of textArray) {
                if (yPosition + lineHeight > pdf.internal.pageSize.height - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(line, margin, yPosition);
                yPosition += lineHeight;
            }
        };
    
        // Add title
        pdf.setFontSize(16);
        addTextWithPageBreaks([`Proposal: ${proposal?.projectTitle}`]);
    
        // Add client and company info
        pdf.setFontSize(12);
        addTextWithPageBreaks([
            `Client: ${proposal?.clientName}`,
            `Company: ${proposal?.companyName}`,
            `Budget: ${proposal?.projectBudget}`,
            `Deadline: ${proposal?.expectedDeadline}`,
            `Start Date: ${new Date(proposal?.startDate).toLocaleDateString()}`, // Display start date
        ]);
    
        // Handle multiline text for project scope
        const projectScope = pdf.splitTextToSize(`Scope: ${proposal?.projectScope}`, 180);
        addTextWithPageBreaks(projectScope);
    
        // Handle multiline text for generated content
        const generatedText = pdf.splitTextToSize(`Generated Text: ${proposal?.generatedText}`, 180);
        addTextWithPageBreaks(generatedText);
    
        pdf.save(`${proposal?.projectTitle}-proposal.pdf`);
    
        const proposalRef = doc(db, 'proposals', docId);
        await updateDoc(proposalRef, {
            status: 'Accepted',
        });
    
        navigate('/my-proposal');
    };

    const handleDenyProposal = async () => {
        const proposalRef = doc(db, 'proposals', docId);
        await updateDoc(proposalRef, {
            status: 'Denied',
        });

        navigate('/create-proposal');
    };

    if (loading) return <LoadingScreen />; 
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">
                {proposal?.projectTitle || 'Project Title Not Available'}
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Date:</strong> {new Date(proposal?.createdAt?.seconds * 1000).toLocaleDateString() || 'Not specified'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>To:</strong> {proposal?.clientName || 'Not specified'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>From:</strong> {proposal?.companyName || 'Not specified'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Start Date:</strong> {new Date(proposal?.startDate).toLocaleDateString() || 'Not specified'}
            </p>

            <h2 className="text-2xl font-bold mt-6 mb-2 dark:text-white">Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300">
                {proposal?.proposalSummary || 'No introduction available'}
            </p>

            <h2 className="text-2xl font-bold mt-6 mb-2 dark:text-white">Project Overview</h2>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Project Title:</strong> {proposal?.projectTitle || 'Not specified'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Client:</strong> {proposal?.clientName || 'Not specified'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Budget:</strong> {proposal?.projectBudget || 'Not specified'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Deadline:</strong> {proposal?.expectedDeadline || 'Not specified'}
            </p>

            <h2 className="text-2xl font-bold mt-6 mb-2 dark:text-white">Selected Services</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {proposal?.selectedServices?.split(',').map((service, index) => (
                    <li key={index}>{service.trim()}</li>
                )) || <li>No services selected</li>}
            </ul>

            <h2 className="text-2xl font-bold mt-6 mb-2 dark:text-white">Project Scope</h2>
            <p className="text-gray-700 dark:text-gray-300">
                {proposal?.projectScope || 'No scope defined'}
            </p>

            <h2 className="text-2xl font-bold mt-6 mb-2 dark:text-white">Generated Proposal</h2>
            <MarkdownViewer markdownText={proposal?.generatedText || 'No content available'} />

            <div className="mt-6 flex justify-between">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={handleAcceptProposal}
                >
                    Accept Proposal
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={handleDenyProposal}
                >
                    Deny Proposal
                </button>
            </div>
        </div>
    );
};

export default ViewProposal;
