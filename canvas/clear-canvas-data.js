import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearCanvasData() {
	// Get all canvases with data
	const { data: canvases, error: fetchError } = await supabase
		.from('canvases')
		.select('id, name, owner_id')
		.not('data', 'is', null);

	if (fetchError) {
		console.error('❌ Error fetching canvases:', fetchError.message);
		process.exit(1);
	}

	if (!canvases || canvases.length === 0) {
		console.log('✓ No canvases with data found');
		return;
	}

	console.log(`\n📋 Found ${canvases.length} canvas(es) with data:\n`);
	canvases.forEach((canvas, index) => {
		console.log(`${index + 1}. ${canvas.name || 'Untitled'} (${canvas.id})`);
	});

	console.log('\n🧹 Clearing all canvas data...\n');

	// Clear data for all canvases
	const { error: updateError } = await supabase
		.from('canvases')
		.update({ data: null })
		.not('data', 'is', null);

	if (updateError) {
		console.error('❌ Error clearing canvas data:', updateError.message);
		process.exit(1);
	}

	console.log('✅ Successfully cleared data from all canvases!');
	console.log('💡 Your canvases will start fresh when you open them next time.\n');
}

clearCanvasData().catch((error) => {
	console.error('❌ Unexpected error:', error);
	process.exit(1);
});
