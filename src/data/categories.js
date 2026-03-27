import { Utensils, Coffee, Landmark, TreePine, ShoppingBag, Dumbbell, Bed, Bus, Activity, GraduationCap, Briefcase, Gamepad2, Car, Home, MapPin } from 'lucide-react';

export const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant', emoji: '🍕', color: '#ff6b6b', icon: 'restaurant-outline', IconComponent: Utensils },
  { id: 'cafe',       label: 'Café',       emoji: '☕', color: '#a87352', icon: 'cafe-outline', IconComponent: Coffee },
  { id: 'culture',    label: 'Culture',    emoji: '🏛️', color: '#be4bdb', icon: 'library-outline', IconComponent: Landmark },
  { id: 'nature',     label: 'Nature',     emoji: '🌳', color: '#51cf66', icon: 'leaf-outline', IconComponent: TreePine },
  { id: 'shopping',   label: 'Shopping',   emoji: '🛍️', color: '#fcc419', icon: 'cart-outline', IconComponent: ShoppingBag },
  { id: 'sport',      label: 'Sport',      emoji: '🏋️', color: '#339af0', icon: 'fitness-outline', IconComponent: Dumbbell },
  { id: 'hotel',      label: 'Hébergement',emoji: '🏨', color: '#20c997', icon: 'bed-outline', IconComponent: Bed },
  { id: 'transport',  label: 'Transport',  emoji: '🚉', color: '#4dabf7', icon: 'bus-outline', IconComponent: Bus },
  { id: 'health',     label: 'Santé',      emoji: '🏥', color: '#ff8787', icon: 'medical-outline', IconComponent: Activity },
  { id: 'education',  label: 'Éducation',  emoji: '🎓', color: '#fab005', icon: 'school-outline', IconComponent: GraduationCap },
  { id: 'work',       label: 'Travail',    emoji: '💼', color: '#adb5bd', icon: 'briefcase-outline', IconComponent: Briefcase },
  { id: 'fun',        label: 'Divertissement', emoji: '🎡', color: '#da77f2', icon: 'game-controller-outline', IconComponent: Gamepad2 },
  { id: 'parking',    label: 'Parking',    emoji: '🅿️', color: '#868e96', icon: 'car', IconComponent: Car },
  { id: 'home',       label: 'Maison',     emoji: '🏠', color: '#ff922b', icon: 'home', IconComponent: Home },
  { id: 'other',      label: 'Autre',      emoji: '📍', color: '#6366f1', icon: 'location', IconComponent: MapPin },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
