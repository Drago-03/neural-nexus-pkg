import { NeuralNexus } from '../core/NeuralNexus';
import { NeuralNexusError } from '../types';

// Supported programming languages
export type SdkLanguage = 
  | 'typescript'
  | 'python'
  | 'go' 
  | 'java'
  | 'ruby'
  | 'csharp'
  | 'javascript'
  | 'php'
  | 'swift'
  | 'rust';

// SDK generation options
export interface SdkOptions {
  language: SdkLanguage;
  includeExamples?: boolean;
  includeComments?: boolean;
  includeTypeDefs?: boolean;
  prettyPrint?: boolean;
  outputDir?: string;
  packageName?: string;
}

/**
 * SDK code templates by language
 */
class SdkTemplates {
  static typescript(apiKey: string): string {
    return `import { NeuralNexus } from 'neural-nexus-pkg';

// Initialize the client
const neuralNexus = new NeuralNexus({
  apiKey: '${apiKey}',
  environment: 'production'
});

// Example: List models
async function listModels() {
  try {
    const response = await neuralNexus.get('/models');
    return response.data;
  } catch (error) {
    console.error('Error listing models:', error);
    throw error;
  }
}

// Example: Generate text
async function generateText(prompt) {
  try {
    const response = await neuralNexus.post('/models/gpt-nexus/generate', {
      prompt,
      max_tokens: 256,
      temperature: 0.7
    });
    return response.data;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

export { neuralNexus, listModels, generateText };`;
  }

  static python(apiKey: string): string {
    return `import os
import requests

class NeuralNexus:
    def __init__(self, api_key, environment="production"):
        self.api_key = api_key
        self.base_url = "https://api.neuralnexus.ai/v1" if environment == "production" else "https://api.dev.neuralnexus.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def get(self, endpoint, params=None):
        response = requests.get(f"{self.base_url}{endpoint}", headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint, data):
        response = requests.post(f"{self.base_url}{endpoint}", headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()
    
    def list_models(self):
        return self.get("/models")
    
    def generate_text(self, prompt, max_tokens=256, temperature=0.7):
        data = {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        return self.post("/models/gpt-nexus/generate", data)

# Initialize client
neural_nexus = NeuralNexus(api_key="${apiKey}")

# Example usage
if __name__ == "__main__":
    try:
        # List models
        models = neural_nexus.list_models()
        print(f"Available models: {models}")
        
        # Generate text
        result = neural_nexus.generate_text("Write a short poem about AI")
        print(f"Generated text: {result['text']}")
    except Exception as e:
        print(f"Error: {e}")`;
  }

  static go(apiKey: string): string {
    return `package neuralnexus

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client represents a Neural Nexus API client
type Client struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new Neural Nexus API client
func NewClient(apiKey string, environment string) *Client {
	baseURL := "https://api.neuralnexus.ai/v1"
	if environment == "development" {
		baseURL = "https://api.dev.neuralnexus.ai/v1"
	}

	return &Client{
		APIKey:  apiKey,
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: time.Second * 30,
		},
	}
}

// TextGenerationRequest represents a text generation request
type TextGenerationRequest struct {
	Prompt      string   \`json:"prompt"\`
	MaxTokens   int      \`json:"max_tokens,omitempty"\`
	Temperature float64  \`json:"temperature,omitempty"\`
	Stop        []string \`json:"stop,omitempty"\`
}

// TextGenerationResponse represents a text generation response
type TextGenerationResponse struct {
	Text  string \`json:"text"\`
	Usage struct {
		PromptTokens     int \`json:"prompt_tokens"\`
		CompletionTokens int \`json:"completion_tokens"\`
		TotalTokens      int \`json:"total_tokens"\`
	} \`json:"usage"\`
}

// GenerateText generates text using the specified model
func (c *Client) GenerateText(modelID string, req TextGenerationRequest) (*TextGenerationResponse, error) {
	endpoint := fmt.Sprintf("/models/%s/generate", modelID)
	
	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %w", err)
	}
	
	httpReq, err := http.NewRequest("POST", c.BaseURL+endpoint, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}
	
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)
	
	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error: status=%d, body=%s", resp.StatusCode, string(bodyBytes))
	}
	
	var result TextGenerationResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}
	
	return &result, nil
}

// Example usage:
// func main() {
//     client := neuralnexus.NewClient("${apiKey}", "production")
//     
//     req := neuralnexus.TextGenerationRequest{
//         Prompt:      "Write a short poem about AI",
//         MaxTokens:   256,
//         Temperature: 0.7,
//     }
//     
//     resp, err := client.GenerateText("gpt-nexus", req)
//     if err != nil {
//         fmt.Printf("Error: %v\\n", err)
//         return
//     }
//     
//     fmt.Printf("Generated text: %s\\n", resp.Text)
// }`;
  }

