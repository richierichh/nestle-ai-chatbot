// Nestlé product nutritional information database

export interface NutritionalInfo {
  name: string;
  servingSize: string;
  calories: number;
  protein?: number;
  carbohydrates?: number;
  sugars?: number;
  fat?: {
    total: number;
    saturated?: number;
  };
  variants?: NutritionalInfo[];
  description?: string;
}

export const nutritionalDatabase: Record<string, NutritionalInfo[]> = {
  "kitkat": [
    {
      name: "KITKAT 4-Finger Wafer Bar, Milk Chocolate",
      servingSize: "45g",
      calories: 230,
      protein: 3,
      carbohydrates: 27,
      sugars: 21,
      fat: {
        total: 12,
        saturated: 7.5
      },
      description: "Four crisp wafer fingers covered in smooth milk chocolate"
    },
    {
      name: "KITKAT Valentine's Mini Chocolate Wafer Bars Pack of 30",
      servingSize: "36g (3 bars)",
      calories: 180,
      protein: 2.4,
      carbohydrates: 21.6,
      sugars: 16.8,
      fat: {
        total: 9.6,
        saturated: 6
      },
      description: "Mini KitKat bars perfect for sharing on Valentine's Day"
    },
    {
      name: "KITKAT Christmas Holiday Advent Calendar",
      servingSize: "varies",
      calories: 0,
      description: "Holiday advent calendar with various KitKat treats",
      variants: [
        {
          name: "Kit Kat Characters",
          servingSize: "8.2g (1 piece)",
          calories: 45
        },
        {
          name: "KitKat Bubbles",
          servingSize: "7g (1 piece)",
          calories: 40
        },
        {
          name: "KitKat Santa",
          servingSize: "29g (1 piece)",
          calories: 160
        },
        {
          name: "KitKat mini bar",
          servingSize: "12g (1 piece)",
          calories: 60
        }
      ]
    },
    {
      name: "KITKAT Chunky Extreme Choc Wafer Bar",
      servingSize: "48g",
      calories: 250,
      protein: 3.5,
      carbohydrates: 26,
      sugars: 22,
      fat: {
        total: 14,
        saturated: 8.5
      },
      description: "Extra thick KitKat with more chocolate"
    }
  ],
  "aero": [
    {
      name: "AERO Milk Chocolate Bar",
      servingSize: "40g",
      calories: 220,
      protein: 2.5,
      carbohydrates: 24,
      sugars: 23,
      fat: {
        total: 12,
        saturated: 7.5
      },
      description: "Smooth milk chocolate with unique bubbly texture"
    },
    {
      name: "AERO Truffle Salted Caramel",
      servingSize: "36g",
      calories: 190,
      protein: 2,
      carbohydrates: 22,
      sugars: 20,
      fat: {
        total: 11,
        saturated: 7
      },
      description: "Bubbly chocolate with salted caramel truffle center"
    },
    {
      name: "AERO Scoops Vanilla Bean",
      servingSize: "100ml",
      calories: 135,
      protein: 2,
      carbohydrates: 18,
      sugars: 15,
      fat: {
        total: 6,
        saturated: 4
      },
      description: "Vanilla ice cream with AERO bubbles"
    },
    {
      name: "AERO Scoops Double Chocolate",
      servingSize: "100ml",
      calories: 145,
      protein: 2.5,
      carbohydrates: 19,
      sugars: 16,
      fat: {
        total: 7,
        saturated: 4.5
      },
      description: "Chocolate ice cream with AERO bubbles"
    }
  ],
  "coffee crisp": [
    {
      name: "COFFEE CRISP Chocolate Bar",
      servingSize: "50g",
      calories: 260,
      protein: 3,
      carbohydrates: 34,
      sugars: 26,
      fat: {
        total: 12,
        saturated: 7
      },
      description: "Light crispy wafers with coffee-flavoured cream covered in milk chocolate"
    },
    {
      name: "COFFEE CRISP Chocolate Bar, Single",
      servingSize: "50g",
      calories: 260,
      protein: 3,
      carbohydrates: 34,
      sugars: 26,
      fat: {
        total: 12,
        saturated: 7
      },
      description: "Light crispy wafers with coffee-flavoured cream covered in milk chocolate"
    }
  ],
  "smarties": [
    {
      name: "SMARTIES Regular Box",
      servingSize: "45g",
      calories: 220,
      protein: 2.5,
      carbohydrates: 32,
      sugars: 30,
      fat: {
        total: 10,
        saturated: 6
      },
      description: "Colourful candy-coated milk chocolate"
    },
    {
      name: "SMARTIES Mini Box",
      servingSize: "15g",
      calories: 73,
      protein: 0.8,
      carbohydrates: 10.6,
      sugars: 10,
      fat: {
        total: 3.3,
        saturated: 2
      },
      description: "Colourful candy-coated milk chocolate in mini size"
    }
  ],
  "quality street": [
    {
      name: "QUALITY STREET Holiday Gift Tin",
      servingSize: "4 pieces (32g)",
      calories: 150,
      protein: 1.5,
      carbohydrates: 22,
      sugars: 20,
      fat: {
        total: 6.5,
        saturated: 4
      },
      description: "Assorted chocolates and toffees in a gift tin"
    },
    {
      name: "QUALITY STREET Holiday Gift Box",
      servingSize: "4 pieces (32g)",
      calories: 150,
      protein: 1.5,
      carbohydrates: 22,
      sugars: 20,
      fat: {
        total: 6.5,
        saturated: 4
      },
      description: "Assorted chocolates and toffees in a gift box"
    }
  ],
  "turtles": [
    {
      name: "TURTLES Classic Recipe Holiday Gift Box",
      servingSize: "3 pieces (42g)",
      calories: 220,
      protein: 3,
      carbohydrates: 19,
      sugars: 18,
      fat: {
        total: 15,
        saturated: 7
      },
      description: "Pecan halves and smooth caramel covered in milk chocolate"
    }
  ],
  "after eight": [
    {
      name: "AFTER EIGHT Thin Mints",
      servingSize: "2 pieces (16g)",
      calories: 75,
      protein: 0.5,
      carbohydrates: 12,
      sugars: 11,
      fat: {
        total: 2.5,
        saturated: 1.5
      },
      description: "Thin dark chocolate squares with mint fondant filling"
    }
  ],
  "crunch": [
    {
      name: "CRUNCH Chocolate Bar",
      servingSize: "44g",
      calories: 220,
      protein: 3,
      carbohydrates: 26,
      sugars: 21,
      fat: {
        total: 12,
        saturated: 7
      },
      description: "Milk chocolate with crisped rice"
    }
  ],
  "drumstick": [
    {
      name: "DRUMSTICK Classic Vanilla",
      servingSize: "1 cone (140ml)",
      calories: 290,
      protein: 4,
      carbohydrates: 32,
      sugars: 22,
      fat: {
        total: 16,
        saturated: 11
      },
      description: "Vanilla ice cream in a sugar cone with chocolate and peanuts"
    },
    {
      name: "DRUMSTICK Vanilla Chocolate Swirl",
      servingSize: "1 cone (140ml)",
      calories: 300,
      protein: 4,
      carbohydrates: 34,
      sugars: 24,
      fat: {
        total: 16,
        saturated: 11
      },
      description: "Vanilla and chocolate swirl ice cream in a sugar cone with chocolate and peanuts"
    }
  ]
};

/**
 * Get nutritional information for a product
 */
export function getNutritionalInfo(productName: string): NutritionalInfo[] | null {
  // Normalize product name for lookup (remove 'nestle', lowercase, trim)
  const normalizedName = productName.toLowerCase()
    .replace('nestle', '')
    .replace('nestlé', '')
    .trim();
  
  // Check for direct match
  if (nutritionalDatabase[normalizedName]) {
    return nutritionalDatabase[normalizedName];
  }
  
  // Check for partial matches
  for (const key of Object.keys(nutritionalDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return nutritionalDatabase[key];
    }
  }
  
  return null;
}