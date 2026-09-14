import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vaubwtgxvgvyjhvtvokq.supabase.co';
const supabaseKey = 'sb_publishable_9Ezqm-KYQrGrg1XcSiJizw_gkpTKkKy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Please specify ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    return;
  }

  console.log('Signing up admin user:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }
  
  console.log('User created:', data?.user?.id);
  console.log('Setting profile role to admin...');
  
  // Try to update the profile table to set the user as an admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', data.user.id);
    
  if (profileError) {
    console.error('Error updating profile role:', profileError.message);
    // Profile might not exist yet if triggers aren't set up, let's try to insert it
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, email, role: 'admin', full_name: 'Admin' }]);
      
    if (insertError) {
      console.error('Error inserting profile:', insertError.message);
    } else {
      console.log('Profile inserted successfully with admin role!');
    }
  } else {
    console.log('Profile updated successfully with admin role!');
  }
}

createUser();
