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
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          },
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
      squads: {
        Row: {
          id: number
          created_at: string
          squad_name: string
          captain_id: string
          captain_name: string
          player2_name: string
          player3_name: string
          player4_name: string
          whatsapp_number: string
          contact_email: string
          status: string
          bkash_number: string | null
          bkash_last4: string | null
          payment_screenshot_url: string | null
          tournament_id: number
        }
        Insert: {
          id?: number
          created_at?: string
          squad_name: string
          captain_id: string
          captain_name: string
          player2_name: string
          player3_name: string
          player4_name: string
          whatsapp_number: string
          contact_email: string
          status?: string
          bkash_number?: string | null
          bkash_last4?: string | null
          payment_screenshot_url?: string | null
          tournament_id: number
        }
        Update: {
          id?: number
          created_at?: string
          squad_name?: string
          captain_id?: string
          captain_name?: string
          player2_name?: string
          player3_name?: string
          player4_name?: string
          whatsapp_number?: string
          contact_email?: string
          status?: string
          bkash_number?: string | null
          bkash_last4?: string | null
          payment_screenshot_url?: string | null
          tournament_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "squads_captain_id_fkey"
            columns: ["captain_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squads_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          banner_image_url: string | null
          created_at: string
          date: string
          entry_fee: number
          id: number
          map: string | null
          name: string
          per_kill_prize: number | null
          prize_pool: number
          room_id: string | null
          room_password: string | null
          spots_filled: number | null
          status: string
          time: string
          total_spots: number | null
          type: string | null
          version: string | null
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string
          date: string
          entry_fee: number
          id?: number
          map?: string | null
          name: string
          per_kill_prize?: number | null
          prize_pool: number
          room_id?: string | null
          room_password?: string | null
          spots_filled?: number | null
          status?: string
          time: string
          total_spots?: number | null
          type?: string | null
          version?: string | null
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string
          date?: string
          entry_fee?: number
          id?: number
          map?: string | null
          name?: string
          per_kill_prize?: number | null
          prize_pool?: number
          room_id?: string | null
          room_password?: string | null
          spots_filled?: number | null
          status?: string
          time?: string
          total_spots?: number | null
          type?: string | null
          version?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: {}
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