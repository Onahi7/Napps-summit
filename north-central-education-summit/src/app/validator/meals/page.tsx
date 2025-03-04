'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function MealValidationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  const mockParticipants = [
    { id: 1, name: 'John Doe', email: 'john@example.com', mealPreference: 'Vegetarian', validatedMeals: ['Breakfast'] },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', mealPreference: 'Non-Vegetarian', validatedMeals: ['Breakfast', 'Lunch'] },
  ];

  const handleValidation = (participantId: number, meal: string) => {
    // Mock validation logic
    setTimeout(() => {
      setValidationStatus('success');
      setValidationMessage(`${meal} validated successfully for participant #${participantId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meal Validation</h1>
          <p className="mt-2 text-gray-600">Validate participant meals for the event</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-xl">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Participant
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter name or registration number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus && (
          <div
            className={`mb-8 p-4 rounded-md ${
              validationStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {validationStatus === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    validationStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {validationMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Participants Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Participant
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Meal Preference
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Validated Meals
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockParticipants.map((participant) => (
                        <tr key={participant.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                            <div className="font-medium text-gray-900">{participant.name}</div>
                            <div className="text-gray-500">{participant.email}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {participant.mealPreference}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {participant.validatedMeals.join(', ')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleValidation(participant.id, 'Breakfast')}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Breakfast
                              </button>
                              <button
                                onClick={() => handleValidation(participant.id, 'Lunch')}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Lunch
                              </button>
                              <button
                                onClick={() => handleValidation(participant.id, 'Dinner')}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Dinner
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
