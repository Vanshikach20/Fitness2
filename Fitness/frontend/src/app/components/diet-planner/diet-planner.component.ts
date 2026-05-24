import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/* ================================================================
 *  D I E T   P L A N N E R   C O M P O N E N T
 *  ─────────────────────────────────────────────
 *  Standalone feature – calculates BMI, TDEE and generates a full
 *  7-day diet schedule (veg + non-veg) based on user's goal.
 *  Zero backend dependency – works entirely on the client.
 * ================================================================ */

/* ---------- Type definitions ---------- */

interface Meal {
  time: string;
  label: string;        // e.g. "Breakfast"
  icon: string;         // Material icon name
  vegOption: string;
  nonVegOption: string;
  calories: number;     // approximate per meal
}

interface DayPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
}

type Goal = 'lose' | 'maintain' | 'gain';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

@Component({
  selector: 'app-diet-planner',
  templateUrl: './diet-planner.component.html',
  styleUrls: ['./diet-planner.component.css']
})
export class DietPlannerComponent {

  /* ---------- Form ---------- */
  dietForm: FormGroup;
  showResults = false;

  /* ---------- Calculated values ---------- */
  bmi = 0;
  bmiCategory = '';
  bmr = 0;
  tdee = 0;
  targetCalories = 0;
  proteinGrams = 0;
  carbGrams = 0;
  fatGrams = 0;

  /* ---------- Diet plan ---------- */
  weekPlan: DayPlan[] = [];
  selectedDay = 0;
  dietType: 'veg' | 'nonveg' = 'veg';

