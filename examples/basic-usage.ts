// Neural Nexus SDK - Basic Usage Example

import { NeuralNexus, Auth, ModelManager, ProfileManager, StorageManager } from '../src';

// Set your API key
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Initialize Neural Nexus client
const neuralNexus = new NeuralNexus({
  apiKey: API_KEY,
  environment: 'development'
});

// Initialize managers
const auth = new Auth(neuralNexus);
const modelManager = new ModelManager(neuralNexus);
const profileManager = new ProfileManager(neuralNexus);
const storageManager = new StorageManager(neuralNexus);

async function runBasicExamples() {
  try {
    console.log('🧠 Neural Nexus Basic Examples');
    console.log('---------------------------------');

    // Authentication check
    console.log('🔑 Checking authentication...');
    try {
      const currentUser = await auth.getCurrentUser();
      console.log(`Authentication status: ${currentUser ? 'Valid ✅' : 'Invalid ❌'}`);
    } catch (error) {
      console.log('Authentication status: Invalid ❌');
    }
    console.log('---------------------------------');

    // Browse available models
    console.log('🔍 Browsing available models...');
    try {
      const models = await modelManager.searchModels({
        isPublic: true,
        sortBy: 'rating',
        sortDirection: 'desc',
        limit: 5
      });
      console.log(`Found ${models.length || 0} models:`);
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name} - ${model.description?.substring(0, 50)}...`);
      });
    } catch (error) {
      console.log('Could not retrieve models.');
    }
    console.log('---------------------------------');

    // User profile information
    console.log('👤 Getting user profile information...');
    try {
      const profile = await profileManager.getMyProfile();
      console.log(`Username: ${profile.username}`);
      console.log(`Email: ${profile.email}`);
      console.log(`Joined: ${new Date(profile.createdAt).toLocaleDateString()}`);
      console.log(`Models: ${profile.models?.length || 0}`);
    } catch (error) {
      console.log('Could not retrieve profile information.');
    }
    console.log('---------------------------------');

    // Storage usage - list files
    console.log('💾 Checking storage...');
    try {
      const files = await storageManager.listFiles('/');
      console.log(`Files found: ${files.length}`);
      if (files.length > 0) {
        console.log('Recent files:');
        files.slice(0, 3).forEach((file, index) => {
          console.log(`${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        });
      }
    } catch (error) {
      console.log('Could not retrieve storage information.');
    }
    console.log('---------------------------------');

    // Try to get a model and its details
    console.log('✨ Getting model information...');
    try {
      // Try to get the first model from search results
      const models = await modelManager.searchModels({ limit: 1 });
      if (models.length > 0) {
        const modelId = models[0].id;
        const modelDetails = await modelManager.getModel(modelId);
        console.log('Model details:');
        console.log(`Name: ${modelDetails.name}`);
        console.log(`Description: ${modelDetails.description}`);
        console.log(`Type: ${modelDetails.type}`);
        console.log(`Creator: ${modelDetails.creator}`);
      } else {
        console.log('No models available.');
      }
    } catch (error) {
      console.log('Could not retrieve model information.');
    }
    
    console.log('---------------------------------');
    console.log('✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run the examples
runBasicExamples().catch(console.error); 