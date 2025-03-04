import { supabase } from '@/app/supabaseClient';

interface Profile {
  state: string;
}

interface Registration {
  id: string;
  created_at: string;
  status: string;
  profiles: Profile[];
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  created_at: string;
}

interface MealSession {
  type: string;
}

interface MealValidation {
  id: string;
  created_at: string;
  meal_sessions: MealSession[];
  registrations: {
    profiles: Profile[];
  };
}

interface SupabaseMealValidation {
  id: string;
  created_at: string;
  meal_sessions: { type: string }[];
  registrations: {
    profiles: { state: string }[];
  }[];
}

interface Event {
  id: string;
  title: string;
  registrations: {
    id: string;
    status: string;
  }[];
}

export interface AnalyticsData {
  registrations: {
    total: number;
    byState: Record<string, number>;
    byStatus: Record<string, number>;
    trend: { date: string; count: number }[];
  };
  payments: {
    total: number;
    totalAmount: number;
    byMethod: Record<string, number>;
    trend: { date: string; amount: number }[];
  };
  meals: {
    total: number;
    byType: Record<string, number>;
    byState: Record<string, number>;
    trend: { date: string; count: number }[];
  };
  events: {
    total: number;
    attendance: Record<string, number>;
    registrationRate: Record<string, number>;
  };
}

export async function generateAnalytics(startDate: string, endDate: string): Promise<AnalyticsData> {
  const [registrationsData, paymentsData, mealsData, eventsData] = await Promise.all([
    // Registration analytics
    supabase
      .from('registrations')
      .select(`
        id,
        created_at,
        status,
        profiles!inner (
          state
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    // Payment analytics
    supabase
      .from('payments')
      .select(`
        id,
        amount,
        method,
        created_at
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    // Meal analytics
    supabase
      .from('meal_validations')
      .select(`
        id,
        created_at,
        meal_sessions!inner (
          type
        ),
        registrations!inner (
          profiles!inner (
            state
          )
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    // Event analytics
    supabase
      .from('events')
      .select(`
        id,
        title,
        registrations (
          id,
          status
        )
      `)
  ]);

  // Process registration data
  const registrationsByState: Record<string, number> = {};
  const registrationsByStatus: Record<string, number> = {};
  const registrationTrend: Record<string, number> = {};
  
  (registrationsData.data as Registration[] || []).forEach(reg => {
    // By state
    const state = reg.profiles[0]?.state || 'unknown';
    registrationsByState[state] = (registrationsByState[state] || 0) + 1;
    
    // By status
    registrationsByStatus[reg.status] = (registrationsByStatus[reg.status] || 0) + 1;
    
    // Trend
    const date = new Date(reg.created_at).toISOString().split('T')[0];
    registrationTrend[date] = (registrationTrend[date] || 0) + 1;
  });

  // Process payment data
  const paymentsByMethod: Record<string, number> = {};
  const paymentTrend: Record<string, number> = {};
  let totalPaymentAmount = 0;
  
  (paymentsData.data as Payment[] || []).forEach(payment => {
    // By method
    paymentsByMethod[payment.method] = (paymentsByMethod[payment.method] || 0) + 1;
    
    // Trend
    const date = new Date(payment.created_at).toISOString().split('T')[0];
    paymentTrend[date] = (paymentTrend[date] || 0) + payment.amount;
    
    totalPaymentAmount += payment.amount;
  });

  // Process meal data
  const mealsByType: Record<string, number> = {};
  const mealsByState: Record<string, number> = {};
  const mealTrend: Record<string, number> = {};
  
  (mealsData.data as SupabaseMealValidation[] || []).forEach(meal => {
    // By type
    const type = meal.meal_sessions[0]?.type || 'unknown';
    mealsByType[type] = (mealsByType[type] || 0) + 1;
    
    // By state
    const state = meal.registrations[0]?.profiles[0]?.state || 'unknown';
    mealsByState[state] = (mealsByState[state] || 0) + 1;
    
    // Trend
    const date = new Date(meal.created_at).toISOString().split('T')[0];
    mealTrend[date] = (mealTrend[date] || 0) + 1;
  });

  // Process event data
  const eventStats: Record<string, number> = {};
  const registrationRates: Record<string, number> = {};
  
  (eventsData.data as Event[] || []).forEach(event => {
    const totalRegs = event.registrations.length;
    const confirmedRegs = event.registrations.filter(r => r.status === 'confirmed').length;
    
    eventStats[event.title] = confirmedRegs;
    registrationRates[event.title] = totalRegs > 0 ? (confirmedRegs / totalRegs) * 100 : 0;
  });

  return {
    registrations: {
      total: registrationsData.data?.length || 0,
      byState: registrationsByState,
      byStatus: registrationsByStatus,
      trend: Object.entries(registrationTrend).map(([date, count]) => ({ date, count: count as number })),
    },
    payments: {
      total: paymentsData.data?.length || 0,
      totalAmount: totalPaymentAmount,
      byMethod: paymentsByMethod,
      trend: Object.entries(paymentTrend).map(([date, amount]) => ({ date, amount: amount as number })),
    },
    meals: {
      total: mealsData.data?.length || 0,
      byType: mealsByType,
      byState: mealsByState,
      trend: Object.entries(mealTrend).map(([date, count]) => ({ date, count: count as number })),
    },
    events: {
      total: eventsData.data?.length || 0,
      attendance: eventStats,
      registrationRate: registrationRates,
    },
  };
}
