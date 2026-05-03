export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      access_links: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          label: string
          meta: Json | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          meta?: Json | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          meta?: Json | null
          url?: string
        }
        Relationships: []
      }
      ai_message_audit: {
        Row: {
          completion_tokens: number | null
          created_at: string
          force_persona: string | null
          id: number
          inventory_guard: string | null
          persona: string
          prompt_tokens: number | null
          request_snippet: string | null
          triggers: string[]
          user_id: string | null
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string
          force_persona?: string | null
          id?: never
          inventory_guard?: string | null
          persona: string
          prompt_tokens?: number | null
          request_snippet?: string | null
          triggers?: string[]
          user_id?: string | null
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string
          force_persona?: string | null
          id?: never
          inventory_guard?: string | null
          persona?: string
          prompt_tokens?: number | null
          request_snippet?: string | null
          triggers?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      analytics: {
        Row: {
          id: number
          view_count: number | null
        }
        Insert: {
          id?: number
          view_count?: number | null
        }
        Update: {
          id?: number
          view_count?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean
          hero_image_url: string | null
          id: string
          image_url: string
          is_elite: boolean | null
          logo_image_path: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean
          hero_image_url?: string | null
          id?: string
          image_url?: string
          is_elite?: boolean | null
          logo_image_path?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean
          hero_image_url?: string | null
          id?: string
          image_url?: string
          is_elite?: boolean | null
          logo_image_path?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string
          persona_used: string
          recommended_skus: Json | null
          response: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          persona_used: string
          recommended_skus?: Json | null
          response?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          persona_used?: string
          recommended_skus?: Json | null
          response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_transcripts: {
        Row: {
          id: number
          message: string
          sent_at: string | null
          user_id: number | null
        }
        Insert: {
          id?: number
          message: string
          sent_at?: string | null
          user_id?: number | null
        }
        Update: {
          id?: number
          message?: string
          sent_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      checkout_audit_log: {
        Row: {
          cart_count: number
          cart_items: Json
          checkout_url: string
          created_at: string | null
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          cart_count?: number
          cart_items: Json
          checkout_url: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          cart_count?: number
          cart_items?: Json
          checkout_url?: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cleanup_allowlist: {
        Row: {
          archive_table_name: string | null
          archive_table_schema: string | null
          table_name: string
          table_schema: string
          timestamp_column: string
        }
        Insert: {
          archive_table_name?: string | null
          archive_table_schema?: string | null
          table_name: string
          table_schema: string
          timestamp_column: string
        }
        Update: {
          archive_table_name?: string | null
          archive_table_schema?: string | null
          table_name?: string
          table_schema?: string
          timestamp_column?: string
        }
        Relationships: []
      }
      cod_orders: {
        Row: {
          area: string | null
          assigned_at: string | null
          city: string
          created_at: string
          customer_email: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          delivery_address: string
          delivery_notes: string | null
          driver_id: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          shipping_cost: number
          status: string
          subtotal: number
          token: string | null
          total: number
          updated_at: string
        }
        Insert: {
          area?: string | null
          assigned_at?: string | null
          city?: string
          created_at?: string
          customer_email?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          delivery_address: string
          delivery_notes?: string | null
          driver_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          token?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          area?: string | null
          assigned_at?: string | null
          city?: string
          created_at?: string
          customer_email?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_notes?: string | null
          driver_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          shipping_cost?: number
          status?: string
          subtotal?: number
          token?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      concierge_brain_rules: {
        Row: {
          action: Json
          brain_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          pattern: string | null
          rule_key: string
          rule_type: string | null
          rule_value: string
          weight: number
        }
        Insert: {
          action?: Json
          brain_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pattern?: string | null
          rule_key: string
          rule_type?: string | null
          rule_value: string
          weight?: number
        }
        Update: {
          action?: Json
          brain_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          pattern?: string | null
          rule_key?: string
          rule_type?: string | null
          rule_value?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "concierge_brain_rules_brain_id_fkey"
            columns: ["brain_id"]
            isOneToOne: false
            referencedRelation: "concierge_brains"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_brains: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          persona_name: string
          system_prompt: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          persona_name: string
          system_prompt: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          persona_name?: string
          system_prompt?: string
        }
        Relationships: []
      }
      concierge_profiles: {
        Row: {
          created_at: string
          id: string
          recommended_routine: Json
          skin_concern: string
          skin_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recommended_routine?: Json
          skin_concern: string
          skin_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recommended_routine?: Json
          skin_concern?: string
          skin_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          channel: string | null
          created_at: string
          id: string
          locale: string | null
          profile_id: string | null
          regimen: Json | null
          transcript: Json | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          locale?: string | null
          profile_id?: string | null
          regimen?: Json | null
          transcript?: Json | null
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          locale?: string | null
          profile_id?: string | null
          regimen?: Json | null
          transcript?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "concierge_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string | null
          message: string
          name: string
          read_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          message: string
          name: string
          read_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          message?: string
          name?: string
          read_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_leads: {
        Row: {
          chat_summary: string | null
          created_at: string | null
          email: string | null
          follow_up_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          order_value: number | null
          phone: string | null
          skin_concern: string | null
          source: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_summary?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          order_value?: number | null
          phone?: string | null
          skin_concern?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_summary?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          order_value?: number | null
          phone?: string | null
          skin_concern?: string | null
          source?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      digital_tray_products: {
        Row: {
          bestseller_rank: number | null
          created_at: string
          id: string
          inventory_total: number
          is_bestseller: boolean
          is_hero: boolean
          primary_concern: Database["public"]["Enums"]["skin_concern"]
          regimen_step: Database["public"]["Enums"]["regimen_step"]
          title: string
          updated_at: string
        }
        Insert: {
          bestseller_rank?: number | null
          created_at?: string
          id: string
          inventory_total?: number
          is_bestseller?: boolean
          is_hero?: boolean
          primary_concern: Database["public"]["Enums"]["skin_concern"]
          regimen_step: Database["public"]["Enums"]["regimen_step"]
          title: string
          updated_at?: string
        }
        Update: {
          bestseller_rank?: number | null
          created_at?: string
          id?: string
          inventory_total?: number
          is_bestseller?: boolean
          is_hero?: boolean
          primary_concern?: Database["public"]["Enums"]["skin_concern"]
          regimen_step?: Database["public"]["Enums"]["regimen_step"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_tray_products_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "digital_tray_products_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_tray_products_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          id: number
          recipient: string
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          id?: number
          recipient: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          id?: number
          recipient?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          event_type: string
          external_id: string | null
          id: string
          payload: Json
          provider: string
          raw_body: string
          received_at: string
          signature: string
          timestamp: number | null
          valid: boolean
        }
        Insert: {
          event_type: string
          external_id?: string | null
          id?: string
          payload: Json
          provider: string
          raw_body: string
          received_at?: string
          signature: string
          timestamp?: number | null
          valid?: boolean
        }
        Update: {
          event_type?: string
          external_id?: string | null
          id?: string
          payload?: Json
          provider?: string
          raw_body?: string
          received_at?: string
          signature?: string
          timestamp?: number | null
          valid?: boolean
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: never
          title: string
        }
        Update: {
          id?: never
          title?: string
        }
        Relationships: []
      }
      pipeline_error_log: {
        Row: {
          error_message: string
          id: number
          resolved: boolean
          run_id: string | null
          run_timestamp: string
          shopify_product_id: string
          sku: string
          stage: string
        }
        Insert: {
          error_message: string
          id?: never
          resolved?: boolean
          run_id?: string | null
          run_timestamp?: string
          shopify_product_id: string
          sku: string
          stage: string
        }
        Update: {
          error_message?: string
          id?: never
          resolved?: boolean
          run_id?: string | null
          run_timestamp?: string
          shopify_product_id?: string
          sku?: string
          stage?: string
        }
        Relationships: []
      }
      pipeline_requeue_queue: {
        Row: {
          id: number
          requested_at: string
          requested_by: string | null
          shopify_product_id: string
          sku: string
          stage: string
        }
        Insert: {
          id?: never
          requested_at?: string
          requested_by?: string | null
          shopify_product_id: string
          sku: string
          stage: string
        }
        Update: {
          id?: never
          requested_at?: string
          requested_by?: string | null
          shopify_product_id?: string
          sku?: string
          stage?: string
        }
        Relationships: []
      }
      product_clinical_metadata: {
        Row: {
          audit_model: string
          clinical_summary: string
          concern_tags: string[]
          confidence_score: number
          detected_ingredients: string[]
          id: number
          last_audited_at: string
          last_run_id: string | null
          pipeline_version: string
          shopify_product_id: string
          sku: string
        }
        Insert: {
          audit_model: string
          clinical_summary: string
          concern_tags?: string[]
          confidence_score?: number
          detected_ingredients?: string[]
          id?: never
          last_audited_at?: string
          last_run_id?: string | null
          pipeline_version: string
          shopify_product_id: string
          sku: string
        }
        Update: {
          audit_model?: string
          clinical_summary?: string
          concern_tags?: string[]
          confidence_score?: number
          detected_ingredients?: string[]
          id?: never
          last_audited_at?: string
          last_run_id?: string | null
          pipeline_version?: string
          shopify_product_id?: string
          sku?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          age_range: string | null
          body: string | null
          created_at: string
          helpful_count: number
          id: string
          primary_concern: string | null
          product_id: string
          rating: number
          skin_type: string | null
          title: string | null
          updated_at: string
          user_id: string
          verified_purchase: boolean
        }
        Insert: {
          age_range?: string | null
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          primary_concern?: string | null
          product_id: string
          rating: number
          skin_type?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          verified_purchase?: boolean
        }
        Update: {
          age_range?: string | null
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          primary_concern?: string | null
          product_id?: string
          rating?: number
          skin_type?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_tray_products_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_persona_lead: Database["public"]["Enums"]["persona_type"] | null
          asper_category: string | null
          availability_status: string | null
          available: boolean
          bestseller_rank: number | null
          brand: string | null
          category: string | null
          clinical_badge: string | null
          clinical_concerns: string[] | null
          compare_at_price: number | null
          concern_tags: string[] | null
          condition: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          dr_sami_approved: boolean | null
          gold_stitch_tier: boolean
          gtin: string | null
          handle: string | null
          hex_swatch: string | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          inventory_total: number
          is_bestseller: boolean
          is_hero: boolean
          key_actives: string[] | null
          key_benefit: string | null
          key_ingredients: string[] | null
          metadata: Json | null
          mpn: string | null
          name: string
          pharmacist_note: string | null
          price: number
          primary_concern: Database["public"]["Enums"]["skin_concern"]
          primary_icon_tag: string | null
          primary_pillar: string | null
          product_highlights: string[] | null
          product_type: string | null
          regimen_step: Database["public"]["Enums"]["regimen_step"]
          secondary_category: string | null
          secondary_icon_tag: string | null
          shopify_product_id: string | null
          shopify_variant_id: string | null
          sku: string | null
          stock: number
          tags: string[] | null
          texture_profile: string | null
          title: string | null
          updated_at: string
          variant_title: string | null
          vendor: string | null
        }
        Insert: {
          ai_persona_lead?: Database["public"]["Enums"]["persona_type"] | null
          asper_category?: string | null
          availability_status?: string | null
          available?: boolean
          bestseller_rank?: number | null
          brand?: string | null
          category?: string | null
          clinical_badge?: string | null
          clinical_concerns?: string[] | null
          compare_at_price?: number | null
          concern_tags?: string[] | null
          condition?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          dr_sami_approved?: boolean | null
          gold_stitch_tier?: boolean
          gtin?: string | null
          handle?: string | null
          hex_swatch?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          inventory_total?: number
          is_bestseller?: boolean
          is_hero?: boolean
          key_actives?: string[] | null
          key_benefit?: string | null
          key_ingredients?: string[] | null
          metadata?: Json | null
          mpn?: string | null
          name: string
          pharmacist_note?: string | null
          price?: number
          primary_concern?: Database["public"]["Enums"]["skin_concern"]
          primary_icon_tag?: string | null
          primary_pillar?: string | null
          product_highlights?: string[] | null
          product_type?: string | null
          regimen_step?: Database["public"]["Enums"]["regimen_step"]
          secondary_category?: string | null
          secondary_icon_tag?: string | null
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
          sku?: string | null
          stock?: number
          tags?: string[] | null
          texture_profile?: string | null
          title?: string | null
          updated_at?: string
          variant_title?: string | null
          vendor?: string | null
        }
        Update: {
          ai_persona_lead?: Database["public"]["Enums"]["persona_type"] | null
          asper_category?: string | null
          availability_status?: string | null
          available?: boolean
          bestseller_rank?: number | null
          brand?: string | null
          category?: string | null
          clinical_badge?: string | null
          clinical_concerns?: string[] | null
          compare_at_price?: number | null
          concern_tags?: string[] | null
          condition?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          dr_sami_approved?: boolean | null
          gold_stitch_tier?: boolean
          gtin?: string | null
          handle?: string | null
          hex_swatch?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          inventory_total?: number
          is_bestseller?: boolean
          is_hero?: boolean
          key_actives?: string[] | null
          key_benefit?: string | null
          key_ingredients?: string[] | null
          metadata?: Json | null
          mpn?: string | null
          name?: string
          pharmacist_note?: string | null
          price?: number
          primary_concern?: Database["public"]["Enums"]["skin_concern"]
          primary_icon_tag?: string | null
          primary_pillar?: string | null
          product_highlights?: string[] | null
          product_type?: string | null
          regimen_step?: Database["public"]["Enums"]["regimen_step"]
          secondary_category?: string | null
          secondary_icon_tag?: string | null
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
          sku?: string | null
          stock?: number
          tags?: string[] | null
          texture_profile?: string | null
          title?: string | null
          updated_at?: string
          variant_title?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          display_name: string | null
          phone: string | null
          tags: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          display_name?: string | null
          phone?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          display_name?: string | null
          phone?: string | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prompt_audit_logs: {
        Row: {
          created_at: string
          experiment_key: string | null
          id: number
          locale: Database["public"]["Enums"]["locale_code"]
          notes: Json | null
          persona: Database["public"]["Enums"]["persona_type"]
          prompt_id: string | null
          session_id: string | null
          user_id: string | null
          variant: string | null
        }
        Insert: {
          created_at?: string
          experiment_key?: string | null
          id?: never
          locale: Database["public"]["Enums"]["locale_code"]
          notes?: Json | null
          persona: Database["public"]["Enums"]["persona_type"]
          prompt_id?: string | null
          session_id?: string | null
          user_id?: string | null
          variant?: string | null
        }
        Update: {
          created_at?: string
          experiment_key?: string | null
          id?: never
          locale?: Database["public"]["Enums"]["locale_code"]
          notes?: Json | null
          persona?: Database["public"]["Enums"]["persona_type"]
          prompt_id?: string | null
          session_id?: string | null
          user_id?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_audit_logs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_experiments: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key: string
          locale: Database["public"]["Enums"]["locale_code"]
          persona: Database["public"]["Enums"]["persona_type"]
          split_a: number
          variant_a_prompt_id: string | null
          variant_b_prompt_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          locale?: Database["public"]["Enums"]["locale_code"]
          persona: Database["public"]["Enums"]["persona_type"]
          split_a?: number
          variant_a_prompt_id?: string | null
          variant_b_prompt_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          locale?: Database["public"]["Enums"]["locale_code"]
          persona?: Database["public"]["Enums"]["persona_type"]
          split_a?: number
          variant_a_prompt_id?: string | null
          variant_b_prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_experiments_variant_a_prompt_id_fkey"
            columns: ["variant_a_prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_experiments_variant_b_prompt_id_fkey"
            columns: ["variant_b_prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          body: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          locale: Database["public"]["Enums"]["locale_code"]
          persona: Database["public"]["Enums"]["persona_type"]
          slug: string
          title: string
          version: number | null
        }
        Insert: {
          body: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          locale?: Database["public"]["Enums"]["locale_code"]
          persona: Database["public"]["Enums"]["persona_type"]
          slug: string
          title: string
          version?: number | null
        }
        Update: {
          body?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          locale?: Database["public"]["Enums"]["locale_code"]
          persona?: Database["public"]["Enums"]["persona_type"]
          slug?: string
          title?: string
          version?: number | null
        }
        Relationships: []
      }
      quiz_funnel_events: {
        Row: {
          created_at: string
          id: number
          metadata: Json
          step: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          metadata?: Json
          step: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          metadata?: Json
          step?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      regimen_plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      regimen_steps: {
        Row: {
          created_at: string
          id: string
          instruction: string | null
          plan_id: string
          product_id: string | null
          step_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          instruction?: string | null
          plan_id: string
          product_id?: string | null
          step_number: number
        }
        Update: {
          created_at?: string
          id?: string
          instruction?: string | null
          plan_id?: string
          product_id?: string | null
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "regimen_steps_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "regimen_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regimen_steps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_tray_products_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regimen_steps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_subscribers: {
        Row: {
          email: string
          id: number
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: number
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: number
          subscribed_at?: string | null
        }
        Relationships: []
      }
      "Shopify pub": {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      table_name: {
        Row: {
          data: Json
          id: number
          inserted_at: string
          name: string
          updated_at: string
        }
        Insert: {
          data: Json
          id?: number
          inserted_at?: string
          name: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: number
          inserted_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      telemetry_events: {
        Row: {
          correlation_id: string | null
          event: string
          id: number
          occurred_at: string
          payload: Json
          source: string
          user_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          event: string
          id?: never
          occurred_at?: string
          payload?: Json
          source: string
          user_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          event?: string
          id?: never
          occurred_at?: string
          payload?: Json
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ui_check_artifacts: {
        Row: {
          created_at: string
          id: string
          kind: string
          meta: Json
          run_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          meta?: Json
          run_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          meta?: Json
          run_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_check_artifacts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ui_check_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_check_runs: {
        Row: {
          check_id: string
          created_at: string
          diff_url: string | null
          id: string
        }
        Insert: {
          check_id: string
          created_at?: string
          diff_url?: string | null
          id?: string
        }
        Update: {
          check_id?: string
          created_at?: string
          diff_url?: string | null
          id?: string
        }
        Relationships: []
      }
      ui_checks: {
        Row: {
          created_at: string
          device: string
          id: string
          is_active: boolean
          name: string
          page_url: string
          selector: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          device?: string
          id?: string
          is_active?: boolean
          name: string
          page_url: string
          selector: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          device?: string
          id?: string
          is_active?: boolean
          name?: string
          page_url?: string
          selector?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          skin_concerns: string[] | null
          skin_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          skin_concerns?: string[] | null
          skin_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          skin_concerns?: string[] | null
          skin_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_regimen_choices: {
        Row: {
          created_at: string
          plan_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          plan_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_regimen_choices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "regimen_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tenants: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_audit_logs: {
        Row: {
          concern_detected: string | null
          error_message: string | null
          event_type: string
          id: string
          provider: string
          received_at: string
          response_ms: number | null
          status: string
        }
        Insert: {
          concern_detected?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          provider: string
          received_at?: string
          response_ms?: number | null
          status: string
        }
        Update: {
          concern_detected?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          provider?: string
          received_at?: string
          response_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          shopify_product_handle: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          shopify_product_handle: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          shopify_product_handle?: string
          user_id?: string
        }
        Relationships: []
      }
      wrappers_fdw_stats: {
        Row: {
          bytes_in: number | null
          bytes_out: number | null
          create_times: number | null
          created_at: string
          fdw_name: string
          metadata: Json | null
          rows_in: number | null
          rows_out: number | null
          updated_at: string
        }
        Insert: {
          bytes_in?: number | null
          bytes_out?: number | null
          create_times?: number | null
          created_at?: string
          fdw_name: string
          metadata?: Json | null
          rows_in?: number | null
          rows_out?: number | null
          updated_at?: string
        }
        Update: {
          bytes_in?: number | null
          bytes_out?: number | null
          create_times?: number | null
          created_at?: string
          fdw_name?: string
          metadata?: Json | null
          rows_in?: number | null
          rows_out?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      digital_tray_products_v: {
        Row: {
          bestseller_rank: number | null
          created_at: string | null
          id: string | null
          inventory_total: number | null
          is_bestseller: boolean | null
          is_hero: boolean | null
          primary_concern: Database["public"]["Enums"]["skin_concern"] | null
          regimen_step: Database["public"]["Enums"]["regimen_step"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          bestseller_rank?: number | null
          created_at?: string | null
          id?: string | null
          inventory_total?: number | null
          is_bestseller?: boolean | null
          is_hero?: boolean | null
          primary_concern?: Database["public"]["Enums"]["skin_concern"] | null
          regimen_step?: Database["public"]["Enums"]["regimen_step"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          bestseller_rank?: number | null
          created_at?: string | null
          id?: string | null
          inventory_total?: number | null
          is_bestseller?: boolean | null
          is_hero?: boolean | null
          primary_concern?: Database["public"]["Enums"]["skin_concern"] | null
          regimen_step?: Database["public"]["Enums"]["regimen_step"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews_public: {
        Row: {
          age_range: string | null
          body: string | null
          created_at: string | null
          helpful_count: number | null
          id: string | null
          primary_concern: string | null
          product_id: string | null
          rating: number | null
          skin_type: string | null
          title: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          age_range?: string | null
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string | null
          primary_concern?: string | null
          product_id?: string | null
          rating?: number | null
          skin_type?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          age_range?: string | null
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string | null
          primary_concern?: string | null
          product_id?: string | null
          rating?: number | null
          skin_type?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "digital_tray_products_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      airtable_fdw_handler: { Args: never; Returns: unknown }
      airtable_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      airtable_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      apply_concierge_brain_rules: {
        Args: { in_brain_id: string; in_concern: string; in_context?: Json }
        Returns: Json
      }
      auth0_fdw_handler: { Args: never; Returns: unknown }
      auth0_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      auth0_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      big_query_fdw_handler: { Args: never; Returns: unknown }
      big_query_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      big_query_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      build_digital_tray: { Args: { in_concern: string }; Returns: Json }
      bulk_delete_purged: { Args: { p_ids: string[] }; Returns: number }
      bulk_restore_purged: { Args: { p_ids: string[] }; Returns: number }
      click_house_fdw_handler: { Args: never; Returns: unknown }
      click_house_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      click_house_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      cognito_fdw_handler: { Args: never; Returns: unknown }
      cognito_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      cognito_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      convert_lead: {
        Args: { lead_id: string; p_order_id: string; p_order_value: number }
        Returns: undefined
      }
      cron_cleanup: {
        Args: {
          action?: string
          archive_table?: string
          older_than_days: number
          src_table: string
          timestamp_column: string
        }
        Returns: Json
      }
      duckdb_fdw_handler: { Args: never; Returns: unknown }
      duckdb_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      duckdb_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      enforce_rate_limit: {
        Args: { p_key: string; p_limit: number }
        Returns: boolean
      }
      firebase_fdw_handler: { Args: never; Returns: unknown }
      firebase_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      firebase_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      fq: { Args: { rel_name: string; rel_schema: string }; Returns: string }
      function_name: { Args: never; Returns: undefined }
      generate_prescription: { Args: { payload: Json }; Returns: Json }
      get_leads_for_followup: {
        Args: { limit_n?: number }
        Returns: {
          chat_summary: string | null
          created_at: string | null
          email: string | null
          follow_up_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          order_value: number | null
          phone: string | null
          skin_concern: string | null
          source: string
          status: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "customer_leads"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_product_reviews: {
        Args: { p_product_id: string }
        Returns: {
          age_range: string
          body: string
          created_at: string
          helpful_count: number
          id: string
          primary_concern: string
          product_id: string
          rating: number
          skin_type: string
          title: string
          verified_purchase: boolean
        }[]
      }
      get_telegram_token: { Args: never; Returns: string }
      get_tray_by_concern: {
        Args: { concern_tag: Database["public"]["Enums"]["skin_concern"] }
        Returns: Json
      }
      get_tray_for_user: { Args: { p_user_id: string }; Returns: Json }
      get_tray_with_concierge: {
        Args: { concierge_name: string; free_text: string; user_id?: string }
        Returns: Json
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { required_role: string; user_id: string }; Returns: boolean }
      hello_world_fdw_handler: { Args: never; Returns: unknown }
      hello_world_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      hello_world_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      iceberg_fdw_handler: { Args: never; Returns: unknown }
      iceberg_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      iceberg_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      logflare_fdw_handler: { Args: never; Returns: unknown }
      logflare_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      logflare_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      mark_lead_contacted: {
        Args: { lead_id: string; note?: string }
        Returns: undefined
      }
      metadata_filter: { Args: { _left: Json; _right: Json }; Returns: boolean }
      mssql_fdw_handler: { Args: never; Returns: unknown }
      mssql_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      mssql_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      normalize_concern: { Args: { input_text: string }; Returns: string }
      product_usage_hint: {
        Args: { regimen_step: string; title: string }
        Returns: Json
      }
      redis_fdw_handler: { Args: never; Returns: unknown }
      redis_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      redis_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      requeue_failed_skus:
        | {
            Args: { p_limit?: number; p_run_id?: string; p_stage?: string }
            Returns: {
              shopify_product_id: string
              sku: string
              stage: string
            }[]
          }
        | {
            Args: { p_limit?: number; p_run_id?: string; p_stage?: string }
            Returns: {
              shopify_product_id: string
              sku: string
              stage: string
            }[]
          }
      resolve_concierge_brain: {
        Args: { brain_name: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority: number
        }[]
      }
      s3_fdw_handler: { Args: never; Returns: unknown }
      s3_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      s3_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      s3_vectors_fdw_handler: { Args: never; Returns: unknown }
      s3_vectors_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      s3_vectors_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      s3vec_distance: { Args: { s3vec: unknown }; Returns: number }
      s3vec_in: { Args: { input: unknown }; Returns: unknown }
      s3vec_knn: { Args: { _left: unknown; _right: unknown }; Returns: boolean }
      s3vec_out: { Args: { input: unknown }; Returns: unknown }
      search_products_for_ai: {
        Args: { match_count?: number; search_term: string }
        Returns: {
          handle: string
          id: string
          image_url: string
          price: number
          primary_concern: string
          regimen_step: string
          similarity_score: number
          title: string
        }[]
      }
      stripe_fdw_handler: { Args: never; Returns: unknown }
      stripe_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      stripe_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      suggest_addon_for_freeshipping: {
        Args: { cart_total: number; concern: string; target?: number }
        Returns: Json
      }
      sync_tray_product: {
        Args: {
          p_bestseller_rank: number
          p_concern: Database["public"]["Enums"]["skin_concern"]
          p_id: string
          p_inventory: number
          p_is_bestseller: boolean
          p_is_hero: boolean
          p_step: Database["public"]["Enums"]["regimen_step"]
          p_title: string
        }
        Returns: undefined
      }
      upsert_concierge_profile:
        | {
            Args: {
              p_recommended_routine: Json
              p_skin_concern: string
              p_skin_type: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_recommended_routine: Json
              p_skin_concern: string
              p_skin_type: string
              p_user_id: string
            }
            Returns: undefined
          }
      wasm_fdw_handler: { Args: never; Returns: unknown }
      wasm_fdw_meta: {
        Args: never
        Returns: {
          author: string
          name: string
          version: string
          website: string
        }[]
      }
      wasm_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      locale_code: "en" | "ar"
      persona_type: "dr_sami" | "ms_zain"
      regimen_step:
        | "Step_1_Cleanser"
        | "Step_2_Treatment"
        | "Step_3_Protection"
        | "Step_1"
        | "Step_2"
        | "Step_3"
      skin_concern:
        | "Concern_Acne"
        | "Concern_Hydration"
        | "Concern_Aging"
        | "Concern_Sensitivity"
        | "Concern_Pigmentation"
        | "Concern_Redness"
        | "Concern_Oiliness"
        | "Concern_Brightening"
        | "Concern_SunProtection"
        | "Concern_DarkCircles"
        | "Concern_AntiAging"
        | "Concern_Dryness"
      WEE: "public"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
      locale_code: ["en", "ar"],
      persona_type: ["dr_sami", "ms_zain"],
      regimen_step: [
        "Step_1_Cleanser",
        "Step_2_Treatment",
        "Step_3_Protection",
        "Step_1",
        "Step_2",
        "Step_3",
      ],
      skin_concern: [
        "Concern_Acne",
        "Concern_Hydration",
        "Concern_Aging",
        "Concern_Sensitivity",
        "Concern_Pigmentation",
        "Concern_Redness",
        "Concern_Oiliness",
        "Concern_Brightening",
        "Concern_SunProtection",
        "Concern_DarkCircles",
        "Concern_AntiAging",
        "Concern_Dryness",
      ],
      WEE: ["public"],
    },
  },
} as const
