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
      orders: {
        Row: {
          id: string
          user_address: string
          items: Json
          total: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
          transaction_hash?: string
          shipping_address?: {
            name: string
            street: string
            city: string
            state: string
            zip: string
            country: string
          }
          charge_id: string
          coinbase_metadata?: Json
        }
        Insert: {
          id: string
          user_address: string
          items: Json
          total: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          transaction_hash?: string
          shipping_address?: {
            name: string
            street: string
            city: string
            state: string
            zip: string
            country: string
          }
          charge_id: string
          coinbase_metadata?: Json
        }
        Update: {
          id?: string
          user_address?: string
          items?: Json
          total?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          transaction_hash?: string
          shipping_address?: {
            name: string
            street: string
            city: string
            state: string
            zip: string
            country: string
          }
          charge_id?: string
          coinbase_metadata?: Json
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          type: 'physical' | 'nft'
          image_url?: string
          coinbase_product_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          type: 'physical' | 'nft'
          image_url?: string
          coinbase_product_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          type?: 'physical' | 'nft'
          image_url?: string
          coinbase_product_id?: string
          created_at?: string
          updated_at?: string
        }
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
  }
} 