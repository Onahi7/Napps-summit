import sharp from 'sharp';
import QRCode from 'qrcode';
import { supabase } from '@/app/supabaseClient';
import path from 'path';

interface TagData {
  fullName: string;
  registrationId: string;
  organization: string;
  role: string;
  state: string;
  chapter: string;
  profileImage?: string;
}

interface Profile {
  full_name: string;
  organization: string;
  role: string;
  state: string;
  chapter: string;
  profile_photo: string | null;
}

interface Registration {
  id: string;
  registration_id: string;
  profiles: Profile;
}

interface RegistrationWithProfiles {
  id: string;
  registration_id: string;
  profiles: Profile[];
}

async function createTextSVG(text: string, options: { fontSize: number; color: string; width: number; align: 'left' | 'center' | 'right' }) {
  return `
    <svg width="${options.width}" height="${options.fontSize * 1.2}">
      <text
        x="${options.align === 'center' ? options.width / 2 : options.align === 'right' ? options.width : 0}"
        y="${options.fontSize}"
        font-family="Arial"
        font-size="${options.fontSize}px"
        fill="${options.color}"
        text-anchor="${options.align === 'center' ? 'middle' : options.align === 'right' ? 'end' : 'start'}"
      >
        ${text}
      </text>
    </svg>
  `;
}

export async function generateTag(data: TagData): Promise<Buffer> {
  // Create a blank white canvas
  const baseImage = await sharp({
    create: {
      width: 1000,
      height: 1500,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  // Create header background
  const headerBg = await sharp({
    create: {
      width: 1000,
      height: 200,
      channels: 4,
      background: { r: 29, g: 78, b: 216, alpha: 1 }
    }
  }).png().toBuffer();

  // Create footer background
  const footerBg = await sharp({
    create: {
      width: 1000,
      height: 100,
      channels: 4,
      background: { r: 29, g: 78, b: 216, alpha: 1 }
    }
  }).png().toBuffer();

  // Generate QR code
  const qrCodeBuffer = await QRCode.toBuffer(data.registrationId, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1D4ED8',
      light: '#FFFFFF',
    },
  });

  // Create text overlays
  const textOverlays = await Promise.all([
    // Header text
    createTextSVG('North Central', { fontSize: 60, color: '#FFFFFF', width: 1000, align: 'center' }),
    createTextSVG('Education Summit', { fontSize: 60, color: '#FFFFFF', width: 1000, align: 'center' }),
    
    // Name and details
    createTextSVG(data.fullName, { fontSize: 48, color: '#1D4ED8', width: 1000, align: 'center' }),
    createTextSVG(data.organization, { fontSize: 36, color: '#374151', width: 1000, align: 'center' }),
    createTextSVG(data.role.toUpperCase(), { fontSize: 32, color: '#6B7280', width: 1000, align: 'center' }),
    createTextSVG(`${data.state} - ${data.chapter}`, { fontSize: 28, color: '#6B7280', width: 1000, align: 'center' }),
    createTextSVG(data.registrationId, { fontSize: 24, color: '#6B7280', width: 1000, align: 'center' }),
    
    // Footer text
    createTextSVG('www.northcentraleducationsummit.com', { fontSize: 24, color: '#FFFFFF', width: 1000, align: 'center' }),
  ]);

  let composite: sharp.OverlayOptions[] = [
    // Add header background
    { input: headerBg, top: 0, left: 0 },
    // Add footer background
    { input: footerBg, top: 1400, left: 0 },
    // Add QR code
    { input: qrCodeBuffer, top: 900, left: 400 },
  ];

  // Add profile image if available
  if (data.profileImage) {
    try {
      const { data: imageData } = await supabase
        .storage
        .from('profile-photos')
        .download(data.profileImage);

      if (imageData) {
        const profileImageBuffer = await sharp(await imageData.arrayBuffer())
          .resize(300, 300)
          .composite([{
            input: Buffer.from(`
              <svg>
                <circle cx="150" cy="150" r="150" fill="white"/>
              </svg>
            `),
            blend: 'dest-in'
          }])
          .toBuffer();

        composite.push({ input: profileImageBuffer, top: 250, left: 350 });
      }
    } catch (error) {
      console.error('Error processing profile image:', error);
    }
  }

  // Add text overlays
  composite = composite.concat([
    { input: Buffer.from(textOverlays[0]), top: 50, left: 0 },
    { input: Buffer.from(textOverlays[1]), top: 120, left: 0 },
    { input: Buffer.from(textOverlays[2]), top: 620, left: 0 },
    { input: Buffer.from(textOverlays[3]), top: 690, left: 0 },
    { input: Buffer.from(textOverlays[4]), top: 750, left: 0 },
    { input: Buffer.from(textOverlays[5]), top: 810, left: 0 },
    { input: Buffer.from(textOverlays[6]), top: 1120, left: 0 },
    { input: Buffer.from(textOverlays[7]), top: 1440, left: 0 },
  ]);

  // Add border
  const borderWidth = 10;
  const borderColor = { r: 29, g: 78, b: 216, alpha: 1 };

  return baseImage
    .composite(composite)
    .recomb([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ])
    .flatten({ background: borderColor })
    .extend({
      top: borderWidth,
      bottom: borderWidth,
      left: borderWidth,
      right: borderWidth,
      background: borderColor
    })
    .png()
    .toBuffer();
}

export async function generateBulkTags(registrationIds: string[]): Promise<string[]> {
  try {
    // Get registration data
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        id,
        registration_id,
        profiles!inner (
          full_name,
          organization,
          role,
          state,
          chapter,
          profile_photo
        )
      `)
      .in('registration_id', registrationIds);

    if (error) throw error;
    if (!registrations) throw new Error('No registrations found');

    // Type assertion for registrations data
    const typedRegistrations = registrations as unknown as RegistrationWithProfiles[];

    // Generate tags in parallel
    const tagPromises = typedRegistrations.map(async (registration) => {
      const profile = registration.profiles[0]; // Get the first profile since it's a 1-1 relationship
      if (!profile) throw new Error(`No profile found for registration ${registration.registration_id}`);

      const tagData: TagData = {
        fullName: profile.full_name,
        registrationId: registration.registration_id,
        organization: profile.organization,
        role: profile.role,
        state: profile.state,
        chapter: profile.chapter,
        profileImage: profile.profile_photo || undefined
      };

      // Generate tag
      const tagBuffer = await generateTag(tagData);

      // Save tag to storage
      const fileName = `${registration.registration_id}-tag.png`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('tags')
        .upload(fileName, tagBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('tags')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return await Promise.all(tagPromises);
  } catch (error) {
    console.error('Error generating bulk tags:', error);
    throw error;
  }
}
