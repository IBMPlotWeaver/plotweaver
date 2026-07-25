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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          content: string
          created_at: string | null
          id: string
          insight_type: string | null
          node_id: string | null
          status: string | null
          story_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          insight_type?: string | null
          node_id?: string | null
          status?: string | null
          story_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          insight_type?: string | null
          node_id?: string | null
          status?: string | null
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ai_insights_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'story_nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ai_insights_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      characters: {
        Row: {
          arc_stage: string | null
          created_at: string | null
          description: string | null
          goals: string[] | null
          id: string
          name: string
          secrets: string[] | null
          story_id: string | null
          traits: string[] | null
          updated_at: string | null
          voice_notes: string | null
        }
        Insert: {
          arc_stage?: string | null
          created_at?: string | null
          description?: string | null
          goals?: string[] | null
          id?: string
          name: string
          secrets?: string[] | null
          story_id?: string | null
          traits?: string[] | null
          updated_at?: string | null
          voice_notes?: string | null
        }
        Update: {
          arc_stage?: string | null
          created_at?: string | null
          description?: string | null
          goals?: string[] | null
          id?: string
          name?: string
          secrets?: string[] | null
          story_id?: string | null
          traits?: string[] | null
          updated_at?: string | null
          voice_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'characters_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      conflicts: {
        Row: {
          created_at: string | null
          id: string
          parties: string[] | null
          resolution_status: string | null
          stakes: string | null
          story_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parties?: string[] | null
          resolution_status?: string | null
          stakes?: string | null
          story_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parties?: string[] | null
          resolution_status?: string | null
          stakes?: string | null
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'conflicts_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          consequences: string | null
          created_at: string | null
          description: string
          id: string
          participants: string[] | null
          story_id: string
          timeline_position: number | null
          updated_at: string | null
        }
        Insert: {
          consequences?: string | null
          created_at?: string | null
          description: string
          id?: string
          participants?: string[] | null
          story_id: string
          timeline_position?: number | null
          updated_at?: string | null
        }
        Update: {
          consequences?: string | null
          created_at?: string | null
          description?: string
          id?: string
          participants?: string[] | null
          story_id?: string
          timeline_position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          id: string
          obstacles: string | null
          owning_character_id: string
          status: string | null
          story_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          obstacles?: string | null
          owning_character_id: string
          status?: string | null
          story_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          obstacles?: string | null
          owning_character_id?: string
          status?: string | null
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'goals_owning_character_id_fkey'
            columns: ['owning_character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'goals_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      locations: {
        Row: {
          connected_locations: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          story_id: string
          updated_at: string | null
        }
        Insert: {
          connected_locations?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          story_id: string
          updated_at?: string | null
        }
        Update: {
          connected_locations?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'locations_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      node_characters: {
        Row: {
          character_id: string
          node_id: string
        }
        Insert: {
          character_id: string
          node_id: string
        }
        Update: {
          character_id?: string
          node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'node_characters_character_id_fkey'
            columns: ['character_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'node_characters_node_id_fkey'
            columns: ['node_id']
            isOneToOne: false
            referencedRelation: 'story_nodes'
            referencedColumns: ['id']
          },
        ]
      }
      objects: {
        Row: {
          created_at: string | null
          current_location: string | null
          current_owner: string | null
          id: string
          name: string
          properties: Json | null
          significance: string | null
          story_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_location?: string | null
          current_owner?: string | null
          id?: string
          name: string
          properties?: Json | null
          significance?: string | null
          story_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_location?: string | null
          current_owner?: string | null
          id?: string
          name?: string
          properties?: Json | null
          significance?: string | null
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'objects_current_location_fkey'
            columns: ['current_location']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'objects_current_owner_fkey'
            columns: ['current_owner']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'objects_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          content: string
          created_at: string | null
          holder_id: string
          id: string
          known_by: string[] | null
          reveal_status: string | null
          story_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          holder_id: string
          id?: string
          known_by?: string[] | null
          reveal_status?: string | null
          story_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          holder_id?: string
          id?: string
          known_by?: string[] | null
          reveal_status?: string | null
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'secrets_holder_id_fkey'
            columns: ['holder_id']
            isOneToOne: false
            referencedRelation: 'characters'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'secrets_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      stories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'stories_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      story_edges: {
        Row: {
          created_at: string | null
          history: string | null
          id: string
          label: string | null
          source_node_id: string | null
          status: string | null
          story_id: string | null
          target_node_id: string | null
          trust_level: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          history?: string | null
          id?: string
          label?: string | null
          source_node_id?: string | null
          status?: string | null
          story_id?: string | null
          target_node_id?: string | null
          trust_level?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          history?: string | null
          id?: string
          label?: string | null
          source_node_id?: string | null
          status?: string | null
          story_id?: string | null
          target_node_id?: string | null
          trust_level?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'story_edges_source_node_id_fkey'
            columns: ['source_node_id']
            isOneToOne: false
            referencedRelation: 'story_nodes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'story_edges_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'story_edges_target_node_id_fkey'
            columns: ['target_node_id']
            isOneToOne: false
            referencedRelation: 'story_nodes'
            referencedColumns: ['id']
          },
        ]
      }
      story_nodes: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          position_x: number
          position_y: number
          story_id: string | null
          summary: string | null
          timeline_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          position_x?: number
          position_y?: number
          story_id?: string | null
          summary?: string | null
          timeline_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          position_x?: number
          position_y?: number
          story_id?: string | null
          summary?: string | null
          timeline_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'story_nodes_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      threads: {
        Row: {
          created_at: string | null
          description: string
          id: string
          last_referenced_event_id: string | null
          resolution_status: string | null
          story_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          last_referenced_event_id?: string | null
          resolution_status?: string | null
          story_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          last_referenced_event_id?: string | null
          resolution_status?: string | null
          story_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'threads_last_referenced_event_id_fkey'
            columns: ['last_referenced_event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'threads_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
        ]
      }
      world_rules: {
        Row: {
          created_at: string | null
          description: string
          id: string
          story_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          story_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          story_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'world_rules_story_id_fkey'
            columns: ['story_id']
            isOneToOne: false
            referencedRelation: 'stories'
            referencedColumns: ['id']
          },
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
