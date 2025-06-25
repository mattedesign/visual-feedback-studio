
// Emergency RAG disable - simple function that returns null to stop infinite loop
async function getRAGContext(userPrompt: string) {
  console.log('⚠️ RAG temporarily disabled to stop infinite loop');
  return null;
}

// Export the function for use in other modules
export { getRAGContext };
