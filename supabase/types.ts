export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      blacklisted_users: {
        Row: {
          id: string;
          reasoning: string | null;
          timestamp: string | null;
          username: string;
        };
        Insert: {
          id?: string;
          reasoning?: string | null;
          timestamp?: string | null;
          username: string;
        };
        Update: {
          id?: string;
          reasoning?: string | null;
          timestamp?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          content: string;
          created_at: string;
          excerpt: string | null;
          id: string;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      character_factions: {
        Row: {
          character_id: string;
          created_at: string | null;
          faction_id: string;
          id: string;
          is_current: boolean | null;
          join_date: string | null;
          leave_date: string | null;
          notes: string | null;
          rank: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          character_id: string;
          created_at?: string | null;
          faction_id: string;
          id?: string;
          is_current?: boolean | null;
          join_date?: string | null;
          leave_date?: string | null;
          notes?: string | null;
          rank?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          character_id?: string;
          created_at?: string | null;
          faction_id?: string;
          id?: string;
          is_current?: boolean | null;
          join_date?: string | null;
          leave_date?: string | null;
          notes?: string | null;
          rank?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "character_factions_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_factions_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_factions_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
        ];
      };
      character_gallery: {
        Row: {
          artist_name: string | null;
          artist_url: string | null;
          character_id: string;
          commission_date: string | null;
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          display_order: number | null;
          id: string;
          image_url: string;
          is_featured: boolean | null;
          tags: string[] | null;
          thumbnail_url: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          artist_name?: string | null;
          artist_url?: string | null;
          character_id: string;
          commission_date?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          image_url: string;
          is_featured?: boolean | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          artist_name?: string | null;
          artist_url?: string | null;
          character_id?: string;
          commission_date?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string;
          is_featured?: boolean | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "character_gallery_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_gallery_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      character_locations: {
        Row: {
          association_type: string | null;
          character_id: string;
          created_at: string | null;
          id: string;
          is_current: boolean | null;
          location_id: string;
          notes: string | null;
          time_period: string | null;
          updated_at: string | null;
        };
        Insert: {
          association_type?: string | null;
          character_id: string;
          created_at?: string | null;
          id?: string;
          is_current?: boolean | null;
          location_id: string;
          notes?: string | null;
          time_period?: string | null;
          updated_at?: string | null;
        };
        Update: {
          association_type?: string | null;
          character_id?: string;
          created_at?: string | null;
          id?: string;
          is_current?: boolean | null;
          location_id?: string;
          notes?: string | null;
          time_period?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "character_locations_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_locations_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_locations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      character_outfits: {
        Row: {
          character_id: string;
          color_palette: string | null;
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          display_order: number | null;
          id: string;
          image_url: string | null;
          is_default: boolean | null;
          name: string;
          notes: string | null;
          outfit_type_id: string | null;
          reference_images: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          character_id: string;
          color_palette?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string | null;
          is_default?: boolean | null;
          name: string;
          notes?: string | null;
          outfit_type_id?: string | null;
          reference_images?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          character_id?: string;
          color_palette?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string | null;
          is_default?: boolean | null;
          name?: string;
          notes?: string | null;
          outfit_type_id?: string | null;
          reference_images?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "character_outfits_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_outfits_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_outfits_outfit_type_id_fkey";
            columns: ["outfit_type_id"];
            isOneToOne: false;
            referencedRelation: "outfit_types";
            referencedColumns: ["id"];
          },
        ];
      };
      character_relationships: {
        Row: {
          character_a_id: string;
          character_b_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          is_mutual: boolean | null;
          relationship_type_id: string;
          updated_at: string | null;
        };
        Insert: {
          character_a_id: string;
          character_b_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_mutual?: boolean | null;
          relationship_type_id: string;
          updated_at?: string | null;
        };
        Update: {
          character_a_id?: string;
          character_b_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_mutual?: boolean | null;
          relationship_type_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "character_relationships_character_a_id_fkey";
            columns: ["character_a_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_relationships_character_a_id_fkey";
            columns: ["character_a_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_relationships_character_b_id_fkey";
            columns: ["character_b_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_relationships_character_b_id_fkey";
            columns: ["character_b_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_relationships_relationship_type_id_fkey";
            columns: ["relationship_type_id"];
            isOneToOne: false;
            referencedRelation: "relationship_types";
            referencedColumns: ["id"];
          },
        ];
      };
      character_worlds: {
        Row: {
          character_id: string;
          created_at: string | null;
          id: string;
          world_id: string;
        };
        Insert: {
          character_id: string;
          created_at?: string | null;
          id?: string;
          world_id: string;
        };
        Update: {
          character_id?: string;
          created_at?: string | null;
          id?: string;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "character_worlds_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_worlds_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_worlds_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      characters: {
        Row: {
          abilities: string | null;
          age: number | null;
          age_description: string | null;
          backstory: string | null;
          banner_image: string | null;
          build: string | null;
          color_scheme: string | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          dislikes: string | null;
          distinguishing_features: string | null;
          eye_color: string | null;
          fears: string | null;
          gender: string | null;
          goals: string | null;
          hair_color: string | null;
          height: string | null;
          id: string;
          like_count: number | null;
          likes: string | null;
          lore: string | null;
          name: string;
          nickname: string | null;
          occupation: string | null;
          personality_summary: string | null;
          profile_image: string | null;
          pronouns: string | null;
          skills: string | null;
          skin_tone: string | null;
          slug: string;
          species: string | null;
          status: Database["public"]["Enums"]["character_status"] | null;
          strengths: string | null;
          title: string | null;
          updated_at: string | null;
          view_count: number | null;
          weaknesses: string | null;
          weight: string | null;
        };
        Insert: {
          abilities?: string | null;
          age?: number | null;
          age_description?: string | null;
          backstory?: string | null;
          banner_image?: string | null;
          build?: string | null;
          color_scheme?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          dislikes?: string | null;
          distinguishing_features?: string | null;
          eye_color?: string | null;
          fears?: string | null;
          gender?: string | null;
          goals?: string | null;
          hair_color?: string | null;
          height?: string | null;
          id?: string;
          like_count?: number | null;
          likes?: string | null;
          lore?: string | null;
          name: string;
          nickname?: string | null;
          occupation?: string | null;
          personality_summary?: string | null;
          profile_image?: string | null;
          pronouns?: string | null;
          skills?: string | null;
          skin_tone?: string | null;
          slug: string;
          species?: string | null;
          status?: Database["public"]["Enums"]["character_status"] | null;
          strengths?: string | null;
          title?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          weaknesses?: string | null;
          weight?: string | null;
        };
        Update: {
          abilities?: string | null;
          age?: number | null;
          age_description?: string | null;
          backstory?: string | null;
          banner_image?: string | null;
          build?: string | null;
          color_scheme?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          dislikes?: string | null;
          distinguishing_features?: string | null;
          eye_color?: string | null;
          fears?: string | null;
          gender?: string | null;
          goals?: string | null;
          hair_color?: string | null;
          height?: string | null;
          id?: string;
          like_count?: number | null;
          likes?: string | null;
          lore?: string | null;
          name?: string;
          nickname?: string | null;
          occupation?: string | null;
          personality_summary?: string | null;
          profile_image?: string | null;
          pronouns?: string | null;
          skills?: string | null;
          skin_tone?: string | null;
          slug?: string;
          species?: string | null;
          status?: Database["public"]["Enums"]["character_status"] | null;
          strengths?: string | null;
          title?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
          weaknesses?: string | null;
          weight?: string | null;
        };
        Relationships: [];
      };
      entity_tags: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          tag_id: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entity_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      event_factions: {
        Row: {
          created_at: string | null;
          description: string | null;
          event_id: string;
          faction_id: string;
          id: string;
          role: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          event_id: string;
          faction_id: string;
          id?: string;
          role?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          event_id?: string;
          faction_id?: string;
          id?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_factions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_factions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_factions_faction_id_fkey";
            columns: ["faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
        ];
      };
      event_participants: {
        Row: {
          character_id: string;
          created_at: string | null;
          description: string | null;
          event_id: string;
          id: string;
          role: string | null;
        };
        Insert: {
          character_id: string;
          created_at?: string | null;
          description?: string | null;
          event_id: string;
          id?: string;
          role?: string | null;
        };
        Update: {
          character_id?: string;
          created_at?: string | null;
          description?: string | null;
          event_id?: string;
          id?: string;
          role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_participants_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "character_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_participants_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_participants_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "event_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_participants_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      event_types: {
        Row: {
          color: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_default: boolean | null;
          name: string;
          slug: string;
          story_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_default?: boolean | null;
          name: string;
          slug: string;
          story_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_default?: boolean | null;
          name?: string;
          slug?: string;
          story_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_types_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_types_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "story_hierarchy";
            referencedColumns: ["story_id"];
          },
        ];
      };
      events: {
        Row: {
          casualties: string | null;
          color: string | null;
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          date: string | null;
          date_year: number | null;
          deleted_at: string | null;
          description: string | null;
          duration: string | null;
          event_type_id: string | null;
          id: string;
          image_url: string | null;
          location_id: string | null;
          name: string;
          outcome: string | null;
          significance: string | null;
          slug: string;
          summary: string | null;
          timeline_id: string | null;
          updated_at: string | null;
          world_id: string;
        };
        Insert: {
          casualties?: string | null;
          color?: string | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          date_year?: number | null;
          deleted_at?: string | null;
          description?: string | null;
          duration?: string | null;
          event_type_id?: string | null;
          id?: string;
          image_url?: string | null;
          location_id?: string | null;
          name: string;
          outcome?: string | null;
          significance?: string | null;
          slug: string;
          summary?: string | null;
          timeline_id?: string | null;
          updated_at?: string | null;
          world_id: string;
        };
        Update: {
          casualties?: string | null;
          color?: string | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          date_year?: number | null;
          deleted_at?: string | null;
          description?: string | null;
          duration?: string | null;
          event_type_id?: string | null;
          id?: string;
          image_url?: string | null;
          location_id?: string | null;
          name?: string;
          outcome?: string | null;
          significance?: string | null;
          slug?: string;
          summary?: string | null;
          timeline_id?: string | null;
          updated_at?: string | null;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_event_type_id_fkey";
            columns: ["event_type_id"];
            isOneToOne: false;
            referencedRelation: "event_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_timeline_id_fkey";
            columns: ["timeline_id"];
            isOneToOne: false;
            referencedRelation: "timelines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      factions: {
        Row: {
          banner_image: string | null;
          color_scheme: string | null;
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          faction_type: string | null;
          founding_date: string | null;
          id: string;
          ideology: string | null;
          logo_url: string | null;
          member_count: number | null;
          name: string;
          parent_faction_id: string | null;
          power_level: string | null;
          primary_goal: string | null;
          reputation: string | null;
          slug: string;
          status: string | null;
          summary: string | null;
          updated_at: string | null;
          world_id: string | null;
        };
        Insert: {
          banner_image?: string | null;
          color_scheme?: string | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          faction_type?: string | null;
          founding_date?: string | null;
          id?: string;
          ideology?: string | null;
          logo_url?: string | null;
          member_count?: number | null;
          name: string;
          parent_faction_id?: string | null;
          power_level?: string | null;
          primary_goal?: string | null;
          reputation?: string | null;
          slug: string;
          status?: string | null;
          summary?: string | null;
          updated_at?: string | null;
          world_id?: string | null;
        };
        Update: {
          banner_image?: string | null;
          color_scheme?: string | null;
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          faction_type?: string | null;
          founding_date?: string | null;
          id?: string;
          ideology?: string | null;
          logo_url?: string | null;
          member_count?: number | null;
          name?: string;
          parent_faction_id?: string | null;
          power_level?: string | null;
          primary_goal?: string | null;
          reputation?: string | null;
          slug?: string;
          status?: string | null;
          summary?: string | null;
          updated_at?: string | null;
          world_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "factions_parent_faction_id_fkey";
            columns: ["parent_faction_id"];
            isOneToOne: false;
            referencedRelation: "factions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "factions_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          banner_image: string | null;
          climate: string | null;
          content: string | null;
          coordinate_x: number | null;
          coordinate_y: number | null;
          coordinate_z: number | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          location_type: string | null;
          map_image: string | null;
          name: string;
          parent_location_id: string | null;
          population: number | null;
          slug: string;
          summary: string | null;
          updated_at: string | null;
          world_id: string;
        };
        Insert: {
          banner_image?: string | null;
          climate?: string | null;
          content?: string | null;
          coordinate_x?: number | null;
          coordinate_y?: number | null;
          coordinate_z?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          location_type?: string | null;
          map_image?: string | null;
          name: string;
          parent_location_id?: string | null;
          population?: number | null;
          slug: string;
          summary?: string | null;
          updated_at?: string | null;
          world_id: string;
        };
        Update: {
          banner_image?: string | null;
          climate?: string | null;
          content?: string | null;
          coordinate_x?: number | null;
          coordinate_y?: number | null;
          coordinate_z?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          location_type?: string | null;
          map_image?: string | null;
          name?: string;
          parent_location_id?: string | null;
          population?: number | null;
          slug?: string;
          summary?: string | null;
          updated_at?: string | null;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_parent_location_id_fkey";
            columns: ["parent_location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "locations_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          artist: string | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          duration: number | null;
          file_size: number | null;
          file_url: string;
          folder: string | null;
          height: number | null;
          id: string;
          license: string | null;
          media_type: Database["public"]["Enums"]["media_type"];
          mime_type: string | null;
          name: string;
          source: string | null;
          tags: string[] | null;
          thumbnail_url: string | null;
          updated_at: string | null;
          width: number | null;
        };
        Insert: {
          artist?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          duration?: number | null;
          file_size?: number | null;
          file_url: string;
          folder?: string | null;
          height?: number | null;
          id?: string;
          license?: string | null;
          media_type: Database["public"]["Enums"]["media_type"];
          mime_type?: string | null;
          name: string;
          source?: string | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          updated_at?: string | null;
          width?: number | null;
        };
        Update: {
          artist?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          duration?: number | null;
          file_size?: number | null;
          file_url?: string;
          folder?: string | null;
          height?: number | null;
          id?: string;
          license?: string | null;
          media_type?: Database["public"]["Enums"]["media_type"];
          mime_type?: string | null;
          name?: string;
          source?: string | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          updated_at?: string | null;
          width?: number | null;
        };
        Relationships: [];
      };
      moodboards: {
        Row: {
          color_palette: string[] | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          images: string[] | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          color_palette?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          images?: string[] | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          color_palette?: string[] | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          images?: string[] | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      outfit_types: {
        Row: {
          color: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_default: boolean | null;
          name: string;
          slug: string;
          story_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_default?: boolean | null;
          name: string;
          slug: string;
          story_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_default?: boolean | null;
          name?: string;
          slug?: string;
          story_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "outfit_types_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outfit_types_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "story_hierarchy";
            referencedColumns: ["story_id"];
          },
        ];
      };
      relationship_types: {
        Row: {
          category: string | null;
          color: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_default: boolean | null;
          is_mutual: boolean | null;
          name: string;
          reverse_name: string | null;
          slug: string;
          story_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_default?: boolean | null;
          is_mutual?: boolean | null;
          name: string;
          reverse_name?: string | null;
          slug: string;
          story_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_default?: boolean | null;
          is_mutual?: boolean | null;
          name?: string;
          reverse_name?: string | null;
          slug?: string;
          story_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "relationship_types_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "relationship_types_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "story_hierarchy";
            referencedColumns: ["story_id"];
          },
        ];
      };
      resource_urls: {
        Row: {
          created_at: string | null;
          expired_at: string;
          resource_path: string;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          expired_at: string;
          resource_path: string;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          expired_at?: string;
          resource_path?: string;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          is_published: boolean | null;
          like_count: number | null;
          slug: string;
          summary: string | null;
          theme_background_color: string | null;
          theme_background_image: string | null;
          theme_custom_css: string | null;
          theme_primary_color: string | null;
          theme_secondary_color: string | null;
          theme_text_color: string | null;
          title: string;
          updated_at: string | null;
          updated_by: string | null;
          view_count: number | null;
          visibility: Database["public"]["Enums"]["visibility_level"] | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_published?: boolean | null;
          like_count?: number | null;
          slug: string;
          summary?: string | null;
          theme_background_color?: string | null;
          theme_background_image?: string | null;
          theme_custom_css?: string | null;
          theme_primary_color?: string | null;
          theme_secondary_color?: string | null;
          theme_text_color?: string | null;
          title: string;
          updated_at?: string | null;
          updated_by?: string | null;
          view_count?: number | null;
          visibility?: Database["public"]["Enums"]["visibility_level"] | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          is_published?: boolean | null;
          like_count?: number | null;
          slug?: string;
          summary?: string | null;
          theme_background_color?: string | null;
          theme_background_image?: string | null;
          theme_custom_css?: string | null;
          theme_primary_color?: string | null;
          theme_secondary_color?: string | null;
          theme_text_color?: string | null;
          title?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          view_count?: number | null;
          visibility?: Database["public"]["Enums"]["visibility_level"] | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          category: string | null;
          color: string | null;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
          slug: string;
          use_count: number | null;
        };
        Insert: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          slug: string;
          use_count?: number | null;
        };
        Update: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          use_count?: number | null;
        };
        Relationships: [];
      };
      timelines: {
        Row: {
          color: string | null;
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          end_date: string | null;
          era_name: string | null;
          icon: string | null;
          id: string;
          name: string;
          start_date: string | null;
          updated_at: string | null;
          world_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          era_name?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          start_date?: string | null;
          updated_at?: string | null;
          world_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          era_name?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          start_date?: string | null;
          updated_at?: string | null;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timelines_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      worlds: {
        Row: {
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          name: string;
          population: number | null;
          size: string | null;
          slug: string;
          story_id: string;
          summary: string | null;
          theme_background_image: string | null;
          theme_map_image: string | null;
          theme_primary_color: string | null;
          theme_secondary_color: string | null;
          updated_at: string | null;
          world_type: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          population?: number | null;
          size?: string | null;
          slug: string;
          story_id: string;
          summary?: string | null;
          theme_background_image?: string | null;
          theme_map_image?: string | null;
          theme_primary_color?: string | null;
          theme_secondary_color?: string | null;
          updated_at?: string | null;
          world_type?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          population?: number | null;
          size?: string | null;
          slug?: string;
          story_id?: string;
          summary?: string | null;
          theme_background_image?: string | null;
          theme_map_image?: string | null;
          theme_primary_color?: string | null;
          theme_secondary_color?: string | null;
          updated_at?: string | null;
          world_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "worlds_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "worlds_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "story_hierarchy";
            referencedColumns: ["story_id"];
          },
        ];
      };
    };
    Views: {
      character_details: {
        Row: {
          abilities: string | null;
          age: number | null;
          age_description: string | null;
          backstory: string | null;
          banner_image: string | null;
          build: string | null;
          color_scheme: string | null;
          created_at: string | null;
          created_by: string | null;
          deleted_at: string | null;
          dislikes: string | null;
          distinguishing_features: string | null;
          eye_color: string | null;
          factions: Json | null;
          fears: string | null;
          gender: string | null;
          goals: string | null;
          hair_color: string | null;
          height: string | null;
          id: string | null;
          like_count: number | null;
          likes: string | null;
          lore: string | null;
          name: string | null;
          nickname: string | null;
          occupation: string | null;
          personality_summary: string | null;
          profile_image: string | null;
          pronouns: string | null;
          skills: string | null;
          skin_tone: string | null;
          slug: string | null;
          species: string | null;
          status: Database["public"]["Enums"]["character_status"] | null;
          strengths: string | null;
          title: string | null;
          updated_at: string | null;
          view_count: number | null;
          weaknesses: string | null;
          weight: string | null;
          world_ids: Json | null;
        };
        Relationships: [];
      };
      event_details: {
        Row: {
          casualties: string | null;
          color: string | null;
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          date: string | null;
          date_year: number | null;
          deleted_at: string | null;
          description: string | null;
          duration: string | null;
          event_type_id: string | null;
          id: string | null;
          image_url: string | null;
          involved_factions: Json | null;
          location_id: string | null;
          location_name: string | null;
          name: string | null;
          outcome: string | null;
          participants: Json | null;
          significance: string | null;
          slug: string | null;
          summary: string | null;
          timeline_id: string | null;
          updated_at: string | null;
          world_id: string | null;
          world_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_event_type_id_fkey";
            columns: ["event_type_id"];
            isOneToOne: false;
            referencedRelation: "event_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_timeline_id_fkey";
            columns: ["timeline_id"];
            isOneToOne: false;
            referencedRelation: "timelines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          },
        ];
      };
      story_hierarchy: {
        Row: {
          is_published: boolean | null;
          story_id: string | null;
          story_slug: string | null;
          story_title: string | null;
          visibility: Database["public"]["Enums"]["visibility_level"] | null;
          worlds: Json | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_character_relationships: {
        Args: { character_uuid: string };
        Returns: {
          is_mutual: boolean;
          related_character_id: string;
          related_character_name: string;
          relationship_description: string;
          relationship_type_id: string;
          relationship_type_name: string;
        }[];
      };
      search_entities: {
        Args: { search_query: string };
        Returns: {
          entity_description: string;
          entity_id: string;
          entity_name: string;
          entity_type: string;
          rank: number;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      update_character_worlds: {
        Args: { p_character_id: string; p_world_ids: string[] };
        Returns: {
          message: string;
          success: boolean;
          updated_count: number;
        }[];
      };
    };
    Enums: {
      character_status:
        | "alive"
        | "deceased"
        | "unknown"
        | "missing"
        | "imprisoned";
      media_type:
        | "image"
        | "video"
        | "audio"
        | "document"
        | "model_3d"
        | "other";
      visibility_level: "public" | "unlisted" | "private";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      character_status: [
        "alive",
        "deceased",
        "unknown",
        "missing",
        "imprisoned",
      ],
      media_type: ["image", "video", "audio", "document", "model_3d", "other"],
      visibility_level: ["public", "unlisted", "private"],
    },
  },
} as const;
