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
      accounts: {
        Row: {
          accDateCreated: string | null
          accEmail: string | null
          accHomeView: number
          accID: string
          accIsDarkMode: boolean | null
          accPassword: string | null
          accUsername: string | null
        }
        Insert: {
          accDateCreated?: string | null
          accEmail?: string | null
          accHomeView?: number
          accID?: string
          accIsDarkMode?: boolean | null
          accPassword?: string | null
          accUsername?: string | null
        }
        Update: {
          accDateCreated?: string | null
          accEmail?: string | null
          accHomeView?: number
          accID?: string
          accIsDarkMode?: boolean | null
          accPassword?: string | null
          accUsername?: string | null
        }
        Relationships: []
      }
      attendance_forms: {
        Row: {
          attDateSubmitted: string | null
          attFormsFacultyUnit: string | null
          attFormsID: string
          attFormsStaffID: string | null
          attFormsStaffName: string | null
          attFSubEventID: string
        }
        Insert: {
          attDateSubmitted?: string | null
          attFormsFacultyUnit?: string | null
          attFormsID?: string
          attFormsStaffID?: string | null
          attFormsStaffName?: string | null
          attFSubEventID: string
        }
        Update: {
          attDateSubmitted?: string | null
          attFormsFacultyUnit?: string | null
          attFormsID?: string
          attFormsStaffID?: string | null
          attFormsStaffName?: string | null
          attFSubEventID?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_forms_attFSubEventID_fkey"
            columns: ["attFSubEventID"]
            referencedRelation: "sub_events"
            referencedColumns: ["sub_eventsID"]
          }
        ]
      }
      expenditure_testing: {
        Row: {
          dateEntered: string | null
          expenditureAmount: number
          facultyUnit: string | null
          id: string
        }
        Insert: {
          dateEntered?: string | null
          expenditureAmount?: number
          facultyUnit?: string | null
          id?: string
        }
        Update: {
          dateEntered?: string | null
          expenditureAmount?: number
          facultyUnit?: string | null
          id?: string
        }
        Relationships: []
      }
      external_forms: {
        Row: {
          accommodation_fee: number | null
          airfare_fee: number | null
          applicant_declaration_date: string | null
          applicant_declaration_name: string | null
          applicant_declaration_position_title: string | null
          applicant_declaration_signature: string | null
          approval_date: string | null
          approval_email: string | null
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
          created_at: string | null
          destination_from: string | null
          destination_to: string | null
          email: string
          expenditure_cap: string | null
          expenditure_cap_amount: number | null
          faculty: string | null
          flight_date: string | null
          flight_number: string | null
          flight_time: string | null
          formStage: number | null
          full_name: string | null
          grand_total_fees: number | null
          hotel_name: string | null
          hrdf_claimable: string | null
          id: string
          organiser: string | null
          other_fees: number | null
          other_funds: string | null
          other_members: string | null
          per_diem_fee: number | null
          program_description: string | null
          program_title: string | null
          research_fund: string | null
          revertComment: string | null
          securityKey: string | null
          staff_development_fund: string | null
          staff_id: string | null
          student_council_fund: string | null
          total_members: number | null
          transport: string | null
          transportation_fee: number | null
          travel_fund: string | null
          travel_insurance_fee: number | null
          travelling: string | null
          venue: string | null
          verification_date: string | null
          verification_email: string | null
          verification_name: string | null
          verification_position_title: string | null
          verification_signature: string | null
        }
        Insert: {
          accommodation_fee?: number | null
          airfare_fee?: number | null
          applicant_declaration_date?: string | null
          applicant_declaration_name?: string | null
          applicant_declaration_position_title?: string | null
          applicant_declaration_signature?: string | null
          approval_date?: string | null
          approval_email?: string | null
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
          created_at?: string | null
          destination_from?: string | null
          destination_to?: string | null
          email: string
          expenditure_cap?: string | null
          expenditure_cap_amount?: number | null
          faculty?: string | null
          flight_date?: string | null
          flight_number?: string | null
          flight_time?: string | null
          formStage?: number | null
          full_name?: string | null
          grand_total_fees?: number | null
          hotel_name?: string | null
          hrdf_claimable?: string | null
          id?: string
          organiser?: string | null
          other_fees?: number | null
          other_funds?: string | null
          other_members?: string | null
          per_diem_fee?: number | null
          program_description?: string | null
          program_title?: string | null
          research_fund?: string | null
          revertComment?: string | null
          securityKey?: string | null
          staff_development_fund?: string | null
          staff_id?: string | null
          student_council_fund?: string | null
          total_members?: number | null
          transport?: string | null
          transportation_fee?: number | null
          travel_fund?: string | null
          travel_insurance_fee?: number | null
          travelling?: string | null
          venue?: string | null
          verification_date?: string | null
          verification_email?: string | null
          verification_name?: string | null
          verification_position_title?: string | null
          verification_signature?: string | null
        }
        Update: {
          accommodation_fee?: number | null
          airfare_fee?: number | null
          applicant_declaration_date?: string | null
          applicant_declaration_name?: string | null
          applicant_declaration_position_title?: string | null
          applicant_declaration_signature?: string | null
          approval_date?: string | null
          approval_email?: string | null
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
          created_at?: string | null
          destination_from?: string | null
          destination_to?: string | null
          email?: string
          expenditure_cap?: string | null
          expenditure_cap_amount?: number | null
          faculty?: string | null
          flight_date?: string | null
          flight_number?: string | null
          flight_time?: string | null
          formStage?: number | null
          full_name?: string | null
          grand_total_fees?: number | null
          hotel_name?: string | null
          hrdf_claimable?: string | null
          id?: string
          organiser?: string | null
          other_fees?: number | null
          other_funds?: string | null
          other_members?: string | null
          per_diem_fee?: number | null
          program_description?: string | null
          program_title?: string | null
          research_fund?: string | null
          revertComment?: string | null
          securityKey?: string | null
          staff_development_fund?: string | null
          staff_id?: string | null
          student_council_fund?: string | null
          total_members?: number | null
          transport?: string | null
          transportation_fee?: number | null
          travel_fund?: string | null
          travel_insurance_fee?: number | null
          travelling?: string | null
          venue?: string | null
          verification_date?: string | null
          verification_email?: string | null
          verification_name?: string | null
          verification_position_title?: string | null
          verification_signature?: string | null
        }
        Relationships: []
      }
      external_testing: {
        Row: {
          cappedAmount: number | null
          deanEmail: string | null
          expenditureCapped: boolean | null
          formID: string
          formStage: number | null
          fundAmount: number | null
          fundSourceName: string
          hosEmail: string | null
          hosName: string | null
          revertComment: string | null
          securityKey: string | null
        }
        Insert: {
          cappedAmount?: number | null
          deanEmail?: string | null
          expenditureCapped?: boolean | null
          formID?: string
          formStage?: number | null
          fundAmount?: number | null
          fundSourceName: string
          hosEmail?: string | null
          hosName?: string | null
          revertComment?: string | null
          securityKey?: string | null
        }
        Update: {
          cappedAmount?: number | null
          deanEmail?: string | null
          expenditureCapped?: boolean | null
          formID?: string
          formStage?: number | null
          fundAmount?: number | null
          fundSourceName?: string
          hosEmail?: string | null
          hosName?: string | null
          revertComment?: string | null
          securityKey?: string | null
        }
        Relationships: []
      }
      feedback_forms: {
        Row: {
          fbCommencementDate: string | null
          fbCompletionDate: string | null
          fbCourseName: string | null
          fbDateSubmitted: string | null
          fbDuration: string | null
          fbEmailAddress: string | null
          fbFullName: string | null
          fbID: string
          fbSectionA1: number | null
          fbSectionA2: number | null
          fbSectionA3: number | null
          fbSectionA4: number | null
          fbSectionA5: number | null
          fbSectionB1: number | null
          fbSectionB2: number | null
          fbSectionB3: number | null
          fbSectionB4: number | null
          fbSectionC1: number | null
          fbSectionD1: number | null
          fbSectionEAdditional: string | null
          fbSectionEChanges: string | null
          fbSectionESuggestions: string | null
          fbSubEventID: string
          fbTrainersName: string | null
          fbTrainingProvider: string | null
        }
        Insert: {
          fbCommencementDate?: string | null
          fbCompletionDate?: string | null
          fbCourseName?: string | null
          fbDateSubmitted?: string | null
          fbDuration?: string | null
          fbEmailAddress?: string | null
          fbFullName?: string | null
          fbID?: string
          fbSectionA1?: number | null
          fbSectionA2?: number | null
          fbSectionA3?: number | null
          fbSectionA4?: number | null
          fbSectionA5?: number | null
          fbSectionB1?: number | null
          fbSectionB2?: number | null
          fbSectionB3?: number | null
          fbSectionB4?: number | null
          fbSectionC1?: number | null
          fbSectionD1?: number | null
          fbSectionEAdditional?: string | null
          fbSectionEChanges?: string | null
          fbSectionESuggestions?: string | null
          fbSubEventID: string
          fbTrainersName?: string | null
          fbTrainingProvider?: string | null
        }
        Update: {
          fbCommencementDate?: string | null
          fbCompletionDate?: string | null
          fbCourseName?: string | null
          fbDateSubmitted?: string | null
          fbDuration?: string | null
          fbEmailAddress?: string | null
          fbFullName?: string | null
          fbID?: string
          fbSectionA1?: number | null
          fbSectionA2?: number | null
          fbSectionA3?: number | null
          fbSectionA4?: number | null
          fbSectionA5?: number | null
          fbSectionB1?: number | null
          fbSectionB2?: number | null
          fbSectionB3?: number | null
          fbSectionB4?: number | null
          fbSectionC1?: number | null
          fbSectionD1?: number | null
          fbSectionEAdditional?: string | null
          fbSectionEChanges?: string | null
          fbSectionESuggestions?: string | null
          fbSubEventID?: string
          fbTrainersName?: string | null
          fbTrainingProvider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_forms_fbSubEventID_fkey"
            columns: ["fbSubEventID"]
            referencedRelation: "sub_events"
            referencedColumns: ["sub_eventsID"]
          }
        ]
      }
      internal_events: {
        Row: {
          date_created: string | null
          intFEventDescription: string | null
          intFEventEndDate: string | null
          intFEventName: string
          intFEventStartDate: string | null
          intFID: string
        }
        Insert: {
          date_created?: string | null
          intFEventDescription?: string | null
          intFEventEndDate?: string | null
          intFEventName: string
          intFEventStartDate?: string | null
          intFID?: string
        }
        Update: {
          date_created?: string | null
          intFEventDescription?: string | null
          intFEventEndDate?: string | null
          intFEventName?: string
          intFEventStartDate?: string | null
          intFID?: string
        }
        Relationships: []
      }
      login: {
        Row: {
          created_at: string | null
          email_address: string | null
          firebase_uid: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email_address?: string | null
          firebase_uid?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          email_address?: string | null
          firebase_uid?: string | null
          id?: string
        }
        Relationships: []
      }
      sub_events: {
        Row: {
          date_created: string | null
          sub_eventsEndDate: string | null
          sub_eventsEndTime: string | null
          sub_eventsID: string
          sub_eventsMainID: string | null
          sub_eventsMaxSeats: number | null
          sub_eventsName: string | null
          sub_eventsOrganizer: string | null
          sub_eventsStartDate: string | null
          sub_eventsStartTime: string | null
          sub_eventsVenue: string | null
        }
        Insert: {
          date_created?: string | null
          sub_eventsEndDate?: string | null
          sub_eventsEndTime?: string | null
          sub_eventsID?: string
          sub_eventsMainID?: string | null
          sub_eventsMaxSeats?: number | null
          sub_eventsName?: string | null
          sub_eventsOrganizer?: string | null
          sub_eventsStartDate?: string | null
          sub_eventsStartTime?: string | null
          sub_eventsVenue?: string | null
        }
        Update: {
          date_created?: string | null
          sub_eventsEndDate?: string | null
          sub_eventsEndTime?: string | null
          sub_eventsID?: string
          sub_eventsMainID?: string | null
          sub_eventsMaxSeats?: number | null
          sub_eventsName?: string | null
          sub_eventsOrganizer?: string | null
          sub_eventsStartDate?: string | null
          sub_eventsStartTime?: string | null
          sub_eventsVenue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_events_sub_eventsMainID_fkey"
            columns: ["sub_eventsMainID"]
            referencedRelation: "internal_events"
            referencedColumns: ["intFID"]
          }
        ]
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