  static java(apiKey: string): string {
    return `import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

public class NeuralNexus {
    private final String apiKey;
    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public NeuralNexus(String apiKey, String environment) {
        this.apiKey = apiKey;
        this.baseUrl = "production".equals(environment) 
            ? "https://api.neuralnexus.ai/v1" 
            : "https://api.dev.neuralnexus.ai/v1";
        this.httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(30))
            .build();
        this.objectMapper = new ObjectMapper();
    }

    public NeuralNexus(String apiKey) {
        this(apiKey, "production");
    }

    public Map<String, Object> listModels() throws IOException, InterruptedException {
        return get("/models", Map.class);
    }

    public TextGenerationResponse generateText(String prompt, int maxTokens, double temperature) 
            throws IOException, InterruptedException {
        TextGenerationRequest request = new TextGenerationRequest(prompt, maxTokens, temperature);
        return post("/models/gpt-nexus/generate", request, TextGenerationResponse.class);
    }

    private <T> T get(String endpoint, Class<T> responseType) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + endpoint))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .GET()
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new IOException("API error: " + response.statusCode() + " " + response.body());
        }
        
        return objectMapper.readValue(response.body(), responseType);
    }

    private <T, R> R post(String endpoint, T requestBody, Class<R> responseType) 
            throws IOException, InterruptedException {
        String requestJson = objectMapper.writeValueAsString(requestBody);
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + endpoint))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestJson))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new IOException("API error: " + response.statusCode() + " " + response.body());
        }
        
        return objectMapper.readValue(response.body(), responseType);
    }

    public static class TextGenerationRequest {
        private final String prompt;
        private final int maxTokens;
        private final double temperature;

        public TextGenerationRequest(String prompt, int maxTokens, double temperature) {
            this.prompt = prompt;
            this.maxTokens = maxTokens;
            this.temperature = temperature;
        }

        public String getPrompt() { return prompt; }
        
        @JsonProperty("max_tokens")
        public int getMaxTokens() { return maxTokens; }
        
        public double getTemperature() { return temperature; }
    }

    public static class TextGenerationResponse {
        private String text;
        private Usage usage;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        
        public Usage getUsage() { return usage; }
        public void setUsage(Usage usage) { this.usage = usage; }
        
        public static class Usage {
            @JsonProperty("prompt_tokens")
            private int promptTokens;
            
            @JsonProperty("completion_tokens")
            private int completionTokens;
            
            @JsonProperty("total_tokens")
            private int totalTokens;

            public int getPromptTokens() { return promptTokens; }
            public void setPromptTokens(int promptTokens) { this.promptTokens = promptTokens; }
            
            public int getCompletionTokens() { return completionTokens; }
            public void setCompletionTokens(int completionTokens) { this.completionTokens = completionTokens; }
            
            public int getTotalTokens() { return totalTokens; }
            public void setTotalTokens(int totalTokens) { this.totalTokens = totalTokens; }
        }
    }

    // Example usage:
    // public static void main(String[] args) {
    //     try {
    //         NeuralNexus client = new NeuralNexus("${apiKey}");
    //         
    //         // List models
    //         Map<String, Object> models = client.listModels();
    //         System.out.println("Models: " + models);
    //         
    //         // Generate text
    //         TextGenerationResponse response = client.generateText(
    //             "Write a short poem about AI", 256, 0.7);
    //         System.out.println("Generated text: " + response.getText());
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //     }
    // }
}`;
  }

