import QRCode from 'qrcode';
import { supabase } from '@/app/supabaseClient';

// Generate QR code for meal validation
export async function generateMealQRCode(userId: string, mealId: string): Promise<string> {
  try {
    // Create a payload with user ID and meal ID
    const payload = {
      userId,
      mealId,
      timestamp: new Date().toISOString(),
    };
    
    // Convert payload to JSON string
    const payloadString = JSON.stringify(payload);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(payloadString);
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Validate meal QR code
export async function validateMealQRCode(
  qrCodeData: string,
  validatorId: string,
  location: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Parse QR code data
    const payload = JSON.parse(qrCodeData);
    const { userId, mealId } = payload;
    
    if (!userId || !mealId) {
      return { success: false, message: 'Invalid QR code data' };
    }
    
    // Check if meal exists
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .single();
    
    if (mealError || !meal) {
      return { success: false, message: 'Meal not found' };
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return { success: false, message: 'User not found' };
    }
    
    // Check if validation already exists
    const { data: existingValidation, error: validationError } = await supabase
      .from('meal_validations')
      .select('*')
      .eq('meal_id', mealId)
      .eq('user_id', userId)
      .single();
    
    if (existingValidation) {
      return { 
        success: false, 
        message: 'Meal already validated for this user',
        data: {
          validationTime: existingValidation.validation_time,
          location: existingValidation.location,
        }
      };
    }
    
    // Create new validation record
    const { data: newValidation, error: insertError } = await supabase
      .from('meal_validations')
      .insert({
        meal_id: mealId,
        user_id: userId,
        validator_id: validatorId,
        location,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating validation record:', insertError);
      return { success: false, message: 'Failed to validate meal' };
    }
    
    return {
      success: true,
      message: 'Meal validated successfully',
      data: {
        user: user.full_name,
        meal: meal.name,
        validationTime: newValidation.validation_time,
        location,
      },
    };
  } catch (error) {
    console.error('Error validating QR code:', error);
    return { success: false, message: 'Failed to process QR code' };
  }
}
