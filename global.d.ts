import type { Database } from "@/lib/supabase";

declare global {
	type ExternalForm = Database['public']['Tables']['external_forms']['Row'];
	type AttendanceList = Database['public']['Tables']['attendance_lists']['Row'];
	type InternalEvent = Database['public']['Tables']['internal_events']['Row'];
}