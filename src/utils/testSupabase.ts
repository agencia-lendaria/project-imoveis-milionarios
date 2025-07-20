import { supabase } from '../config/supabaseClient';

export async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing connection to Supabase...');
    
    // Test existing tables
    const tablesToTest = [
      'imoveis_milionarios_lead_management',
      'imoveis_milionarios_chat_histories'
    ];
    
    const results: { [key: string]: boolean } = {};
    
    for (const table of tablesToTest) {
      try {
        console.log(`🔄 Testing table: ${table}`);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ Error accessing ${table}:`, error.message);
          results[table] = false;
        } else {
          console.log(`✅ Table ${table} accessible. Sample data:`, data?.length || 0, 'rows');
          results[table] = true;
        }
      } catch (err) {
        console.error(`❌ Error testing ${table}:`, err);
        results[table] = false;
      }
    }
    
    // Check if all tables are accessible
    const allTablesOk = Object.values(results).every(result => result === true);
    
    console.log('📊 Test Results:', results);
    
    if (allTablesOk) {
      console.log('✅ All existing tables are accessible!');
    } else {
      console.log('⚠️ Some tables are not accessible');
    }
    
    return { success: allTablesOk, results };
  } catch (err) {
    console.error('❌ Error testing Supabase connection:', err);
    return { success: false, results: {} };
  }
}