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
          },
        ]
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
        Returns: {
          id: string
          aud: string
          role: string
          email: string
          encrypted_password: string
          email_confirmed_at: string
          invited_at: string
          confirmation_token: string
          confirmation_sent_at: string
          recovery_token: string
          recovery_sent_at: string
          email_change_token_new: string
          email_change: string
          email_change_sent_at: string
          last_sign_in_at: string
          raw_app_meta_data: Json
          raw_user_meta_data: Json
          is_super_admin: boolean
          created_at: string
          updated_at: string
          phone: string
          phone_confirmed_at: string
          phone_change: string
          phone_change_token: string
          phone_change_sent_at: string
          email_change_token_current: string
          email_change_confirm_status: number
          banned_until: string
          reauthentication_token: string
          reauthentication_sent_at: string
          is_sso_user: boolean
          deleted_at: string
          is_anonymous: boolean
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never