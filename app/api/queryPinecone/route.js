import { generateEmbeddings, addToPinecone } from '../../../services/pineconeService';

export default async function handler(req, res) {
  const { queryText } = req.body;

  try {
    const queryEmbedding = await generateEmbeddings(queryText);

    // Assuming you have a function in pineconeService.js to handle queries:
    const queryResult = await queryPinecone('chatsupport', queryEmbedding);

    res.status(200).json({ result: queryResult });
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    res.status(500).json({ error: 'Error querying Pinecone' });
  }
}



