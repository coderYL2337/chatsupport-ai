const { scrapePage, generateEmbeddings, addToPinecone } = require('./services/pineconeService');

const scrapeAndStore = async () => {
  const urls = [
    'https://www.starbucks.com/menu',
    'https://www.starbucks.com/rewards',
    'https://www.starbucks.com/store-locator',
    'https://www.starbucks.com/terms/manage-gift-cards',
    'https://www.starbucks.com/about-us',
    'https://www.starbucks.com/coffee',
    'https://stories.starbucks.com',
    'https://www.starbucks.com/contact',
    'https://athome.starbucks.com'
  ];

  for (const url of urls) {
    try {
      console.log(`Processing ${url}...`);
      const scrapedData = await scrapePage(url);
      if (scrapedData) {
        console.log(`Scraped data for ${url}:`, scrapedData);
        const embedding = await generateEmbeddings(scrapedData.title);
        console.log(`Generated embedding for ${url}. Embedding length: ${embedding.length}`);
        const response = await addToPinecone('chatsupport', embedding, scrapedData);
        console.log(`Data added to Pinecone for ${url}:`, response);
      } else {
        console.log(`No data scraped for ${url}`);
      }
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }
};

scrapeAndStore().catch(console.error);