  static ruby(apiKey: string): string {
    return `require 'net/http'
require 'uri'
require 'json'

class NeuralNexus
  attr_reader :api_key, :base_url

  def initialize(api_key, environment = 'production')
    @api_key = api_key
    @base_url = environment == 'production' ? 
      'https://api.neuralnexus.ai/v1' : 
      'https://api.dev.neuralnexus.ai/v1'
  end

  def list_models
    get('/models')
  end

  def generate_text(prompt, max_tokens: 256, temperature: 0.7)
    data = {
      prompt: prompt,
      max_tokens: max_tokens,
      temperature: temperature
    }
    post('/models/gpt-nexus/generate', data)
  end

  private

  def get(endpoint, params = {})
    uri = URI("#{@base_url}#{endpoint}")
    uri.query = URI.encode_www_form(params) unless params.empty?
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Get.new(uri)
    request['Authorization'] = "Bearer #{@api_key}"
    request['Content-Type'] = 'application/json'
    
    response = http.request(request)
    
    if response.code.to_i >= 200 && response.code.to_i < 300
      JSON.parse(response.body)
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  end

  def post(endpoint, data)
    uri = URI("#{@base_url}#{endpoint}")
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Post.new(uri)
    request['Authorization'] = "Bearer #{@api_key}"
    request['Content-Type'] = 'application/json'
    request.body = data.to_json
    
    response = http.request(request)
    
    if response.code.to_i >= 200 && response.code.to_i < 300
      JSON.parse(response.body)
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  end
end

# Example usage:
# client = NeuralNexus.new('${apiKey}')
# 
# begin
#   # List models
#   models = client.list_models
#   puts "Models: #{models}"
#   
#   # Generate text
#   result = client.generate_text("Write a short poem about AI")
#   puts "Generated text: #{result['text']}"
# rescue => e
#   puts "Error: #{e.message}"
# end`;
  }

  static csharp(apiKey: string): string {
    return `using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace NeuralNexus
{
    public class NeuralNexusClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;

        public NeuralNexusClient(string apiKey, string environment = "production")
        {
            _apiKey = apiKey;
            _baseUrl = environment == "production" 
                ? "https://api.neuralnexus.ai/v1" 
                : "https://api.dev.neuralnexus.ai/v1";
            
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_baseUrl),
                Timeout = TimeSpan.FromSeconds(30)
            };
            
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<JsonElement> ListModelsAsync()
        {
            return await GetAsync<JsonElement>("/models");
        }

        public async Task<TextGenerationResponse> GenerateTextAsync(
            string prompt, 
            int maxTokens = 256, 
            double temperature = 0.7)
        {
            var request = new TextGenerationRequest
            {
                Prompt = prompt,
                MaxTokens = maxTokens,
                Temperature = temperature
            };
            
            return await PostAsync<TextGenerationRequest, TextGenerationResponse>(
                "/models/gpt-nexus/generate", request);
        }

        private async Task<T> GetAsync<T>(string endpoint)
        {
            var response = await _httpClient.GetAsync(endpoint);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content);
        }

        private async Task<TResponse> PostAsync<TRequest, TResponse>(string endpoint, TRequest request)
        {
            var jsonContent = JsonSerializer.Serialize(request, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
            
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(endpoint, content);
            
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            
            return JsonSerializer.Deserialize<TResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }

    public class TextGenerationRequest
    {
        [JsonPropertyName("prompt")]
        public string Prompt { get; set; }
        
        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; set; }
        
        [JsonPropertyName("temperature")]
        public double Temperature { get; set; }
    }

    public class TextGenerationResponse
    {
        [JsonPropertyName("text")]
        public string Text { get; set; }
        
        [JsonPropertyName("usage")]
        public Usage Usage { get; set; }
        
        public class Usage
        {
            [JsonPropertyName("prompt_tokens")]
            public int PromptTokens { get; set; }
            
            [JsonPropertyName("completion_tokens")]
            public int CompletionTokens { get; set; }
            
            [JsonPropertyName("total_tokens")]
            public int TotalTokens { get; set; }
        }
    }
}

// Example usage:
// using System;
// using System.Threading.Tasks;
// using NeuralNexus;
// 
// class Program
// {
//     static async Task Main(string[] args)
//     {
//         try
//         {
//             var client = new NeuralNexusClient("${apiKey}");
//             
//             // List models
//             var models = await client.ListModelsAsync();
//             Console.WriteLine($"Models: {models}");
//             
//             // Generate text
//             var response = await client.GenerateTextAsync("Write a short poem about AI");
//             Console.WriteLine($"Generated text: {response.Text}");
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine($"Error: {ex.Message}");
//         }
//     }
// }`;
  }

