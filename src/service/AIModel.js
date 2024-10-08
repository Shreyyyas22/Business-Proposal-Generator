import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);

// Fetch the model you want to use (e.g., gemini-1.5-flash)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Function to start chat session and send a message
export const chatSession = async (clientBusinessProposalDetails) => {
  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a business proposal for the following details:
                - Company Name: ${clientBusinessProposalDetails.companyName}
                - Client Name: ${clientBusinessProposalDetails.clientName}
                - Project Title: ${clientBusinessProposalDetails.projectTitle}
                - Selected Services: ${clientBusinessProposalDetails.selectedServices}
                - Project Scope: ${clientBusinessProposalDetails.projectScope}
                - Budget: ${clientBusinessProposalDetails.budget}
                - Payment Terms: ${clientBusinessProposalDetails.paymentTerms}
                - Project Team: ${clientBusinessProposalDetails.projectTeam}
                - Company Email: ${clientBusinessProposalDetails.companyEmail}
                - Start Date: ${clientBusinessProposalDetails.startDate}
                - Expected Deadline: ${clientBusinessProposalDetails.expectedDeadline}

                Please include these sections in the proposal:
                1. Why the client needs these services.
                2. How these services can enhance their business operations.
                3. The consequences of neglecting these solutions.
                4. The advantages they will gain by choosing our company.
                Generate a detailed, professional response with the above information.
              `,
            },
          ],
        },
      ],
    });

    // Send a message to the chat and retrieve the response
    const result = await chat.sendMessage("Generate a detailed business proposal with the above information.");

    // Await response and return the result as an object
    const responseText = await result.response.text();

    // Return the response in the expected format
    return { generatedText: responseText }; // Wrap responseText in an object
  } catch (error) {
    console.error("Error starting chat session:", error);
    throw error; // Re-throw the error for further handling
  }
};
