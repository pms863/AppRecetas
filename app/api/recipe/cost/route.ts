import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

interface ParsedQuantity {
    amount: number;
    unit: string;
    originalText: string;
}

interface IngredientCost {
    ingredient: string;
    measure: string;
    price: number | null;
    currency: string;
    found: boolean;
    searchedTerm: string;
    parsedQuantity?: ParsedQuantity;
    pricePerKilo?: number;
    calculatedPrice?: number;
    pricePerKiloText?: string; // Texto del precio por kilo directamente de DIA
}

interface CostCalculationResponse {
    ingredients: IngredientCost[];
    totalCost: number;
    currency: string;
    estimatedCost: boolean;
    source: string;
}

// Function to clean and normalize ingredient names for search
function normalizeIngredientName(ingredient: string): string {
    return ingredient
        .toLowerCase()
        .replace(/[^a-z\s]/g, '') // Remove special characters
        .replace(/\b(small|large|medium|big|fresh|organic|raw|cooked|dried|frozen)\s+/g, '') // Remove size/quality adjectives
        .replace(/\bpotatoes?\b/g, 'potato') // Normalize potatoes to potato
        .replace(/\btomatoes?\b/g, 'tomato') // Normalize tomatoes to tomato
        .replace(/\bcarrots?\b/g, 'carrot') // Normalize carrots to carrot
        .replace(/\bonions?\b/g, 'onion') // Normalize onions to onion
        .trim()
        .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

// Translation dictionary for common ingredients (English to Spanish)
function translateIngredientToSpanish(ingredient: string): string {
    const translations: { [key: string]: string } = {
        // Vegetables
        'potato': 'patata',
        'potatoes': 'patatas',
        'small potato': 'patata',
        'small potatoes': 'patatas',
        'carrot': 'zanahoria',
        'carrots': 'zanahorias',
        'onion': 'cebolla',
        'onions': 'cebollas',
        'tomato': 'tomate',
        'tomatoes': 'tomates',
        'cabbage': 'repollo',
        'lettuce': 'lechuga',
        'spinach': 'espinacas',
        'broccoli': 'brocoli',
        'cauliflower': 'coliflor',
        'pepper': 'pimiento',
        'bell pepper': 'pimiento',
        'garlic': 'ajo',
        'garlic clove': 'diente de ajo',
        'garlic cloves': 'dientes de ajo',
        'ginger': 'jengibre',
        'cucumber': 'pepino',
        'zucchini': 'calabacin',
        'eggplant': 'berenjena',
        'mushroom': 'champiñon',
        'mushrooms': 'champiñones',
        'celery': 'apio',
        'leek': 'puerro',
        'leeks': 'puerros',

        // Fruits
        'apple': 'manzana',
        'banana': 'platano',
        'orange': 'naranja',
        'lemon': 'limon',
        'lime': 'lima',
        'strawberry': 'fresa',
        'strawberries': 'fresas',

        // Herbs & Spices
        'parsley': 'perejil',
        'cilantro': 'cilantro',
        'basil': 'albahaca',
        'oregano': 'orégano',
        'thyme': 'tomillo',
        'rosemary': 'romero',
        'bay leaf': 'laurel',
        'bay leaves': 'laurel',

        // Beans & Legumes
        'beans': 'judías',
        'chickpeas': 'garbanzos',
        'lentils': 'lentejas',
        'black beans': 'judías negras',
        'kidney beans': 'judías rojas',

        // Dairy & Meat
        'milk': 'leche',
        'butter': 'mantequilla',
        'cheese': 'queso',
        'eggs': 'huevos',
        'chicken': 'pollo',
        'beef': 'ternera',
        'pork': 'cerdo',
        'fish': 'pescado',

        // Grains & Pasta
        'rice': 'arroz',
        'pasta': 'pasta',
        'bread': 'pan',
        'flour': 'harina',

        // Oils & Vinegars
        'oil': 'aceite',
        'olive oil': 'aceite de oliva',
        'vinegar': 'vinagre',

        // Other
        'wine': 'vino',
        'water': 'agua',
        'beer': 'cerveza',
        'stock': 'caldo',
        'broth': 'caldo',
        'noodles': 'fideos',
        'salt': 'sal',
        'sugar': 'azucar',
        'honey': 'miel'
    };

    // First try exact match
    const normalizedIngredient = normalizeIngredientName(ingredient);
    if (translations[normalizedIngredient]) {
        return translations[normalizedIngredient];
    }

    // Try partial matches for compound ingredients
    for (const [english, spanish] of Object.entries(translations)) {
        if (normalizedIngredient.includes(english)) {
            return spanish;
        }
    }    // If no translation found, return original
    return ingredient;
}

// Function to search for ingredient price on DIA España
async function searchIngredientPrice(ingredient: string): Promise<{ price: number | null, currency: string, found: boolean, searchUrl?: string, pricePerKiloText?: string }> {
    try {
        // First translate the ingredient to Spanish
        const translatedIngredient = translateIngredientToSpanish(ingredient);
        const searchTerm = normalizeIngredientName(translatedIngredient);        // Simple search: just use the translated term as-is
        const query = searchTerm;
        const diaSearchUrl = `https://www.dia.es/search?q=${encodeURIComponent(query)}`;

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }; try {
            const response = await axios.get(diaSearchUrl, {
                headers,
                timeout: 15000,
                maxRedirects: 5,
                validateStatus: (status) => status < 500
            }); if (response.status !== 200) {
                return {
                    price: null,
                    currency: 'EUR',
                    found: false
                };
            }

            const $ = cheerio.load(response.data);

            // Check for search results in DIA
            const searchResults = $('.search-product-card, [data-test-id*="search-product-card"]');

            if (searchResults.length === 0) {
                return {
                    price: null,
                    currency: 'EUR',
                    found: false
                };
            }

            // Simply take the first product with a valid price - no relevance filtering
            let foundPrice: number | null = null;
            let foundTitle: string = '';
            let foundPricePerKilo: string = '';

            searchResults.each((index: number, element: any) => {
                if (foundPrice !== null) return false; // Stop once we find the first price

                const productCard = $(element);                // Get product title - more specific selectors
                const titleElement = productCard.find('[data-test-id="search-product-card-name"] p, .search-product-card__product-name');
                const title = titleElement.text().trim();

                // Get product price - focus on the specific DIA structure
                const priceSelectors = [
                    '[data-test-id="search-product-card-unit-price"]', // Primary selector for DIA
                    '.search-product-card__active-price', // Alternative class name
                    '[data-test-id="search-product-card-prices"] p:first-child', // First price in prices section
                    '.search-product-card__prices p:first-child', // Fallback
                    '[data-test-id*="current-price"]',
                    '.current-price'
                ];                // Also get price per kilo
                const pricePerKiloSelectors = [
                    '[data-test-id="search-product-card-kilo-price"]',
                    '.search-product-card__price-per-unit',
                    '[data-test-id="search-product-card-prices"] p:last-child'
                ];

                let pricePerKiloText = '';
                for (const selector of pricePerKiloSelectors) {
                    const kiloElements = productCard.find(selector);
                    if (kiloElements.length > 0) {
                        pricePerKiloText = kiloElements.first().text()
                            .replace(/&nbsp;/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        break;
                    }
                }

                for (const selector of priceSelectors) {
                    const priceElements = productCard.find(selector);
                    if (priceElements.length > 0) {
                        let priceText = priceElements.first().text();

                        // Clean up the price text (remove &nbsp; and other HTML entities)
                        priceText = priceText
                            .replace(/&nbsp;/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();                        // Try different price patterns - updated for DIA format
                        const pricePatterns = [
                            /(\d+,\d+)\s*€/,        // "1,99 €"
                            /(\d+\.\d+)\s*€/,       // "1.99 €" 
                            /€\s*(\d+,\d+)/,        // "€ 1,99"
                            /€\s*(\d+\.\d+)/,       // "€ 1.99"
                            /(\d+,\d+)/,            // "1,99" without €
                            /(\d+\.\d+)/            // "1.99" without €
                        ];

                        for (const pattern of pricePatterns) {
                            const match = priceText.match(pattern); if (match) {
                                // Replace comma with dot for proper float parsing
                                const priceStr = match[1].replace(',', '.');
                                const extractedPrice = parseFloat(priceStr); if (extractedPrice >= 0.10 && extractedPrice <= 500) {
                                    foundPrice = extractedPrice;
                                    foundTitle = title;
                                    foundPricePerKilo = pricePerKiloText;
                                    break;
                                }
                            }
                        }
                        if (foundPrice !== null) break;
                    }
                }
            }); if (foundPrice !== null) {
                return {
                    price: foundPrice,
                    currency: 'EUR',
                    found: true,
                    searchUrl: diaSearchUrl,
                    pricePerKiloText: foundPricePerKilo
                };
            } else {
                return {
                    price: null,
                    currency: 'EUR',
                    found: false
                };
            }
        } catch (requestError) {
            return {
                price: null,
                currency: 'EUR',
                found: false
            };
        }

        return {
            price: null,
            currency: 'EUR',
            found: false
        };
    } catch (error) {
        return {
            price: null,
            currency: 'EUR',
            found: false
        };
    }
}

// Function to parse quantity from measure string
function parseQuantityFromMeasure(measure: string): ParsedQuantity | null {
    if (!measure || measure.trim() === '') return null;

    const measureText = measure.toLowerCase().trim();

    // Common patterns for quantities and units
    const patterns = [
        // Pattern: number + unit (e.g., "2 cups", "500g", "1 tsp")
        /(\d+(?:\.\d+)?)\s*(cups?|cup|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pints?|quarts?)/,
        // Pattern: fraction + unit (e.g., "1/2 cup", "3/4 tsp")
        /(\d+\/\d+)\s*(cups?|cup|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pints?|quarts?)/,
        // Pattern: just number (assume grams for solids)
        /(\d+(?:\.\d+)?)\s*$/
    ];

    for (const pattern of patterns) {
        const match = measureText.match(pattern);
        if (match) {
            let amount: number;
            const unit = match[2] || 'g'; // Default to grams if no unit

            // Handle fractions
            if (match[1].includes('/')) {
                const [numerator, denominator] = match[1].split('/').map(Number);
                amount = numerator / denominator;
            } else {
                amount = parseFloat(match[1]);
            }

            return {
                amount,
                unit,
                originalText: measure
            };
        }
    }

    return null;
}

// Function to convert different units to grams (approximate)
function convertToGrams(amount: number, unit: string): number {
    const conversions: { [key: string]: number } = {
        // Weight units
        'g': 1,
        'gram': 1,
        'grams': 1,
        'kg': 1000,
        'kilogram': 1000,
        'kilograms': 1000,
        'oz': 28.35,
        'ounce': 28.35,
        'ounces': 28.35,
        'lb': 453.59,
        'lbs': 453.59,
        'pound': 453.59,
        'pounds': 453.59,

        // Volume to weight (very approximate, assumes water density)
        'ml': 1,
        'milliliter': 1,
        'milliliters': 1,
        'l': 1000,
        'liter': 1000,
        'liters': 1000,
        'cup': 240,
        'cups': 240,
        'tbsp': 15,
        'tablespoon': 15,
        'tablespoons': 15,
        'tsp': 5,
        'teaspoon': 5,
        'teaspoons': 5,
        'pint': 473,
        'pints': 473,
        'quart': 946,
        'quarts': 946
    };

    const conversionFactor = conversions[unit.toLowerCase()] || 1;
    return amount * conversionFactor;
}

// Function to calculate proportional price based on quantity
function calculateProportionalPrice(pricePerKilo: number, quantityInGrams: number): number {
    return (pricePerKilo * quantityInGrams) / 1000;
}

// Fallback price estimates for common ingredients (per kg in EUR)
const fallbackPrices: { [key: string]: number } = {
    'potato': 1.5,
    'carrot': 1.2,
    'onion': 1.8,
    'tomato': 3.0,
    'lettuce': 2.5,
    'spinach': 4.0,
    'broccoli': 3.5,
    'chicken': 8.0,
    'beef': 15.0,
    'pork': 10.0,
    'fish': 12.0,
    'rice': 2.0,
    'pasta': 1.5,
    'oil': 4.0,
    'butter': 8.0,
    'milk': 1.0,
    'cheese': 12.0,
    'eggs': 3.0
};

export async function POST(request: NextRequest) {
    try {
        const { ingredients } = await request.json();

        if (!ingredients || !Array.isArray(ingredients)) {
            return NextResponse.json(
                { error: 'Invalid ingredients data. Expected an array of ingredients.' },
                { status: 400 }
            );
        }

        const results: IngredientCost[] = [];
        let totalCost = 0;
        let hasEstimatedCost = false;

        for (const ingredient of ingredients) {
            if (!ingredient.ingredient || typeof ingredient.ingredient !== 'string') {
                continue;
            } const searchResult = await searchIngredientPrice(ingredient.ingredient);

            let price: number | null = null;

            if (searchResult.found && searchResult.price !== null) {
                // Use the found price directly (unit price from DIA)
                price = searchResult.price;
            } else {
                // Use fallback price for estimation
                const normalizedIngredient = normalizeIngredientName(ingredient.ingredient);
                const translatedIngredient = translateIngredientToSpanish(ingredient.ingredient);
                const normalizedTranslated = normalizeIngredientName(translatedIngredient);

                price = fallbackPrices[normalizedIngredient] ||
                    fallbackPrices[normalizedTranslated] ||
                    5.0; // Default fallback

                hasEstimatedCost = true;
            }

            const result: IngredientCost = {
                ingredient: ingredient.ingredient,
                measure: ingredient.measure || '',
                price: price,
                currency: 'EUR',
                found: searchResult.found,
                searchedTerm: translateIngredientToSpanish(ingredient.ingredient),
                pricePerKiloText: searchResult.pricePerKiloText || undefined
            }; results.push(result);
            if (price !== null) {
                totalCost += price;
            }
        }

        const response: CostCalculationResponse = {
            ingredients: results,
            totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
            currency: 'EUR',
            estimatedCost: hasEstimatedCost,
            source: hasEstimatedCost ? 'DIA España + Estimates' : 'DIA España'
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error in cost calculation API:', error);
        return NextResponse.json(
            { error: 'Internal server error during cost calculation' },
            { status: 500 }
        );
    }
}
