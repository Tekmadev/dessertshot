export type FlavorCategory = "fruity" | "chocolate" | "premium";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";
export type PackageSize = 24 | 48 | 96;
export type CupSize = "2oz" | "5oz";
export type FlavorTier = "classic" | "premium";
// An order is "mixed" when it contains both Classic and Premium flavours.
export type OrderTier = FlavorTier | "mixed";
export type FulfillmentMethod = "pickup" | "delivery";

export type Database = {
  public: {
    Tables: {
      // ── Products / Flavours ──
      products: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          tagline: string;
          description: string;
          category: FlavorCategory;
          emoji: string;
          accent_color: string;
          price_per_cup: number;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          layers: ProductLayer[];
          image_url: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };

      // ── Packages ──
      packages: {
        Row: {
          id: string;
          size: PackageSize;
          label: string;
          price: number;
          price_per_cup: number;
          description: string;
          perks: string[];
          is_featured: boolean;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["packages"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
      };

      // ── Orders ──
      orders: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          package_size: PackageSize;
          cup_size: CupSize;
          tier: OrderTier;
          is_rush: boolean;
          flavor_notes: string;
          desired_date: string;
          additional_notes: string | null;
          status: OrderStatus;
          fulfillment_method: FulfillmentMethod;
          total_price: number;
          admin_notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };

      // ── Order Items ──
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          flavor_name: string;
          quantity: number;
          price_per_cup: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };

      // ── User profiles ──
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          total_orders: number;
          favorite_flavor: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at" | "total_orders">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      // ── Testimonials ──
      testimonials: {
        Row: {
          id: string;
          created_at: string;
          customer_name: string;
          location: string | null;
          rating: number;
          text: string;
          flavor_tag: string | null;
          emoji: string | null;
          is_approved: boolean;
          is_featured: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["testimonials"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
      };

      // ── Analytics / Session events ──
      analytics_events: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          event_type: string;
          page_path: string;
          element_id: string | null;
          metadata: Record<string, unknown> | null;
          user_agent: string | null;
          ip_hash: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
  };
};

// ── Convenience types ──
export type ProductLayer = {
  label: string;
  color: string;
  heightRem: number;
  description: string;
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];
