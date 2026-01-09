package com.FarmChainX.backend.Controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:5173"}) // UPDATE THIS
public class CropAIController {
    
    private static final Logger logger = LoggerFactory.getLogger(CropAIController.class);
    
    @Value("${groq.api.key}")
    private String apiKey;
    
    private final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    
    @PostMapping("/crop-info")
    public Map<String, Object> getCropInfo(@RequestBody Map<String, String> request) {
        logger.info("=== AI API CALLED ===");
        logger.info("Request received: {}", request);
        
        String cropName = request.get("cropName");
        logger.info("Crop name: {}", cropName);
        
        if (cropName == null || cropName.trim().isEmpty()) {
            logger.warn("Empty crop name provided");
            return createErrorResponse("Crop name is required");
        }
        
        String prompt = createPrompt(cropName);
        logger.info("Sending request to Groq API...");
        
        Map<String, Object> result = callGroqAPI(prompt, cropName);
        logger.info("Response prepared: {}", result.get("success"));
        
        return result;
    }
    
    private String createPrompt(String cropName) {
        return "You are an agricultural expert. Provide detailed information about: " + cropName + "\n\n" +
               "Format your response EXACTLY like this JSON:\n" +
               "{\n" +
               "  \"TYPE\": \"[Fruit/Vegetable/Grain/Legume/Nut/Herb/Spice]\",\n" +
               "  \"SCIENTIFIC_NAME\": \"[Scientific name]\",\n" +
               "  \"FAMILY\": \"[Plant family]\",\n" +
               "  \"CALORIES\": \"[Calories per 100g]\",\n" +
               "  \"NUTRITION\": \"[Key nutrients]\",\n" +
               "  \"SEASON\": \"[Growing season]\",\n" +
               "  \"PLANTING_TIME\": \"[Best planting time]\",\n" +
               "  \"HARVEST_TIME\": \"[Harvest time]\",\n" +
               "  \"CROP_DURATION\": \"[Growth duration]\",\n" +
               "  \"SOIL_PH\": \"[Ideal soil pH]\",\n" +
               "  \"SOIL_TYPE\": \"[Preferred soil type]\",\n" +
               "  \"WATER_REQUIREMENT\": \"[Water needs]\",\n" +
               "  \"TEMPERATURE\": \"[Temperature range]\",\n" +
               "  \"RAINFALL\": \"[Rainfall requirement]\",\n" +
               "  \"SUNLIGHT\": \"[Sunlight needs]\",\n" +
               "  \"COMMON_VARIETIES\": \"[Common varieties]\",\n" +
               "  \"MARKET_PRICE\": \"[Market price range]\",\n" +
               "  \"STORAGE\": \"[Storage tips]\",\n" +
               "  \"SHELF_LIFE\": \"[Shelf life]\",\n" +
               "  \"YIELD\": \"[Average yield]\",\n" +
               "  \"COMMON_DISEASES\": \"[Common diseases]\",\n" +
               "  \"PEST_PROBLEMS\": \"[Pest problems]\",\n" +
               "  \"HEALTH_BENEFITS\": \"[Health benefits]\",\n" +
               "  \"USES\": \"[Common uses]\",\n" +
               "  \"FUN_FACT\": \"[Interesting fact]\"\n" +
               "}\n\n" +
               "Provide accurate information for " + cropName + ".";
    }
    
