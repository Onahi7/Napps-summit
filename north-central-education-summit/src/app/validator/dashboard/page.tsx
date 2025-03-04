'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ValidatorDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalMealValidations: 0,
    totalRegistrationValidations: 0,
    pendingMealValidations: 0,
    pendingRegistrationValidations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentMealSession, setCurrentMealSession] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get current meal session
        const now = new Date();
        const { data: mealSession } = await supabase
          .from('meal_sessions')
          .select('*')
          .eq('date', now.toISOString().split('T')[0])
          .lte('start_time', now.toISOString())
          .gte('end_time', now.toISOString())
          .single();

        setCurrentMealSession(mealSession);

        // Get validation stats
        const [
          { count: totalMealValidations },
          { count: totalRegValidations },
          { count: pendingMealValidations },
          { count: pendingRegValidations },
        ] = await Promise.all([
          supabase.from('meal_validations').select('*', { count: 'exact' }),
          supabase.from('registration_validations').select('*', { count: 'exact' }),
          supabase.from('meal_validations').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('registration_validations').select('*', { count: 'exact' }).eq('status', 'pending'),
        ]);

        setStats({
          totalMealValidations: totalMealValidations || 0,
          totalRegistrationValidations: totalRegValidations || 0,
          pendingMealValidations: pendingMealValidations || 0,
          pendingRegistrationValidations: pendingRegValidations || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const features = [
    {
      title: 'Meal Validation',
      description: 'Validate meal access for participants',
      href: '/validator/meals',
      color: 'bg-green-500',
    },
    {
      title: 'Registration Validation',
      description: 'Validate participant registrations',
      href: '/validator/registrations',
      color: 'bg-blue-500',
    },
    {
      title: 'Reports',
      description: 'View and generate validation reports',
      href: '/validator/reports',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Validator Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meal Validations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMealValidations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registration Validations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrationValidations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Meal Validations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMealValidations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Registration Validations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRegistrationValidations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Meal Session */}
      {currentMealSession && (
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle>Active Meal Session</CardTitle>
            <CardDescription>
              {currentMealSession.type} - {new Date(currentMealSession.start_time).toLocaleTimeString()} to {new Date(currentMealSession.end_time).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/validator/meals">Start Validating</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} mb-4`} />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
