export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attendance_forms: {
        Row: {
          attFormsFacultyUnit: string | null
          attFormsID: string
          attFormsListID: string
          attFormsStaffID: number | null
          attFormsStaffName: string | null
        }
        Insert: {
          attFormsFacultyUnit?: string | null
          attFormsID?: string
          attFormsListID: string
          attFormsStaffID?: number | null
          attFormsStaffName?: string | null
        }
        Update: {
          attFormsFacultyUnit?: string | null
          attFormsID?: string
          attFormsListID?: string
          attFormsStaffID?: number | null
          attFormsStaffName?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_forms_attFormsListID_fkey"
            columns: ["attFormsListID"]
            referencedRelation: "attendance_list"
            referencedColumns: ["attListID"]
          }
        ]
      }
      attendance_list: {
        Row: {
          attListDayCount: number
          attListEventDate: string | null
          attListEventID: string | null
          attListID: string
        }
        Insert: {
          attListDayCount?: number
          attListEventDate?: string | null
          attListEventID?: string | null
          attListID?: string
        }
        Update: {
          attListDayCount?: number
          attListEventDate?: string | null
          attListEventID?: string | null
          attListID?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_list_attListEventID_fkey"
            columns: ["attListEventID"]
            referencedRelation: "internal_events"
            referencedColumns: ["intFID"]
          }
        ]
      }
      external_form: {
        Row: {
          accommodation_fee: number | null
          airfare_fee: number | null
          applicant_declaration_date: string | null
          applicant_name: string | null
          applicant_position_title: string | null
          applicant_signature: string | null
          approval_declaration_date: string | null
          approval_name: string | null
          approval_position_title: string | null
          approval_signature: string | null
          approval_status: boolean | null
          check_in_date: string | null
          check_out_date: string | null
          commencement_date: string | null
          completion_date: string | null
          consolidated_pool_fund: string | null
          course: string | null
          course_fee: number | null
          created_at: string
          destination_from: string | null
          destination_to: string | null
          email: string | null
          expenditure_cap_amount: number | null
          faculty: string | null
          flight_date: string | null
          flight_number: string | null
          flight_time: string | null
          has_expenditure_cap: boolean | null
          hotel: string | null
          HRDF_claimable: string | null
          id: number
          name: string | null
          organiser: string | null
          other_fee: number | null
          other_fund: string | null
          other_member: string | null
          per_diem_fee: number | null
          program_description: string | null
          program_title: string | null
          research_fund: string | null
          review_status: boolean | null
          staff_development_fund: string | null
          staff_id: string | null
          student_council_fund: string | null
          total_fee: number | null
          transport: string | null
          transportation_fee: number | null
          travel_fund: string | null
          travel_insurance_fee: number | null
          traveling: string | null
          venue: string | null
          verification_declaration_date: string | null
          verification_name: string | null
          verification_position_title: string | null
          verification_signature: string | null
          verification_status: boolean | null
        }
        Insert: {
          accommodation_fee?: number | null
          airfare_fee?: number | null
          applicant_declaration_date?: string | null
          applicant_name?: string | null
          applicant_position_title?: string | null
          applicant_signature?: string | null
          approval_declaration_date?: string | null
          approval_name?: string | null
          approval_position_title?: string | null
          approval_signature?: string | null
          approval_status?: boolean | null
          check_in_date?: string | null
          check_out_date?: string | null
          commencement_date?: string | null
          completion_date?: string | null
          consolidated_pool_fund?: string | null
          course?: string | null
          course_fee?: number | null
          created_at?: string
          destination_from?: string | null
          destination_to?: string | null
          email?: string | null
          expenditure_cap_amount?: number | null
          faculty?: string | null
          flight_date?: string | null
          flight_number?: string | null
          flight_time?: string | null
          has_expenditure_cap?: boolean | null
          hotel?: string | null
          HRDF_claimable?: string | null
          id?: number
          name?: string | null
          organiser?: string | null
          other_fee?: number | null
          other_fund?: string | null
          other_member?: string | null
          per_diem_fee?: number | null
          program_description?: string | null
          program_title?: string | null
          research_fund?: string | null
          review_status?: boolean | null
          staff_development_fund?: string | null
          staff_id?: string | null
          student_council_fund?: string | null
          total_fee?: number | null
          transport?: string | null
          transportation_fee?: number | null
          travel_fund?: string | null
          travel_insurance_fee?: number | null
          traveling?: string | null
          venue?: string | null
          verification_declaration_date?: string | null
          verification_name?: string | null
          verification_position_title?: string | null
          verification_signature?: string | null
          verification_status?: boolean | null
        }
        Update: {
          accommodation_fee?: number | null
          airfare_fee?: number | null
          applicant_declaration_date?: string | null
          applicant_name?: string | null
          applicant_position_title?: string | null
          applicant_signature?: string | null
          approval_declaration_date?: string | null
          approval_name?: string | null
          approval_position_title?: string | null
          approval_signature?: string | null
          approval_status?: boolean | null
          check_in_date?: string | null
          check_out_date?: string | null
          commencement_date?: string | null
          completion_date?: string | null
          consolidated_pool_fund?: string | null
          course?: string | null
          course_fee?: number | null
          created_at?: string
          destination_from?: string | null
          destination_to?: string | null
          email?: string | null
          expenditure_cap_amount?: number | null
          faculty?: string | null
          flight_date?: string | null
          flight_number?: string | null
          flight_time?: string | null
          has_expenditure_cap?: boolean | null
          hotel?: string | null
          HRDF_claimable?: string | null
          id?: number
          name?: string | null
          organiser?: string | null
          other_fee?: number | null
          other_fund?: string | null
          other_member?: string | null
          per_diem_fee?: number | null
          program_description?: string | null
          program_title?: string | null
          research_fund?: string | null
          review_status?: boolean | null
          staff_development_fund?: string | null
          staff_id?: string | null
          student_council_fund?: string | null
          total_fee?: number | null
          transport?: string | null
          transportation_fee?: number | null
          travel_fund?: string | null
          travel_insurance_fee?: number | null
          traveling?: string | null
          venue?: string | null
          verification_declaration_date?: string | null
          verification_name?: string | null
          verification_position_title?: string | null
          verification_signature?: string | null
          verification_status?: boolean | null
        }
        Relationships: []
      }
      external_form_duplicate: {
        Row: {
          accommodation_fee: number | null
          airfare_fee: number | null
          applicant_declaration_date: string | null
          applicant_name: string | null
          applicant_position_title: string | null
          applicant_signature: string | null
          approval_declaration_date: string | null
          approval_name: string | null
          approval_position_title: string | null
          approval_signature: string | null
          check_in_date: string | null
          check_out_date: string | null
          commencement_date: string | null
          completion_date: string | null
          consolidated_pool_fund: string | null
          course: string | null
          course_fee: number | null
          created_at: string
          destination_from: string | null
          destination_to: string | null
          email: string | null
          expenditure_cap_amount: number | null
          faculty: string | null
          flight_date: string | null
          flight_number: string | null
          flight_time: string | null
          has_expenditure_cap: boolean | null
          hotel: string | null
          HRDF_claimable: string | null
          id: number
          name: string | null
          organiser: string | null
          other_fee: number | null
          other_fund: string | null
          other_member: string | null
          per_diem_fee: number | null
          program_description: string | null
          program_title: string | null
          research_fund: string | null
          staff_development_fund: string | null
          staff_id: string | null
          student_council_fund: string | null
          total_fee: number | null
          transport: string | null
          transportation_fee: number | null
          travel_fund: string | null
          travel_insurance_fee: number | null
          traveling: string | null
          venue: string | null
          verification_declaration_date: string | null
          verification_name: string | null
          verification_position_title: string | null
          verification_signature: string | null
        }
        Insert: {
          accommodation_fee?: number | null
          airfare_fee?: number | null
          applicant_declaration_date?: string | null
          applicant_name?: string | null
          applicant_position_title?: string | null
          applicant_signature?: string | null
          approval_declaration_date?: string | null
          approval_name?: string | null
          approval_position_title?: string | null
          approval_signature?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          commencement_date?: string | null
          completion_date?: string | null
          consolidated_pool_fund?: string | null
          course?: string | null
          course_fee?: number | null
          created_at?: string
          destination_from?: string | null
          destination_to?: string | null
          email?: string | null
          expenditure_cap_amount?: number | null
          faculty?: string | null
          flight_date?: string | null
          flight_number?: string | null
          flight_time?: string | null
          has_expenditure_cap?: boolean | null
          hotel?: string | null
          HRDF_claimable?: string | null
          id?: number
          name?: string | null
          organiser?: string | null
          other_fee?: number | null
          other_fund?: string | null
          other_member?: string | null
          per_diem_fee?: number | null
          program_description?: string | null
          program_title?: string | null
          research_fund?: string | null
          staff_development_fund?: string | null
          staff_id?: string | null
          student_council_fund?: string | null
          total_fee?: number | null
          transport?: string | null
          transportation_fee?: number | null
          travel_fund?: string | null
          travel_insurance_fee?: number | null
          traveling?: string | null
          venue?: string | null
          verification_declaration_date?: string | null
          verification_name?: string | null
          verification_position_title?: string | null
          verification_signature?: string | null
        }
        Update: {
          accommodation_fee?: number | null
          airfare_fee?: number | null
          applicant_declaration_date?: string | null
          applicant_name?: string | null
          applicant_position_title?: string | null
          applicant_signature?: string | null
          approval_declaration_date?: string | null
          approval_name?: string | null
          approval_position_title?: string | null
          approval_signature?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          commencement_date?: string | null
          completion_date?: string | null
          consolidated_pool_fund?: string | null
          course?: string | null
          course_fee?: number | null
          created_at?: string
          destination_from?: string | null
          destination_to?: string | null
          email?: string | null
          expenditure_cap_amount?: number | null
          faculty?: string | null
          flight_date?: string | null
          flight_number?: string | null
          flight_time?: string | null
          has_expenditure_cap?: boolean | null
          hotel?: string | null
          HRDF_claimable?: string | null
          id?: number
          name?: string | null
          organiser?: string | null
          other_fee?: number | null
          other_fund?: string | null
          other_member?: string | null
          per_diem_fee?: number | null
          program_description?: string | null
          program_title?: string | null
          research_fund?: string | null
          staff_development_fund?: string | null
          staff_id?: string | null
          student_council_fund?: string | null
          total_fee?: number | null
          transport?: string | null
          transportation_fee?: number | null
          travel_fund?: string | null
          travel_insurance_fee?: number | null
          traveling?: string | null
          venue?: string | null
          verification_declaration_date?: string | null
          verification_name?: string | null
          verification_position_title?: string | null
          verification_signature?: string | null
        }
        Relationships: []
      }
      internal_events: {
        Row: {
          intFCreatedBy: string | null
          intFDateCreated: string | null
          intFDescription: string | null
          intFEndTime: string | null
          intFEventDays: number | null
          intFEventName: string
          intFFaculty: string | null
          intFID: string
          intFMaximumSeats: number | null
          intFOrganizer: string | null
          intFStartDate: string | null
          intFStartTime: string | null
          intFVenue: string | null
        }
        Insert: {
          intFCreatedBy?: string | null
          intFDateCreated?: string | null
          intFDescription?: string | null
          intFEndTime?: string | null
          intFEventDays?: number | null
          intFEventName: string
          intFFaculty?: string | null
          intFID?: string
          intFMaximumSeats?: number | null
          intFOrganizer?: string | null
          intFStartDate?: string | null
          intFStartTime?: string | null
          intFVenue?: string | null
        }
        Update: {
          intFCreatedBy?: string | null
          intFDateCreated?: string | null
          intFDescription?: string | null
          intFEndTime?: string | null
          intFEventDays?: number | null
          intFEventName?: string
          intFFaculty?: string | null
          intFID?: string
          intFMaximumSeats?: number | null
          intFOrganizer?: string | null
          intFStartDate?: string | null
          intFStartTime?: string | null
          intFVenue?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
