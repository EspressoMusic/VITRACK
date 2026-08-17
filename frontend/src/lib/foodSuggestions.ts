export const FOOD_NAMES: string[] = [
  'Apple', 'Banana', 'Orange', 'Grapes', 'Strawberries', 'Blueberries', 'Watermelon', 'Mango', 'Pineapple', 'Pear',
  'Peach', 'Plum', 'Cherries', 'Kiwi', 'Avocado', 'Lemon', 'Grapefruit', 'Pomegranate', 'Fig', 'Date',
  'Broccoli', 'Carrot', 'Spinach', 'Kale', 'Lettuce', 'Cucumber', 'Tomato', 'Bell pepper', 'Onion', 'Garlic',
  'Potato', 'Sweet potato', 'Corn', 'Peas', 'Green beans', 'Cauliflower', 'Zucchini', 'Eggplant', 'Mushroom', 'Beet',
  'Chicken breast', 'Chicken thigh', 'Ground beef', 'Beef steak', 'Pork chop', 'Turkey breast', 'Salmon', 'Tuna', 'Shrimp', 'Cod',
  'Egg', 'Boiled egg', 'Fried egg', 'Scrambled eggs', 'Tofu', 'Tempeh', 'Lentils', 'Chickpeas', 'Black beans', 'Kidney beans',
  'White rice', 'Brown rice', 'Quinoa', 'Oatmeal', 'Pasta', 'Spaghetti', 'Bread', 'Whole wheat bread', 'Bagel', 'Tortilla',
  'Milk', 'Yogurt', 'Greek yogurt', 'Cheese', 'Cottage cheese', 'Butter', 'Cream cheese', 'Almond milk', 'Soy milk', 'Ice cream',
  'Almonds', 'Walnuts', 'Cashews', 'Peanuts', 'Peanut butter', 'Sunflower seeds', 'Chia seeds', 'Flax seeds', 'Pistachios', 'Pecans',
  'Pizza', 'Hamburger', 'Cheeseburger', 'French fries', 'Hot dog', 'Sandwich', 'Sushi', 'Burrito', 'Taco', 'Salad',
  'Soup', 'Chicken soup', 'Steak', 'Grilled chicken', 'Fried chicken', 'Rice and beans', 'Stir fry', 'Curry', 'Falafel', 'Hummus',
  'Chocolate', 'Dark chocolate', 'Cookie', 'Cake', 'Muffin', 'Donut', 'Pancakes', 'Waffles', 'Granola bar', 'Protein bar',
  'Orange juice', 'Apple juice', 'Coffee', 'Tea', 'Green tea', 'Coconut water', 'Smoothie', 'Protein shake', 'Water', 'Soda',
  'Popcorn', 'Chips', 'Pretzels', 'Crackers', 'Trail mix', 'Dried apricots', 'Raisins', 'Coconut', 'Olive oil', 'Honey',
]

export function searchFoodNames(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const startsWith = FOOD_NAMES.filter((name) => name.toLowerCase().startsWith(q))
  const includes = FOOD_NAMES.filter((name) => !name.toLowerCase().startsWith(q) && name.toLowerCase().includes(q))
  return [...startsWith, ...includes].slice(0, limit)
}
