import { NeuralNexus } from '../src';
import { SdkLanguage, SdkOptions } from '../src/managers/SdkManager';
import * as fs from 'fs';
import * as path from 'path';

// Set your API key
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Initialize Neural Nexus client
const neuralNexus = new NeuralNexus({
  apiKey: API_KEY,
  environment: 'development'
});

// Output directory for generated SDKs
const outputDir = path.join(__dirname, 'generated-sdks');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate SDKs for different languages
async function generateAllSdks() {
  try {
    console.log('🚀 Starting SDK generation...');
    
    // Languages to generate
    const languages: SdkLanguage[] = ['typescript', 'python', 'go', 'java', 'ruby', 'csharp'];
    
    for (const language of languages) {
      console.log(`Generating ${language} SDK...`);
      
      const code = neuralNexus.sdk.generateSdk({
        language,
        includeExamples: true,
        includeComments: true,
        prettyPrint: true
      });
      
      // Determine file extension based on language
      let fileExtension = '';
      switch (language) {
        case 'typescript':
          fileExtension = '.ts';
          break;
        case 'python':
          fileExtension = '.py';
          break;
        case 'go':
          fileExtension = '.go';
          break;
        case 'java':
          fileExtension = '.java';
          break;
        case 'ruby':
          fileExtension = '.rb';
          break;
        case 'csharp':
          fileExtension = '.cs';
          break;
        default:
          fileExtension = '.txt';
      }
      
      // Save the generated SDK
      const outputFile = path.join(outputDir, `neural-nexus-${language}${fileExtension}`);
      fs.writeFileSync(outputFile, code);
      
      console.log(`✅ ${language} SDK saved to ${outputFile} (${(code.length / 1024).toFixed(2)} KB)`);
    }
    
    console.log('💯 All SDKs generated successfully!');
  } catch (error) {
    console.error('Error generating SDKs:', error);
  }
}

// Generate specific language SDK with custom options
async function generateCustomSdk(language: SdkLanguage) {
  try {
    console.log(`Generating custom ${language} SDK...`);
    
    const options: SdkOptions = {
      language,
      includeExamples: true,
      includeComments: true,
      prettyPrint: true
    };
    
    const code = neuralNexus.sdk.generateSdk(options);
    
    // Determine file extension
    const fileExtensions: {[key in SdkLanguage]?: string} = {
      'typescript': '.ts',
      'python': '.py',
      'go': '.go',
      'java': '.java',
      'ruby': '.rb',
      'csharp': '.cs'
    };
    
    const fileExtension = fileExtensions[language] || '.txt';
    const outputFile = path.join(outputDir, `neural-nexus-${language}-custom${fileExtension}`);
    
    fs.writeFileSync(outputFile, code);
    console.log(`Custom ${language} SDK saved to ${outputFile}`);
    
    return code;
  } catch (error) {
    console.error(`Error generating ${language} SDK:`, error);
    return null;
  }
}

// Run the examples
(async () => {
  // Generate all SDKs
  await generateAllSdks();
  
  // Generate a custom Python SDK with limited modules
  const pythonCode = await generateCustomSdk('python');
  console.log(`Python SDK code length: ${pythonCode?.length || 0} characters`);
  
  // Generate a custom TypeScript SDK with limited modules
  const tsCode = await generateCustomSdk('typescript');
  console.log(`TypeScript SDK code length: ${tsCode?.length || 0} characters`);
})(); 