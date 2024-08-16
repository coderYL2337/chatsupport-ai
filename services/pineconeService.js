const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Check if the API keys are loaded
if (!process.env.PINECONE_API_KEY) {
    console.error('PINECONE_API_KEY is not set in the environment variables');
    process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in the environment variables');
    process.exit(1);
}

// Initialize Pinecone
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Function to scrape a webpage
const scrapePage = async (url) => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        
        const title = $('title').text();
        return { url, title };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return null;
    }
};

// Function to generate embeddings using OpenAI
const generateEmbeddings = async (text) => {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
};

// Function to add embeddings to Pinecone
const addToPinecone = async (indexName, vector, metadata) => {
    try {
        const index = pinecone.Index(indexName);
        const upsertResponse = await index.upsert([
            {
                id: metadata.url,
                values: vector,
                metadata: metadata,
            }
        ]);
        return upsertResponse;
    } catch (error) {
        console.error('Error upserting to Pinecone:', error);
        throw error;
    }
};

module.exports = { scrapePage, generateEmbeddings, addToPinecone };