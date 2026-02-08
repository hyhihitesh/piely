export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            roadmap_edges: {
                Row: {
                    from_node_id: string | null
                    id: string
                    roadmap_id: string | null
                    to_node_id: string | null
                    type: string | null
                }
                Insert: {
                    from_node_id?: string | null
                    id?: string
                    roadmap_id?: string | null
                    to_node_id?: string | null
                    type?: string | null
                }
                Update: {
                    from_node_id?: string | null
                    id?: string
                    roadmap_id?: string | null
                    to_node_id?: string | null
                    type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "roadmap_edges_from_node_id_fkey"
                        columns: ["from_node_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_nodes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "roadmap_edges_roadmap_id_fkey"
                        columns: ["roadmap_id"]
                        isOneToOne: false
                        referencedRelation: "roadmaps"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "roadmap_edges_to_node_id_fkey"
                        columns: ["to_node_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_nodes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            roadmap_nodes: {
                Row: {
                    description: string | null
                    id: string
                    metadata: Json | null
                    order_index: number | null
                    roadmap_id: string | null
                    status: string | null
                    title: string
                    type: string | null
                }
                Insert: {
                    description?: string | null
                    id?: string
                    metadata?: Json | null
                    order_index?: number | null
                    roadmap_id?: string | null
                    status?: string | null
                    title: string
                    type?: string | null
                }
                Update: {
                    description?: string | null
                    id?: string
                    metadata?: Json | null
                    order_index?: number | null
                    roadmap_id?: string | null
                    status?: string | null
                    title?: string
                    type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "roadmap_nodes_roadmap_id_fkey"
                        columns: ["roadmap_id"]
                        isOneToOne: false
                        referencedRelation: "roadmaps"
                        referencedColumns: ["id"]
                    },
                ]
            }
            node_chat_messages: {
                Row: {
                    id: string
                    node_id: string
                    role: "user" | "assistant"
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    node_id: string
                    role: "user" | "assistant"
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    node_id?: string
                    role?: "user" | "assistant"
                    content?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "node_chat_messages_node_id_fkey"
                        columns: ["node_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_nodes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            node_attachments: {
                Row: {
                    id: string
                    node_id: string
                    file_url: string
                    file_name: string
                    file_type: string
                    file_size: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    node_id: string
                    file_url: string
                    file_name: string
                    file_type: string
                    file_size?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    node_id?: string
                    file_url?: string
                    file_name?: string
                    file_type?: string
                    file_size?: number | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "node_attachments_node_id_fkey"
                        columns: ["node_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_nodes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            node_webhooks: {
                Row: {
                    id: string
                    node_id: string
                    provider: string
                    event_type: string
                    secret_key: string
                    is_active: boolean
                    last_triggered_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    node_id: string
                    provider: string
                    event_type: string
                    secret_key?: string
                    is_active?: boolean
                    last_triggered_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    node_id?: string
                    provider?: string
                    event_type?: string
                    secret_key?: string
                    is_active?: boolean
                    last_triggered_at?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "node_webhooks_node_id_fkey"
                        columns: ["node_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_nodes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            node_metrics: {
                Row: {
                    id: string
                    node_id: string
                    label: string
                    value: string
                    unit: string | null
                    trend: "up" | "down" | "neutral" | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    node_id: string
                    label: string
                    value: string
                    unit?: string | null
                    trend?: "up" | "down" | "neutral" | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    node_id?: string
                    label?: string
                    value?: string
                    unit?: string | null
                    trend?: "up" | "down" | "neutral" | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "node_metrics_node_id_fkey"
                        columns: ["node_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_nodes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            roadmaps: {
                Row: {
                    created_at: string | null
                    id: string
                    idea_description: string | null
                    stage: string | null
                    title: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    idea_description?: string | null
                    stage?: string | null
                    title: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    idea_description?: string | null
                    stage?: string | null
                    title?: string
                    user_id?: string | null
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