    private Map<String, Object> callGroqAPI(String prompt, String cropName) {
        try {
            logger.info("Calling Groq API with key: {}...", apiKey.substring(0, Math.min(apiKey.length(), 10)) + "...");
            
            RestTemplate restTemplate = new RestTemplate();
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");
            requestBody.put("messages", new Object[]{
                Map.of("role", "user", "content", prompt)
            });
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 1500);
            requestBody.put("response_format", Map.of("type", "json_object"));
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");
            
            org.springframework.http.HttpEntity<Map<String, Object>> entity = 
                new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            logger.info("Sending request to Groq...");
            Map<String, Object> response = restTemplate.postForObject(GROQ_URL, entity, Map.class);
            logger.info("Groq API response received");
            
            return parseResponse(response, cropName);
            
        } catch (Exception e) {
            logger.error("Groq API call failed: {}", e.getMessage(), e);
            return createFallbackResponse(cropName);
        }
    }
    
    private Map<String, Object> parseResponse(Map<String, Object> response, String cropName) {
        Map<String, Object> result = new HashMap<>();
        result.put("cropName", cropName);
        result.put("timestamp", new Date());
        
        try {
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    logger.info("Groq response content: {}", content);
                    
                    // Parse JSON response
                    Map<String, String> parsedData = parseJsonResponse(content);
                    result.put("data", parsedData);
                    result.put("success", true);
                    result.put("message", "Real AI data from Groq API");
                    logger.info("Successfully parsed Groq response");
                    return result;
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing Groq response: {}", e.getMessage(), e);
        }
        
        logger.warn("Using fallback response");
        return createFallbackResponse(cropName);
    }
    
    private Map<String, String> parseJsonResponse(String content) {
        Map<String, String> data = new HashMap<>();
        try {
            // Remove markdown code blocks if present
            content = content.replace("```json", "").replace("```", "").trim();
            
            // Parse JSON
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> jsonMap = mapper.readValue(content, Map.class);
            
            // Convert all values to String
            for (Map.Entry<String, Object> entry : jsonMap.entrySet()) {
                data.put(entry.getKey().toUpperCase(), String.valueOf(entry.getValue()));
            }
            
            // Ensure all required fields exist
            String[] requiredFields = {
                "TYPE", "SCIENTIFIC_NAME", "FAMILY", "CALORIES", "NUTRITION",
                "SEASON", "PLANTING_TIME", "HARVEST_TIME", "CROP_DURATION",
                "SOIL_PH", "SOIL_TYPE", "WATER_REQUIREMENT", "TEMPERATURE",
                "RAINFALL", "SUNLIGHT", "COMMON_VARIETIES", "MARKET_PRICE",
                "STORAGE", "SHELF_LIFE", "YIELD", "COMMON_DISEASES",
                "PEST_PROBLEMS", "HEALTH_BENEFITS", "USES", "FUN_FACT"
            };
            
            for (String field : requiredFields) {
                if (!data.containsKey(field)) {
                    data.put(field, "Information not available");
                }
            }
            
        } catch (Exception e) {
            logger.error("Failed to parse JSON response: {}", e.getMessage());
            // Fallback to old parsing method
            return parseStructuredResponse(content);
        }
        return data;
    }
    
    private Map<String, String> parseStructuredResponse(String content) {
        Map<String, String> data = new HashMap<>();
        String[] lines = content.split("\n");
        
        for (String line : lines) {
            if (line.contains(":")) {
                String[] parts = line.split(":", 2);
                if (parts.length == 2) {
                    String key = parts[0].trim().toUpperCase();
                    String value = parts[1].trim();
                    data.put(key, value);
                }
            }
        }
        return data;
    }
    
    private Map<String, Object> createFallbackResponse(String cropName) {
        Map<String, Object> result = new HashMap<>();
        Map<String, String> fallbackData = new HashMap<>();
        
        fallbackData.put("TYPE", "Information not available");
        fallbackData.put("CALORIES", "Data loading...");
        fallbackData.put("NUTRITION", "Try another crop or check back later");
        fallbackData.put("USES", "Common agricultural crop");
        
        result.put("cropName", cropName);
        result.put("data", fallbackData);
        result.put("success", false);
        result.put("message", "Using fallback data. Check your API key or try again.");
        
        return result;
    }
    
    private Map<String, Object> createErrorResponse(String errorMessage) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", errorMessage);
        result.put("data", new HashMap<>());
        return result;
    }
}