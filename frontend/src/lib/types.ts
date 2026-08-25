export interface Salon {
  id: string;
  name: string;
  subdomain: string;
  phone: string;
  address: string;
  currency: string;
  tax_number: string;
  tax_rate: number;
  deposit_percentage: number;
  created_at: string;
}

export interface Staff {
  id: string;
  salon_id: string;
  full_name: string;
  phone: string;
  role: 'owner' | 'receptionist' | 'stylist' | 'assistant';
  specialty: string;
  commission_rate_services: number;
  commission_rate_retail: number;
  avatar_url: string;
  is_active: boolean;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  category: 'hair' | 'nails' | 'skin' | 'spa' | 'makeup';
  description: string;
  duration_minutes: number;
  buffer_after_minutes: number;
  price: number;
  requires_chair_type: 'styling' | 'washing' | 'spa' | 'general';
  is_active: boolean;
}

export interface Client {
  id: string;
  salon_id: string;
  full_name: string;
  phone: string;
  email: string;
  notes: string;
  allergy_info: string;
  total_visits: number;
  total_spent: number;
  created_at: string;
}

export interface ClientHairFormula {
  id: string;
  client_id: string;
  appointment_id?: string;
  formula_text: string;
  brand_name: string;
  before_photo_url: string;
  after_photo_url: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  staff_id?: string;
  staff_name?: string;
  service_id: string;
  service_name: string;
  service_category: string;
  start_time: string;
  end_time: string;
  status: 'pending_deposit' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  deposit_amount: number;
  total_amount: number;
  notes: string;
  created_at: string;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  staff_id?: string;
  staff_name?: string;
  is_available: boolean;
}

export interface InventoryItem {
  id: string;
  salon_id: string;
  name: string;
  sku: string;
  item_type: 'retail' | 'backbar_consumable';
  unit: 'unit' | 'gram' | 'ml';
  current_stock: number;
  min_stock_alert: number;
  cost_price: number;
  retail_price: number;
  is_low_stock: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  salon_id: string;
  appointment_id?: string;
  client_name: string;
  staff_name?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mada' | 'apple_pay' | 'split';
  payment_status: 'paid' | 'pending' | 'refunded';
  staff_commission_amount: number;
  created_at: string;
}

export interface AnalyticsOverview {
  today_revenue: number;
  today_appointments_count: number;
  in_progress_count: number;
  completed_count: number;
  no_show_count: number;
  low_stock_alerts_count: number;
  top_services: { name: string; category: string; count: number; price: number }[];
  top_stylists: { name: string; specialty: string; completed_appointments: number }[];
}

export interface StaffProfile {
  id: string;
  salon_id: string;
  salon_name: string;
  salon_subdomain: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'owner' | 'receptionist' | 'stylist' | 'assistant';
  specialty: string;
  commission_rate_services: number;
  commission_rate_retail: number;
  avatar_url: string;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  staff: StaffProfile;
  message: string;
}

export interface AppointmentLookupResult {
  id: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  staff_name?: string;
  start_time: string;
  status: 'pending_deposit' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  total_amount: number;
  deposit_amount: number;
  notes?: string;
}

