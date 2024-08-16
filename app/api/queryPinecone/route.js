import { generateEmbeddings } from '../../utils/pineconeService';
import pinecone from 'pinecone-client';

pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

const queryPinecone = async (indexName, queryEmbedding) => {
  const index = pinecone.Index(indexName);
  const queryResponse = await index.query({
    topK: 10,
    vector: queryEmbedding,
  });
  return queryResponse;
};

export default async function handler(req, res) {
  const { queryText } = req.body;

  try {
    const queryEmbedding = await generateEmbeddings(queryText);
    const queryResult = await queryPinecone('chatsupport', queryEmbedding);
    res.status(200).json({ result: queryResult });
  } catch (error) {
    res.status(500).json({ error: 'Error querying Pinecone' });
  }
}
