import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../service/FirebaseConfig.js';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


const MyProposals = () => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch proposals
    const fetchProposals = async () => {
        try {
            const proposalsRef = collection(db, 'proposals');
            const q = query(proposalsRef, where('status', 'in', ['Accepted', 'Denied']));
            const querySnapshot = await getDocs(q);

            const fetchedProposals = [];
            querySnapshot.forEach((doc) => {
                fetchedProposals.push({ ...doc.data(), id: doc.id });
            });

            setProposals(fetchedProposals);
        } catch (err) {
            setError('Error fetching proposals: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle proposal deletion
    const handleDeleteProposal = async (id) => {
        try {
            const proposalRef = doc(db, 'proposals', id);
            await deleteDoc(proposalRef);
            fetchProposals();
        } catch (err) {
            setError('Error deleting proposal: ' + err.message);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    if (loading) return <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">My Proposals</h1>
            {proposals.length === 0 ? (
                <p className="text-gray-700 dark:text-gray-300">You have no proposals yet. Start by creating one!</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {proposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition duration-300 ${
                                proposal.status === 'Accepted'
                                    ? 'bg-green-50 dark:bg-green-800'
                                    : 'bg-red-50 dark:bg-red-800'
                            }`}
                        >
                            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{proposal.projectTitle}</h2>
                            <p className={`text-sm ${proposal.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                Status: {proposal.status}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                                <Link to={`/view-proposal/${proposal.id}`} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    View Proposal
                                </Link>
                                <button
                                    onClick={() => handleDeleteProposal(proposal.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    aria-label="Delete Proposal"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProposals;
