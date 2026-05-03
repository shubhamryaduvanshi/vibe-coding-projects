// unitConverter.ts
export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'piece';

export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

// Volume base is ml
const volumeConversions: Record<string, number> = {
  ml: 1,
  l: 1000,
  tsp: 5,
  tbsp: 15,
  cup: 240,
};

// Weight base is g
const weightConversions: Record<string, number> = {
  g: 1,
  kg: 1000,
};

// Density map (grams per ml) for cross-unit conversion
const densityMap: Record<string, number> = {
  flour: 0.53,      // 1 cup ~ 125g
  sugar: 0.85,      // 1 cup ~ 200g
  butter: 0.96,     // 1 cup ~ 227g
  milk: 1.03,       // 1 cup ~ 245g
  water: 1.0,       // 1 cup ~ 240g
  oil: 0.92,        // 1 cup ~ 218g
  salt: 1.2,        // 1 tbsp ~ 18g
  rice: 0.83,       // 1 cup ~ 200g
  honey: 1.42,      // 1 cup ~ 340g
  cheese: 0.45,     // 1 cup grated ~ 100g
};

export class UnitConverter {
  /**
   * Determine the density of an ingredient based on name matching
   */
  private static getDensity(name: string): number | null {
    const lowerName = name.toLowerCase();
    for (const [key, density] of Object.entries(densityMap)) {
      if (lowerName.includes(key)) {
        return density;
      }
    }
    return null; // Density unknown
  }

  /**
   * Converts a given quantity and unit into a standard base unit
   * Strategy:
   * - If it's already a weight, return base weight (g)
   * - If it's already a volume, return base volume (ml)
   * - If we have density and need to cross-convert, favor grams
   * - Otherwise, return as-is
   */
  public static convertToBase(quantity: number, unit: string, name: string): { qty: number; baseUnit: string } {
    const normalizedUnit = unit.toLowerCase().trim();

    if (weightConversions[normalizedUnit]) {
      return { qty: quantity * weightConversions[normalizedUnit], baseUnit: 'g' };
    }

    if (volumeConversions[normalizedUnit]) {
      const ml = quantity * volumeConversions[normalizedUnit];
      // Try to convert to grams if we know the density
      const density = this.getDensity(name);
      if (density !== null) {
        return { qty: ml * density, baseUnit: 'g' };
      }
      return { qty: ml, baseUnit: 'ml' };
    }

    // Unrecognized unit or 'piece'
    return { qty: quantity, baseUnit: normalizedUnit };
  }

  /**
   * Formats a quantity back into a readable unit (e.g., 1500g -> 1.5kg)
   */
  public static formatFromBase(quantity: number, baseUnit: string): { qty: number; unit: string } {
    if (baseUnit === 'g' && quantity >= 1000) {
      return { qty: Number((quantity / 1000).toFixed(2)), unit: 'kg' };
    }
    if (baseUnit === 'ml' && quantity >= 1000) {
      return { qty: Number((quantity / 1000).toFixed(2)), unit: 'l' };
    }
    return { qty: Number(quantity.toFixed(1)), unit: baseUnit };
  }

  /**
   * Merges a list of ingredients, standardizing units and summing quantities
   */
  public static mergeIngredients(ingredients: ParsedIngredient[]): ParsedIngredient[] {
    const merged: Record<string, { qty: number; unit: string }> = {};

    ingredients.forEach((ing) => {
      // Normalize name for grouping (e.g., "All Purpose Flour" -> "all purpose flour")
      const groupKey = ing.name.toLowerCase().trim();
      const { qty: baseQty, baseUnit } = this.convertToBase(ing.quantity, ing.unit, groupKey);
      
      const mapKey = `${groupKey}|${baseUnit}`;

      if (merged[mapKey]) {
        merged[mapKey].qty += baseQty;
      } else {
        merged[mapKey] = { qty: baseQty, unit: baseUnit };
      }
    });

    // Format back to sensible units
    return Object.entries(merged).map(([key, data]) => {
      const [name] = key.split('|');
      const formatted = this.formatFromBase(data.qty, data.unit);
      
      return {
        // Capitalize first letter of name
        name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity: formatted.qty,
        unit: formatted.unit
      };
    });
  }

  /**
   * Simple heuristic to group ingredients into aisles
   */
  public static getAisleGroup(ingredientName: string): string {
    const lower = ingredientName.toLowerCase();
    
    if (lower.match(/apple|banana|carrot|onion|garlic|tomato|potato|lemon|lime|greens|lettuce|spinach|berry/)) return 'Produce';
    if (lower.match(/milk|cheese|butter|yogurt|cream|egg/)) return 'Dairy & Eggs';
    if (lower.match(/chicken|beef|pork|fish|salmon|bacon|sausage|meat/)) return 'Meat & Seafood';
    if (lower.match(/flour|sugar|baking|vanilla|chocolate|yeast/)) return 'Baking';
    if (lower.match(/salt|pepper|cinnamon|cumin|paprika|herb|spice|basil|oregano/)) return 'Spices';
    if (lower.match(/oil|vinegar|soy sauce|sauce|dressing/)) return 'Pantry';
    if (lower.match(/pasta|rice|noodle|bean|lentil|cereal|bread|tortilla/)) return 'Grains & Pasta';
    
    return 'Other';
  }
}