  static php(apiKey: string): string {
    return `<?php

class NeuralNexus {
    private $apiKey;
    private $baseUrl;

    public function __construct($apiKey, $environment = 'production') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $environment === 'production' 
            ? 'https://api.neuralnexus.ai/v1' 
            : 'https://api.dev.neuralnexus.ai/v1';
    }

    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        $curl = curl_init();
        
        $options = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30
        ];
        
        if ($method === 'POST') {
            $options[CURLOPT_POST] = true;
            if ($data) {
                $options[CURLOPT_POSTFIELDS] = json_encode($data);
            }
        } else if ($method === 'GET' && $data) {
            $url .= '?' . http_build_query($data);
            $options[CURLOPT_URL] = $url;
        }
        
        curl_setopt_array($curl, $options);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        curl_close($curl);
        
        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }
        
        $responseData = json_decode($response, true);
        
        if ($statusCode >= 400) {
            $errorMessage = isset($responseData['error']['message']) 
                ? $responseData['error']['message'] 
                : 'API Error: ' . $statusCode;
            throw new Exception($errorMessage);
        }
        
        return $responseData;
    }

    public function listModels() {
        return $this->request('GET', '/models');
    }

    public function generateText($prompt, $maxTokens = 256, $temperature = 0.7) {
        $data = [
            'prompt' => $prompt,
            'max_tokens' => $maxTokens,
            'temperature' => $temperature
        ];
        
        return $this->request('POST', '/models/gpt-nexus/generate', $data);
    }
}

// Example usage
$apiKey = '${apiKey}';
$neuralNexus = new NeuralNexus($apiKey);

try {
    // List models
    $models = $neuralNexus->listModels();
    echo "Available models: " . json_encode($models) . "\\n";
    
    // Generate text
    $result = $neuralNexus->generateText("Write a short poem about AI");
    echo "Generated text: " . $result['text'] . "\\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\\n";
}`;
  }

  static swift(apiKey: string): string {
    return `import Foundation

class NeuralNexus {
    private let apiKey: String
    private let baseURL: URL
    private let session: URLSession
    
    init(apiKey: String, environment: String = "production") {
        self.apiKey = apiKey
        let urlString = environment == "production" 
            ? "https://api.neuralnexus.ai/v1" 
            : "https://api.dev.neuralnexus.ai/v1"
        self.baseURL = URL(string: urlString)!
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
    }
    
    private func request<T: Decodable>(
        method: String,
        endpoint: String,
        parameters: [String: Any]? = nil,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        let url = baseURL.appendingPathComponent(endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.addValue("Bearer \\(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let parameters = parameters {
            if method == "GET" {
                var components = URLComponents(url: url, resolvingAgainstBaseURL: true)!
                components.queryItems = parameters.map { 
                    URLQueryItem(name: $0.key, value: String(describing: $0.value))
                }
                request.url = components.url
            } else {
                do {
                    request.httpBody = try JSONSerialization.data(withJSONObject: parameters)
                } catch {
                    completion(.failure(error))
                    return
                }
            }
        }
        
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                completion(.failure(NSError(domain: "NeuralNexusError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "NeuralNexusError", code: -2, userInfo: [NSLocalizedDescriptionKey: "No data received"])))
                return
            }
            
            if httpResponse.statusCode >= 400 {
                do {
                    let errorResponse = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    let errorMessage = (errorResponse?["error"] as? [String: Any])?["message"] as? String ?? "API Error: \\(httpResponse.statusCode)"
                    completion(.failure(NSError(domain: "NeuralNexusError", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: errorMessage])))
                } catch {
                    completion(.failure(NSError(domain: "NeuralNexusError", code: httpResponse.statusCode, userInfo: [NSLocalizedDescriptionKey: "API Error: \\(httpResponse.statusCode)"])))
                }
                return
            }
            
            do {
                let decodedResponse = try JSONDecoder().decode(T.self, from: data)
                completion(.success(decodedResponse))
            } catch {
                completion(.failure(error))
            }
        }
        
        task.resume()
    }
    
    func listModels(completion: @escaping (Result<[String: Any], Error>) -> Void) {
        request(method: "GET", endpoint: "/models", completion: completion)
    }
    
    func generateText(
        prompt: String, 
        maxTokens: Int = 256, 
        temperature: Double = 0.7,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        let parameters: [String: Any] = [
            "prompt": prompt,
            "max_tokens": maxTokens,
            "temperature": temperature
        ]
        
        request(method: "POST", endpoint: "/models/gpt-nexus/generate", parameters: parameters, completion: completion)
    }
}

// Example usage (Swift doesn't run without a proper app/playground setup)
/*
let neuralNexus = NeuralNexus(apiKey: "${apiKey}")

// List models
neuralNexus.listModels { result in
    switch result {
    case .success(let models):
        print("Available models: \\(models)")
    case .failure(let error):
        print("Error listing models: \\(error)")
    }
}

// Generate text
neuralNexus.generateText(prompt: "Write a short poem about AI") { result in
    switch result {
    case .success(let response):
        if let text = response["text"] as? String {
            print("Generated text: \\(text)")
        }
    case .failure(let error):
        print("Error generating text: \\(error)")
    }
}
*/`;
  }

