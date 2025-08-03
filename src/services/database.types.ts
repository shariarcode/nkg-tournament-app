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
      leaderboard: {
        Row: {
          id: number
          player_name: string
          profile_pic_url: string | null
          rank: number | null
          winnings: number
        }
        Insert: {
          id?: number
          player_name: string
          profile_pic_url?: string | null
          rank?: number | null
          winnings: number
        }
        Update: {
          id?: number
          player_name?: string
          profile_pic_url?: string | null
          rank?: number | null
          winnings?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          free_fire_id: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          phone: string | null
          profile_pic_url: string | null
        }
        Insert: {
          free_fire_id?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          phone?: string | null
          profile_pic_url?: string | null
        }
        Update: {
          free_fire_id?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          phone?: string | null
          profile_pic_url?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          bkash_last4: string
          bkash_number: string
          created_at: string
          id: number
          payment_screenshot_url: string
          player_id: string
          status: string
          tournament_id: number
        }
        Insert: {
          bkash_last4: string
          bkash_number: string
          created_at?: string
          id?: number
          payment_screenshot_url: string
          player_id: string
          status?: string
          tournament_id: number
        }
        Update: {
          bkash_last4?: string
          bkash_number?: string
          created_at?: string
          id?: number
          payment_screenshot_url?: string
          player_id?: string
          status?: string
          tournament_id?: number
        }
        Relationships: [
            {
              foreignKeyName: "registrations_player_id_fkey"
              columns: ["player_id"]
              isOneToOne: false
              referencedRelation: "profiles"
              referencedColumns: ["id"]
            },
            {
              foreignKeyName: "registrations_tournament_id_fkey"
              columns: ["tournament_id"]
              isOneToOne: false
              referencedRelation: "tournaments"
              referencedColumns: ["id"]
            }
          ]
      }
      site_content: {
        Row: {
          id: number
          created_at: string
          key: string
          value: string
          type: "text" | "textarea" | "image_url"
        }
        Insert: {
          id?: number
          created_at?: string
          key: string
          value: string
          type: "text" | "textarea" | "image_url"
        }
        Update: {
          id?: number
          created_at?: string
          key?: string
          value?: string
          type?: "text" | "textarea" | "image_url"
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          created_at: string
          date: string
          entry_fee: number
          id: number
          name: string
          prize_pool: number
          room_id: string | null
          room_password: string | null
          status: string
          time: string
        }
        Insert: {
          created_at?: string
          date: string
          entry_fee: number
          id?: number
          name: string
          prize_pool: number
          room_id?: string | null
          room_password?: string | null
          status?: string
          time: string
        }
        Update: {
          created_at?: string
          date?: string
          entry_fee?: number
          id?: number
          name?: string
          prize_pool?: number
          room_id?: string | null
          room_password?: string | null
          status?: string
          time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}