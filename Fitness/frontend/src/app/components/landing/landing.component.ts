import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  constructor(public authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  /* ---------- Stats counter ---------- */
  stats = [
    { icon: 'fitness_center', value: '50+', label: 'Activity Types' },
    { icon: 'restaurant_menu', value: '7-Day', label: 'Diet Plans' },
    { icon: 'insights', value: 'Real-time', label: 'Analytics' },
    { icon: 'security', value: 'JWT', label: 'Secured' }
  ];

  /* ---------- How it Works ---------- */
  steps = [
    { icon: 'person_add', title: 'Create Account', desc: 'Sign up with your name, email & password in seconds.' },
    { icon: 'add_circle', title: 'Log Workouts', desc: 'Add activities like running, cycling, yoga with calories & duration.' },
    { icon: 'restaurant_menu', title: 'Get Diet Plan', desc: 'Enter your body metrics & goal to receive a 7-day veg/non-veg meal plan.' },
    { icon: 'insights', title: 'Track Progress', desc: 'View charts, sort & paginate your dashboard, and crush your goals.' }
  ];

  /* ---------- Features ---------- */
  features = [
    { icon: 'lock', title: 'Secure Authentication', desc: 'JWT-based login & registration with Spring Security. Your data stays private.' },
    { icon: 'directions_run', title: 'Activity Logging', desc: 'Log workouts with activity name, duration, calories burned & date. Edit or delete anytime.' },
    { icon: 'restaurant_menu', title: 'AI Diet Planner', desc: 'Get a personalized 7-day meal plan based on BMI, calorie needs & goals — veg and non-veg.' },
    { icon: 'insights', title: 'Visual Analytics', desc: 'Interactive charts showing calorie trends, activity distribution & monthly summaries.' },
    { icon: 'sort', title: 'Smart Dashboard', desc: 'Paginated workout table with sorting by name, duration, calories & date.' },
    { icon: 'dark_mode', title: 'Dark & Light Theme', desc: 'Elegant dark mode by default with a one-click toggle to light mode.' },
    { icon: 'local_fire_department', title: 'Calorie Tracking', desc: 'Real-time calorie calculations with monthly burn summaries on your dashboard.' },
    { icon: 'devices', title: 'Fully Responsive', desc: 'Works perfectly on desktop, tablet & mobile with a polished, modern UI.' }
  ];

  /* ---------- FAQ ---------- */
  faqs = [
    {
      question: 'How do I get started?',
      answer: 'Click "Get Started" to create a free account. Once registered, you can log in and start tracking workouts immediately.',
      open: false
    },
    {
      question: 'How does the Diet Planner work?',
      answer: 'Enter your weight, height, age, gender, activity level and goal (lose/maintain/gain). The planner calculates your BMI, daily calorie target and generates a complete 7-day meal schedule with both vegetarian and non-vegetarian options.',
      open: false
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. The app uses JWT (JSON Web Token) authentication with Spring Security. Passwords are encrypted with BCrypt and each user can only see their own data.',
      open: false
    },
    {
      question: 'Can I edit or delete a workout?',
      answer: 'Absolutely. Go to your Dashboard, find the workout in the table, and use the Edit or Delete buttons in the Actions column.',
      open: false
    },
    {
      question: 'What analytics are available?',
      answer: 'The Analytics page shows interactive charts — calorie burn over time, activity distribution (pie chart), and monthly summaries powered by ng2-charts.',
      open: false
    },
    {
      question: 'Is the data saved permanently?',
      answer: 'The app currently uses in-memory storage. Data persists while the server is running. A database integration can be added for permanent persistence.',
      open: false
    }
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
