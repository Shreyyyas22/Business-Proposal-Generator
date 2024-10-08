import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/Textarea";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; // Firebase Firestore functions
import { chatSession } from "../service/AIModel.js";
import LoadingScreen from "../LoadingScreen.jsx";
import { useNavigate } from "react-router-dom";


const CreateProposal = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState(""); // New state for company email
  const [clientCompanyName, setClientCompanyName] = useState(""); // New state for client company name
  const [clientName, setClientName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [proposalSummary, setProposalSummary] = useState("");
  const [projectScope, setProjectScope] = useState(""); // Added project scope
  const [projectBudget, setProjectBudget] = useState(""); // Existing budget state
  const [startDate, setStartDate] = useState(new Date());
  const [expectedDeadline, setExpectedDeadline] = useState(new Date()); // Existing deadline state
  const [paymentTerms, setPaymentTerms] = useState(""); // New state for payment terms
  const [proposalResult, setProposalResult] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesCollection = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs
          .map((doc) => doc.data().name)
          .filter((name) => typeof name === "string");
        setAvailableServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [db]);

  const handleServiceChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleSelectService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices((prev) => prev.filter((s) => s !== service));
    } else {
      setSelectedServices((prev) => [...prev, service]);
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleInputClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleRemoveService = (service) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (
      !companyName ||
      !companyEmail || // Validate company email
      !clientCompanyName || // Validate client company name
      !clientName ||
      !projectTitle ||
      selectedServices.length === 0 ||
      !proposalSummary ||
      !projectScope || // Add validation for project scope
      !projectBudget ||
      !startDate||
      !expectedDeadline ||
      !paymentTerms // Validate payment terms
    ) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    setLoading(true);

    const proposalDetails = {
      companyName,
      companyEmail,
      clientCompanyName,
      clientName,
      projectTitle,
      selectedServices: selectedServices.join(", "),
      proposalSummary,
      projectScope,
      projectBudget,
      startDate: startDate.toISOString(),
      expectedDeadline: expectedDeadline.toISOString(),
      paymentTerms,
      generatedAt: new Date(), // Capture the current date
    };
    try {
      console.log("Proposal Details:", proposalDetails);
      const result = await chatSession(proposalDetails);

      if (!result || !result.generatedText) {
        throw new Error("Generated proposal is undefined or invalid");
      }

      console.log("Generated Proposal Response:", result);
      setProposalResult(result.generatedText); // Set the generated proposal result

      const docRef = await addDoc(collection(db, "proposals"), {
        ...proposalDetails,
        generatedProposal: result.generatedText,
        createdAt: new Date(),
      });

      const docId = docRef.id;
      console.log("Proposal saved with docId:", docId);

      navigate(`/view-proposal/${docId}`);

      // Clear form fields after submission
      setCompanyName("");
      setCompanyEmail(""); // Clear company email
      setClientCompanyName(""); // Clear client company name
      setClientName("");
      setProjectTitle("");
      setSelectedServices([]);
      setProposalSummary("");
      setProjectScope(""); // Clear project scope
      setProjectBudget("");
      setStartDate(""); // Clear start date
      setExpectedDeadline("");
      setPaymentTerms(""); // Clear payment terms
      setProposalResult(""); // Clear proposal result state
    } catch (error) {
      console.error("Error generating proposal:", error);
      alert("There was an error generating your proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white p-6">
      {loading && <LoadingScreen />}

      {!loading && (
        <>
          <h1 className="text-2xl font-bold mb-6">Create Business Proposal</h1>

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="companyName">
                Your Company Name
              </label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* Company Email */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="companyEmail">
                Your Company Email
              </label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="Enter your company email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
            </div>

            {/* Client Company Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="clientCompanyName">
                Client Company Name
              </label>
              <Input
                id="clientCompanyName"
                type="text"
                placeholder="Enter your client’s company name"
                required
                value={clientCompanyName}
                onChange={(e) => setClientCompanyName(e.target.value)}
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="clientName">
                Client Name
              </label>
              <Input
                id="clientName"
                type="text"
                placeholder="Enter your client’s name"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="projectTitle">
                Project Title
              </label>
              <Input
                id="projectTitle"
                type="text"
                placeholder="Enter project title"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>

            {/* Selected Services */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="selectedServices">
                Selected Services
              </label>
              <Input
                id="selectedServices"
                type="text"
                placeholder="Click to search services"
                value={searchQuery}
                onClick={handleInputClick}
                onChange={handleServiceChange}
              />
              {showDropdown && (
                <div className="mt-2 border rounded">
                  {availableServices
                    .filter((service) =>
                      service && service.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((service) => (
                      <div
                        key={service}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleSelectService(service)}
                      >
                        {service}
                      </div>
                    ))}
                </div>
              )}
              <div className="mt-2">
                {selectedServices.map((service) => (
                  <span
                    key={service}
                    className="bg-blue-500 text-white py-1 px-3 rounded-full mr-2 mb-2 flex justify-between items-center"
                  >
                    {service}
                    <button
                      className="ml-2 text-red-500"
                      type="button"
                      onClick={() => handleRemoveService(service)}
                    >
                      &times; {/* Remove icon */}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Proposal Summary */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="proposalSummary">
                Proposal Summary
              </label>
              <Textarea
                id="proposalSummary"
                placeholder="Enter proposal summary"
                required
                value={proposalSummary}
                onChange={(e) => setProposalSummary(e.target.value)}
              />
            </div>

            {/* Project Scope */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="projectScope">
                Project Scope
              </label>
              <Textarea
                id="projectScope"
                placeholder="Enter project scope"
                required
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
              />
            </div>

            {/* Project Budget */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="projectBudget">
                Project Budget
              </label>
              <Input
                id="projectBudget"
                type="number"
                placeholder="Enter project budget"
                required
                value={projectBudget}
                onChange={(e) => setProjectBudget(e.target.value)}
              />
            </div>

            {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground" htmlFor="startDate">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={startDate.toISOString().split("T")[0]} // Format date for input
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              </div>


            {/* Expected Deadline */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="expectedDeadline">
                Expected Deadline
              </label>
              <Input
                id="expectedDeadline"
                type="date"
                required
                value={expectedDeadline.toISOString().split("T")[0]} // Format date for input
                onChange={(e) => setExpectedDeadline(new Date(e.target.value))}
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="paymentTerms">
                Payment Terms
              </label>
              <Textarea
                id="paymentTerms"
                placeholder="Enter payment terms"
                required
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit">Submit Proposal</Button>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateProposal;
