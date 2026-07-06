import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log('Fixing orphaned exams...');
  // Find invalid ones
  const { data: exams } = await supabase.from('coaching_exams').select('id, category_id');
  console.log('Current exams:', exams);
  
  if (exams) {
    for (const ex of exams) {
      if (ex.category_id !== 'engineering' && ex.category_id !== 'medical') {
        await supabase.from('coaching_exams').update({ category_id: 'engineering' }).eq('id', ex.id);
        console.log(`Fixed exam ${ex.id}`);
      }
    }
  }
}

fix();