  constructor(private fb: FormBuilder) {
    this.dietForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
      age: [null, [Validators.required, Validators.min(10), Validators.max(100)]],
      gender: ['male', Validators.required],
      activityLevel: ['moderate', Validators.required],
      goal: ['maintain', Validators.required]
    });
  }

  /* ==================== MAIN CALCULATION ==================== */

  onSubmit(): void {
    if (this.dietForm.invalid) return;

    const { weight, height, age, gender, activityLevel, goal } = this.dietForm.value;
    const heightM = height / 100;

    // BMI
    this.bmi = +(weight / (heightM * heightM)).toFixed(1);
    this.bmiCategory = this.getBmiCategory(this.bmi);

    // BMR (Mifflin-St Jeor)
    this.bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // TDEE
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55,
      active: 1.725, very_active: 1.9
    };
    this.tdee = Math.round(this.bmr * multipliers[activityLevel as ActivityLevel]);

    // Target calories based on goal
    const adjustments: Record<Goal, number> = { lose: -500, maintain: 0, gain: 400 };
    this.targetCalories = Math.round(this.tdee + adjustments[goal as Goal]);

    // Macros (approximate split)
    this.calculateMacros(goal as Goal, weight);

    // Generate 7-day plan
    this.weekPlan = this.generateWeekPlan(this.targetCalories, goal as Goal);
    this.selectedDay = 0;
    this.showResults = true;
  }

  /* ==================== MACROS ==================== */

  private calculateMacros(goal: Goal, weightKg: number): void {
    switch (goal) {
      case 'lose':
        this.proteinGrams = Math.round(weightKg * 2.0);
        this.fatGrams = Math.round(weightKg * 0.8);
        this.carbGrams = Math.round((this.targetCalories - this.proteinGrams * 4 - this.fatGrams * 9) / 4);
        break;
      case 'gain':
        this.proteinGrams = Math.round(weightKg * 2.2);
        this.fatGrams = Math.round(weightKg * 1.0);
        this.carbGrams = Math.round((this.targetCalories - this.proteinGrams * 4 - this.fatGrams * 9) / 4);
        break;
      default:
        this.proteinGrams = Math.round(weightKg * 1.6);
        this.fatGrams = Math.round(weightKg * 0.9);
        this.carbGrams = Math.round((this.targetCalories - this.proteinGrams * 4 - this.fatGrams * 9) / 4);
    }
    if (this.carbGrams < 50) this.carbGrams = 50;
  }

  /* ==================== BMI ==================== */

  getBmiCategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBmiColor(): string {
    if (this.bmi < 18.5) return '#00d4ff';
    if (this.bmi < 25) return '#00ff88';
    if (this.bmi < 30) return '#ffd43b';
    return '#ff4757';
  }

  /* ==================== 7-DAY PLAN GENERATOR ==================== */

  private generateWeekPlan(targetCal: number, goal: Goal): DayPlan[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map((day, idx) => this.buildDayPlan(day, idx, targetCal, goal));
  }

  private buildDayPlan(day: string, dayIndex: number, targetCal: number, goal: Goal): DayPlan {
    const mealSplit = this.getMealCalorieSplit(targetCal);
    const meals = this.getMealsForDay(dayIndex, mealSplit, goal);
    const total = meals.reduce((s, m) => s + m.calories, 0);
    return { day, meals, totalCalories: total };
  }

  private getMealCalorieSplit(total: number): number[] {
    // [Early Morning, Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner]
    return [
      Math.round(total * 0.05),   // Early Morning
      Math.round(total * 0.25),   // Breakfast
      Math.round(total * 0.10),   // Mid-Morning Snack
      Math.round(total * 0.30),   // Lunch
      Math.round(total * 0.10),   // Evening Snack
      Math.round(total * 0.20)    // Dinner
    ];
  }

  private getMealsForDay(dayIndex: number, split: number[], goal: Goal): Meal[] {
    const db = this.getMealDatabase(goal);
    return [
      {
        time: '6:30 AM',
        label: 'Early Morning',
        icon: 'wb_twilight',
        vegOption: db.earlyMorning.veg[dayIndex % db.earlyMorning.veg.length],
        nonVegOption: db.earlyMorning.nonveg[dayIndex % db.earlyMorning.nonveg.length],
        calories: split[0]
      },
      {
        time: '8:00 AM',
        label: 'Breakfast',
        icon: 'free_breakfast',
        vegOption: db.breakfast.veg[dayIndex % db.breakfast.veg.length],
        nonVegOption: db.breakfast.nonveg[dayIndex % db.breakfast.nonveg.length],
        calories: split[1]
      },
      {
        time: '10:30 AM',
        label: 'Mid-Morning Snack',
        icon: 'nutrition',
        vegOption: db.midSnack.veg[dayIndex % db.midSnack.veg.length],
        nonVegOption: db.midSnack.nonveg[dayIndex % db.midSnack.nonveg.length],
        calories: split[2]
      },
      {
        time: '1:00 PM',
        label: 'Lunch',
        icon: 'lunch_dining',
        vegOption: db.lunch.veg[dayIndex % db.lunch.veg.length],
        nonVegOption: db.lunch.nonveg[dayIndex % db.lunch.nonveg.length],
        calories: split[3]
      },
      {
        time: '4:30 PM',
        label: 'Evening Snack',
        icon: 'icecream',
        vegOption: db.eveningSnack.veg[dayIndex % db.eveningSnack.veg.length],
        nonVegOption: db.eveningSnack.nonveg[dayIndex % db.eveningSnack.nonveg.length],
        calories: split[4]
      },
      {
        time: '7:30 PM',
        label: 'Dinner',
        icon: 'dinner_dining',
        vegOption: db.dinner.veg[dayIndex % db.dinner.veg.length],
        nonVegOption: db.dinner.nonveg[dayIndex % db.dinner.nonveg.length],
        calories: split[5]
      }
    ];
  }

  /* ==================== MEAL DATABASE ==================== */

  private getMealDatabase(goal: Goal) {
    if (goal === 'lose') return this.weightLossMeals();
    if (goal === 'gain') return this.weightGainMeals();
    return this.maintenanceMeals();
  }

  private weightLossMeals() {
    return {
      earlyMorning: {
        veg: [
          'Warm lemon water + 5 soaked almonds',
          'Green tea + 4 walnuts',
          'Warm water with apple cider vinegar + 5 almonds',
          'Jeera water + 3 soaked figs',
          'Tulsi tea + 5 cashews',
          'Cinnamon water + mixed seeds (1 tbsp)',
          'Warm turmeric water + 4 pistachios'
        ],
        nonveg: [
          'Warm lemon water + 5 soaked almonds',
          'Green tea + 4 walnuts',
          'Warm water with apple cider vinegar + 5 almonds',
          'Jeera water + 3 soaked figs',
          'Tulsi tea + 5 cashews',
          'Cinnamon water + mixed seeds (1 tbsp)',
          'Warm turmeric water + 4 pistachios'
        ]
      },
      breakfast: {
        veg: [
          'Oats porridge with berries & chia seeds (1 bowl)',
          'Moong dal cheela (2 pcs) + mint chutney + 1 glass buttermilk',
          'Vegetable upma (1 bowl) + coconut chutney',
          'Multigrain toast (2 slices) + peanut butter + banana',
          'Ragi dosa (2 pcs) + sambar + coriander chutney',
          'Besan cheela (2 pcs) + green chutney + sprouts salad',
          'Poha with vegetables & peanuts (1 bowl) + lemon'
        ],
        nonveg: [
          'Boiled egg whites (4) + multigrain toast (1 slice) + avocado',
          'Egg bhurji (3 eggs) + whole wheat roti (1) + green chutney',
          'Omelette (3 egg whites) + oats (half bowl) + berries',
          'Chicken sandwich (grilled, whole wheat) + cucumber slices',
          'Scrambled eggs (3) + multigrain toast (1 slice) + spinach',
          'Egg dosa (2 pcs) + mint chutney',
          'Smoked salmon on whole wheat toast (2 slices) + lemon'
        ]
      },
      midSnack: {
        veg: [
          'Apple (1) + 10 almonds',
          'Greek yogurt (1 cup) + flaxseeds',
          'Cucumber & carrot sticks + hummus (2 tbsp)',
          'Makhana / fox nuts (1 cup roasted)',
          'Mixed fruit bowl (1 small)',
          'Roasted chana (1/2 cup)',
          'Sprouts salad with lemon & chaat masala'
        ],
        nonveg: [
          'Apple (1) + 10 almonds',
          'Boiled eggs (2)',
          'Chicken tikka bites (4 pcs)',
          'Makhana / fox nuts (1 cup roasted)',
          'Greek yogurt (1 cup) + flaxseeds',
          'Tuna salad (small bowl)',
          'Turkey jerky (30g) + cucumber'
        ]
      },
      lunch: {
        veg: [
          'Brown rice (1/2 cup) + dal (1 bowl) + sabzi + salad + curd',
          'Quinoa pulao (1 bowl) + raita + green salad',
          'Whole wheat roti (2) + paneer bhurji + cucumber raita',
          'Rajma rice (brown, 1/2 cup) + salad + buttermilk',
          'Multigrain roti (2) + chole + onion salad + lemon',
          'Veggie wrap (whole wheat) + dal soup + salad',
          'Khichdi (1 bowl) + papad + mixed veg curry + curd'
        ],
        nonveg: [
          'Brown rice (1/2 cup) + chicken curry (150g) + salad + curd',
          'Grilled chicken breast (150g) + quinoa (1/2 cup) + veggies',
          'Whole wheat roti (2) + fish curry + cucumber raita',
          'Chicken biryani (brown rice, 1 bowl) + raita + salad',
          'Multigrain roti (2) + egg curry (2 eggs) + onion salad',
          'Grilled fish (150g) + sweet potato mash + steamed broccoli',
          'Chicken rice bowl (brown rice) + stir-fried vegetables'
        ]
      },
      eveningSnack: {
        veg: [
          'Green tea + 2 multigrain biscuits',
          'Roasted peanuts (small handful) + herbal tea',
          'Buttermilk (1 glass) + roasted papad',
          'Trail mix (1/4 cup) — almonds, pumpkin seeds, raisins',
          'Fruit smoothie (banana + spinach + almond milk)',
          'Corn on the cob (half, boiled) + lemon & chaat masala',
          'Sprout chaat + green tea'
        ],
        nonveg: [
          'Green tea + 2 multigrain biscuits',
          'Roasted peanuts (small handful) + herbal tea',
          'Chicken soup (1 bowl, clear)',
          'Trail mix (1/4 cup) — almonds, pumpkin seeds, raisins',
          'Protein shake (whey, 1 scoop + water)',
          'Boiled egg (1) + black coffee',
          'Fish tikka (3 pcs) + lemon'
        ]
      },
      dinner: {
        veg: [
          'Whole wheat roti (1) + palak paneer (light oil) + salad',
          'Vegetable soup (1 bowl) + grilled tofu + green salad',
          'Moong dal (1 bowl) + roti (1) + steamed veggies',
          'Dalia khichdi (1 bowl) + curd + salad',
          'Mixed veg curry + multigrain roti (1) + raita',
          'Stuffed capsicum + dal shorba + small salad',
          'Tofu stir-fry + brown rice (1/2 cup) + steamed broccoli'
        ],
        nonveg: [
          'Grilled chicken (120g) + sautéed vegetables + salad',
          'Fish tikka (150g) + green salad + mint chutney',
          'Chicken soup (1 bowl) + whole wheat toast (1 slice)',
          'Tandoori chicken (2 pcs) + onion salad + mint chutney',
          'Egg curry (2 eggs) + roti (1) + salad',
          'Grilled salmon (120g) + steamed asparagus + lemon',
          'Chicken stir-fry + brown rice (1/2 cup)'
        ]
      }
    };
  }

  private weightGainMeals() {
    return {
      earlyMorning: {
        veg: [
          'Warm milk with turmeric + 8 soaked almonds + 2 dates',
          'Banana milkshake + 5 walnuts + 3 dates',
          'Warm milk + peanut butter (1 tbsp) + 5 almonds',
          'Fruit smoothie (banana, mango, milk) + 4 cashews',
          'Badam milk + 3 figs + 2 dates',
          'Warm milk + honey + mixed dry fruits (10g)',
          'Avocado smoothie + 5 almonds + chia seeds'
        ],
        nonveg: [
          'Warm milk with turmeric + 8 soaked almonds + 2 dates',
          'Banana milkshake + 5 walnuts + 3 dates',
          'Warm milk + peanut butter (1 tbsp) + 5 almonds',
          'Fruit smoothie (banana, mango, milk) + 4 cashews',
          'Badam milk + 3 figs + 2 dates',
          'Warm milk + honey + mixed dry fruits (10g)',
          'Avocado smoothie + 5 almonds + chia seeds'
        ]
      },
      breakfast: {
        veg: [
          'Paneer paratha (2) + curd + banana + glass of milk',
          'Aloo paratha (2) + butter + curd + mango shake',
          'Stuffed moong dal paratha (2) + pickle + lassi',
          'Chole bhature (2 pcs) + lassi + banana',
          'Thick poha (1.5 bowls) + peanuts + coconut + milk',
          'Idli (4) + sambar + coconut chutney + banana',
          'Oats with full-fat milk, banana, peanut butter & honey'
        ],
        nonveg: [
          'Whole eggs omelette (4) + buttered toast (2) + banana shake',
          'Egg paratha (2) + curd + banana + glass of milk',
          'Scrambled eggs (4) + cheese toast (2) + orange juice',
          'Chicken keema paratha (2) + curd + banana',
          'French toast (3 slices) + eggs (2) + milk',
          'Egg fried rice (1 bowl) + chicken sausage (2) + juice',
          'Whole wheat pancakes (3) + eggs (2) + honey + milk'
        ]
      },
      midSnack: {
        veg: [
          'Banana peanut butter smoothie (thick)',
          'Dry fruit laddoo (2) + glass of milk',
          'Cheese sandwich (whole wheat) + fruit juice',
          'Paneer tikka (6 pcs) + mint chutney',
          'Trail mix (1/2 cup) + banana',
          'Mango lassi (1 large glass)',
          'Peanut chikki (2 pcs) + milk'
        ],
        nonveg: [
          'Protein shake (whey, 1.5 scoop + milk + banana)',
          'Boiled eggs (3) + bread (1 slice) + juice',
          'Chicken sandwich (whole wheat) + fruit juice',
          'Chicken momos (6 pcs) + chili sauce',
          'Tuna salad sandwich + banana',
          'Egg bhurji roll + mango shake',
          'Turkey & cheese wrap + juice'
        ]
      },
      lunch: {
        veg: [
          'White rice (1.5 cups) + rajma + paneer curry + roti (2) + salad + curd',
          'Chole rice (1.5 cups) + aloo gobi + roti (2) + raita + papad',
          'Jeera rice (1.5 cups) + dal makhani + mixed veg + raita + roti (1)',
          'Pulao (1.5 cups) + paneer butter masala + naan (1) + salad + lassi',
          'Rice (1.5 cups) + sambar + avial + appam (2) + curd',
          'Biryani veg (1.5 cups) + raita + paneer tikka + salad',
          'Roti (3) + dal fry + aloo matar + curd + rice (1/2 cup)'
        ],
        nonveg: [
          'White rice (1.5 cups) + chicken curry (200g) + roti (2) + salad + curd',
          'Chicken biryani (1.5 cups) + raita + chicken 65 (4 pcs) + salad',
          'Rice (1.5 cups) + fish curry (200g) + roti (1) + dal + curd',
          'Mutton curry (200g) + rice (1.5 cups) + roti (1) + raita',
          'Egg biryani (1.5 cups) + chicken tikka (4 pcs) + raita + salad',
          'Rice (1.5 cups) + prawn masala (200g) + roti (1) + dal + curd',
          'Roti (3) + butter chicken (200g) + rice (1 cup) + raita'
        ]
      },
      eveningSnack: {
        veg: [
          'Masala milk + veg puff + banana',
          'Cheese toast (2) + fruit milkshake',
          'Samosa (2) + tea + mixed nuts',
          'Corn chaat + lassi',
          'Sweet potato (boiled, 1 large) + peanuts + tea',
          'Bread pakora (2) + mint chutney + chai',
          'Dates milkshake + dry fruit laddoo (1)'
        ],
        nonveg: [
          'Protein bar + chicken soup (1 bowl)',
          'Cheese & chicken toast (2) + fruit milkshake',
          'Chicken puff (2) + tea + mixed nuts',
          'Egg roll + lassi',
          'Boiled eggs (2) + sweet potato + tea',
          'Chicken cutlet (2) + mint chutney + chai',
          'Protein shake (1 scoop + milk) + banana'
        ]
      },
      dinner: {
        veg: [
          'Roti (3) + paneer butter masala + dal + rice (1/2 cup) + salad',
          'Paratha (2 stuffed) + mixed veg + curd + kheer (small bowl)',
          'Rice (1 cup) + dal makhani + aloo gobi + roti (1) + raita',
          'Naan (2) + shahi paneer + green salad + gulab jamun (1)',
          'Roti (2) + mushroom curry + dal + rice (1/2 cup) + curd',
          'Pulao (1 bowl) + paneer tikka masala + raita + papad',
          'Roti (2) + palak paneer + dal tadka + rice (1/2 cup) + salad'
        ],
        nonveg: [
          'Roti (2) + butter chicken (200g) + dal + rice (1/2 cup) + salad',
          'Chicken biryani (1 bowl) + raita + kebab (2 pcs)',
          'Rice (1 cup) + fish fry (150g) + dal + roti (1) + curd',
          'Naan (2) + mutton rogan josh + green salad + kheer (small)',
          'Roti (2) + egg curry (3 eggs) + dal + rice (1/2 cup) + curd',
          'Rice (1 cup) + prawn fry (150g) + chicken soup + papad',
          'Roti (2) + tandoori chicken (3 pcs) + dal + salad'
        ]
      }
    };
  }

  private maintenanceMeals() {
    return {
      earlyMorning: {
        veg: [
          'Warm lemon water + 6 soaked almonds + 1 date',
          'Green tea + 5 walnuts',
          'Warm water + honey & lemon + 5 almonds',
          'Jeera water + 4 cashews + 1 date',
          'Turmeric milk (warm) + 4 almonds',
          'Herbal tea + mixed seeds (1 tsp)',
          'Warm water + apple cider vinegar + 5 pistachios'
        ],
        nonveg: [
          'Warm lemon water + 6 soaked almonds + 1 date',
          'Green tea + 5 walnuts',
          'Warm water + honey & lemon + 5 almonds',
          'Jeera water + 4 cashews + 1 date',
          'Turmeric milk (warm) + 4 almonds',
          'Herbal tea + mixed seeds (1 tsp)',
          'Warm water + apple cider vinegar + 5 pistachios'
        ]
      },
      breakfast: {
        veg: [
          'Idli (3) + sambar + coconut chutney + fruit',
          'Multigrain toast (2) + peanut butter + banana + milk',
          'Oats upma (1 bowl) + curd + fruit',
          'Dosa (2) + sambar + coconut chutney + coffee',
          'Poha (1 bowl) + sprouts + lemon + tea',
          'Paratha (1 stuffed) + curd + fruit + milk',
          'Ragi porridge (1 bowl) + banana + honey + milk'
        ],
        nonveg: [
          'Boiled eggs (3) + multigrain toast (2) + fruit',
          'Egg dosa (2) + sambar + chutney + coffee',
          'Omelette (2 eggs) + oats (1 bowl) + banana',
          'Chicken sandwich (whole wheat) + juice + fruit',
          'Scrambled eggs (3) + toast (1) + avocado + tea',
          'Egg paratha (1) + curd + fruit + milk',
          'Smoked salmon toast (2) + cucumber + coffee'
        ]
      },
      midSnack: {
        veg: [
          'Fruit (1 medium) + handful of mixed nuts',
          'Greek yogurt + granola (2 tbsp)',
          'Roasted makhana (1 cup) + green tea',
          'Hummus (2 tbsp) + carrot & celery sticks',
          'Banana + peanut butter (1 tbsp)',
          'Mixed fruit chaat + chaat masala',
          'Sprout salad + lemon juice'
        ],
        nonveg: [
          'Fruit (1 medium) + handful of mixed nuts',
          'Boiled egg (1) + green tea',
          'Chicken tikka (3 pcs) + cucumber',
          'Hummus (2 tbsp) + carrot & celery sticks',
          'Protein bar + black coffee',
          'Tuna salad (small)',
          'Turkey slices (3) + cheese cube'
        ]
      },
      lunch: {
        veg: [
          'Rice (1 cup) + dal (1 bowl) + sabzi + roti (1) + salad + curd',
          'Roti (2) + paneer curry + dal + salad + buttermilk',
          'Jeera rice (1 cup) + rajma + cucumber raita + papad',
          'Roti (2) + mixed veg + dal fry + salad + curd',
          'Pulao (1 cup) + chole + raita + green salad',
          'Rice (1 cup) + sambar + kootu + appam (1) + curd',
          'Roti (2) + aloo matar + moong dal + salad + buttermilk'
        ],
        nonveg: [
          'Rice (1 cup) + chicken curry (150g) + roti (1) + salad + curd',
          'Chicken biryani (1 cup) + raita + salad',
          'Roti (2) + fish curry (150g) + dal + cucumber raita',
          'Rice (1 cup) + egg curry (2 eggs) + sabzi + curd',
          'Whole wheat wrap + grilled chicken + veggies + raita',
          'Rice (1 cup) + prawn curry (150g) + dal + salad',
          'Roti (2) + keema (150g) + dal + salad + curd'
        ]
      },
      eveningSnack: {
        veg: [
          'Tea + 2 digestive biscuits + fruit',
          'Roasted chana (1/3 cup) + lemon + chai',
          'Sweet corn cup + mint chutney',
          'Smoothie (banana, yogurt, honey)',
          'Trail mix (small handful) + herbal tea',
          'Dhokla (2 pcs) + green chutney + tea',
          'Puffed rice bhel + lemon + tea'
        ],
        nonveg: [
          'Tea + 2 digestive biscuits + fruit',
          'Boiled egg (1) + chai',
          'Chicken soup (1 small bowl)',
          'Protein shake (1 scoop + water)',
          'Trail mix (small handful) + herbal tea',
          'Fish fingers (3) + lemon',
          'Egg bhurji (1 egg) + toast + tea'
        ]
      },
      dinner: {
        veg: [
          'Roti (2) + dal + mixed veg sabzi + salad',
          'Khichdi (1 bowl) + curd + papad + pickle',
          'Roti (1) + palak paneer + soup + salad',
          'Rice (1/2 cup) + sambar + mixed veg + curd',
          'Roti (2) + mushroom curry + dal + salad',
          'Vegetable soup + grilled paneer + multigrain bread (1 slice)',
          'Roti (1) + tofu stir-fry + dal + green salad'
        ],
        nonveg: [
          'Grilled chicken (150g) + roti (1) + salad + dal',
          'Fish curry (150g) + rice (1/2 cup) + salad',
          'Tandoori chicken (2 pcs) + mint chutney + salad',
          'Egg curry (2) + roti (1) + soup + salad',
          'Chicken soup + grilled fish (120g) + salad',
          'Roti (1) + keema (120g) + dal + salad',
          'Grilled salmon (120g) + steamed veggies + rice (1/2 cup)'
        ]
      }
    };
  }

  /* ==================== HELPERS ==================== */

  getGoalLabel(): string {
    const val = this.dietForm.get('goal')?.value;
    if (val === 'lose') return 'Weight Loss';
    if (val === 'gain') return 'Weight Gain';
    return 'Maintenance';
  }

  reset(): void {
    this.showResults = false;
    this.weekPlan = [];
  }
}
