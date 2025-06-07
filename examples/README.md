# Neural Nexus Package Examples

<div align="center">
  <img src="../assets/examples-banner.png" alt="Neural Nexus Examples" width="600"/>
</div>

This directory contains example code showing how to use the Neural Nexus package.

## Available Examples

| Example | Description |
|---------|-------------|
| `basic-usage.ts` | Basic examples of authentication, marketplace browsing, model management, and profile management |
| `payment-example.ts` | Examples of payment operations, including purchasing models and subscription management |
| `sdk-example.ts` | Examples of generating SDKs for different programming languages |

## Running the Examples

To run these examples, you'll need to:

1. Install the dependencies:
```bash
npm install
```

2. Build the package:
```bash
npm run build
```

3. Run an example:
```bash
# Replace with your actual API key
API_KEY=your-api-key-here ts-node examples/basic-usage.ts
```

<div align="center">
  <img src="../assets/examples-demo.gif" alt="Example Execution" width="700"/>
</div>

## SDK Generation

<div align="center">
  <img src="../assets/sdk-generation.png" alt="SDK Generation" width="400"/>
</div>

The Neural Nexus package includes a powerful SDK generator that can create client libraries for different programming languages. Currently supported languages include:

<div align="center">
  <p>
    <a href="#typescript"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="#javascript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>
    <a href="#python"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
    <a href="#go"><img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go" /></a>
    <a href="#java"><img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" /></a>
  </p>
  <p>
    <a href="#ruby"><img src="https://img.shields.io/badge/Ruby-CC342D?style=for-the-badge&logo=ruby&logoColor=white" alt="Ruby" /></a>
    <a href="#csharp"><img src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white" alt="C#" /></a>
    <a href="#php"><img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" /></a>
    <a href="#swift"><img src="https://img.shields.io/badge/Swift-FA7343?style=for-the-badge&logo=swift&logoColor=white" alt="Swift" /></a>
    <a href="#rust"><img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" /></a>
  </p>
</div>

### SDK Code Examples

#### TypeScript
```typescript
import { NeuralNexus } from 'neural-nexus-pkg';

const nexus = new NeuralNexus({
  apiKey: 'your-api-key',
  environment: 'production'
});

const tsCode = nexus.sdk.generateSdk({
  language: 'typescript',
  includeExamples: true,
  prettyPrint: true
});

console.log(`Generated TypeScript SDK: ${tsCode.length} bytes`);
```

#### Python
```typescript
import { NeuralNexus } from 'neural-nexus-pkg';
import * as fs from 'fs';

// Initialize the Neural Nexus client
const neuralNexus = new NeuralNexus({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Generate Python SDK code
const pythonCode = neuralNexus.sdk.generateSdk({
  language: 'python',
  includeExamples: true,
  prettyPrint: true
});

// Save to file
fs.writeFileSync('neural-nexus-python-sdk.py', pythonCode);
console.log('Python SDK generated successfully!');
```

#### Rust
```typescript
import { NeuralNexus } from 'neural-nexus-pkg';

const nexus = new NeuralNexus({
  apiKey: 'your-api-key',
  environment: 'production'
});

const rustCode = nexus.sdk.generateSdk({
  language: 'rust',
  includeExamples: true,
  includeComments: true,
  prettyPrint: true
});

console.log(`Generated Rust SDK: ${rustCode.length} bytes`);
```

## Ecosystem Integration

<div align="center">
  <img src="../assets/ecosystem.png" alt="Neural Nexus Ecosystem" width="600"/>
  
  <p>The Neural Nexus package seamlessly integrates with popular machine learning frameworks and cloud platforms</p>
  
  <div>
    <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
    <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
    <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud" />
    <img src="https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Azure" />
  </div>
</div>

## Performance Benchmarks

<div align="center">
  <img src="../assets/performance-chart.png" alt="Performance Benchmarks" width="700"/>
</div>

<div align="center">
  <a href="../README.md">Return to main README</a>
</div>