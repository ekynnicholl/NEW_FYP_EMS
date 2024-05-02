import type { Database } from "@/lib/supabase";

declare global {
	type ExternalForm = Database['public']['Tables']['external_forms']['Row'];
	type AttendanceList = Database['public']['Tables']['attendance_lists']['Row'];
	type InternalEvent = Database['public']['Tables']['internal_events']['Row'];
	type AuditLog = Database['public']['Tables']['audit_log']['Row'];

	// type LogisticArrangement = {
	// 	flight_date: Date | null;
	// 	flight_time: string | null;
	// 	flight_number: string | null;
	// 	destination_from: string | null;
	// 	destination_to: string | null;
	// 	hotel_name: string | null;
	// 	check_in_date: Date | null;
	// 	check_out_date: Date | null;
	// }
}