  static rust(apiKey: string): string {
    return `use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct NeuralNexus {
    api_key: String,
    base_url: String,
    client: Client,
}

#[derive(Debug, Serialize)]
pub struct TextGenerationRequest {
    prompt: String,
    #[serde(rename = "max_tokens")]
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stop: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct Usage {
    #[serde(rename = "prompt_tokens")]
    prompt_tokens: u32,
    #[serde(rename = "completion_tokens")]
    completion_tokens: u32,
    #[serde(rename = "total_tokens")]
    total_tokens: u32,
}

#[derive(Debug, Deserialize)]
pub struct TextGenerationResponse {
    text: String,
    usage: Usage,
}

impl NeuralNexus {
    pub fn new(api_key: &str, environment: &str) -> Self {
        let base_url = match environment {
            "production" => "https://api.neuralnexus.ai/v1".to_string(),
            _ => "https://api.dev.neuralnexus.ai/v1".to_string(),
        };
        
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");
            
        NeuralNexus {
            api_key: api_key.to_string(),
            base_url,
            client,
        }
    }
    
    pub async fn list_models(&self) -> Result<serde_json::Value, Box<dyn Error>> {
        let url = format!("{}/models", self.base_url);
        
        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .send()
            .await?;
            
        if response.status() != StatusCode::OK {
            let error_text = response.text().await?;
            return Err(format!("API error: {}", error_text).into());
        }
        
        let result = response.json::<serde_json::Value>().await?;
        Ok(result)
    }
    
    pub async fn generate_text(
        &self,
        prompt: &str,
        max_tokens: Option<u32>,
        temperature: Option<f32>,
    ) -> Result<TextGenerationResponse, Box<dyn Error>> {
        let url = format!("{}/models/gpt-nexus/generate", self.base_url);
        
        let request = TextGenerationRequest {
            prompt: prompt.to_string(),
            max_tokens,
            temperature,
            stop: None,
        };
        
        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
            
        if response.status() != StatusCode::OK {
            let error_text = response.text().await?;
            return Err(format!("API error: {}", error_text).into());
        }
        
        let result = response.json::<TextGenerationResponse>().await?;
        Ok(result)
    }
}

// Example usage (Rust requires a proper async runtime)
/*
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let neural_nexus = NeuralNexus::new("${apiKey}", "production");
    
    // List models
    match neural_nexus.list_models().await {
        Ok(models) => println!("Available models: {:?}", models),
        Err(e) => println!("Error listing models: {}", e),
    }
    
    // Generate text
    match neural_nexus.generate_text("Write a short poem about AI", Some(256), Some(0.7)).await {
        Ok(response) => println!("Generated text: {}", response.text),
        Err(e) => println!("Error generating text: {}", e),
    }
    
    Ok(())
}
*/`;
  }
}

/**
 * Manages SDK generation for different programming languages
 */
export class SdkManager {
  private client: NeuralNexus;

  /**
   * Creates a new SdkManager instance
   * @param client The NeuralNexus client instance
   */
  constructor(client: NeuralNexus) {
    this.client = client;
  }

  /**
   * Generates SDK code for a specific language
   * @param options SDK generation options
   * @returns Generated SDK code as a string
   */
  generateSdk(options: SdkOptions): string {
    const apiKey = 'YOUR_API_KEY'; // For security, we don't include the actual API key in generated code
    
    switch (options.language) {
      case 'typescript':
      case 'javascript':
        return SdkTemplates.typescript(apiKey);
      case 'python':
        return SdkTemplates.python(apiKey);
      case 'go':
        return SdkTemplates.go(apiKey);
      case 'java':
        return SdkTemplates.java(apiKey);
      case 'ruby':
        return SdkTemplates.ruby(apiKey);
      case 'csharp':
        return SdkTemplates.csharp(apiKey);
      case 'php':
        return SdkTemplates.php(apiKey);
      case 'swift':
        return SdkTemplates.swift(apiKey);
      case 'rust':
        return SdkTemplates.rust(apiKey);
      default:
        throw new NeuralNexusError(
          `SDK generation for ${options.language} is not yet supported`,
          'UNSUPPORTED_LANGUAGE'
        );
    }
  }

  /**
   * Gets a list of supported SDK languages
   * @returns Array of supported languages
   */
  getSupportedLanguages(): SdkLanguage[] {
    return [
      'typescript', 
      'javascript', 
      'python', 
      'go', 
      'java', 
      'ruby', 
      'csharp',
      'php',
      'swift',
      'rust'
    ];
  }

  /**
   * Checks if a language is supported
   * @param language The language to check
   * @returns True if the language is supported, false otherwise
   */
  isLanguageSupported(language: string): boolean {
    return this.getSupportedLanguages().includes(language as SdkLanguage);
  }
} 