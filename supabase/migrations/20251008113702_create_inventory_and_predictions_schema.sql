/*
  # Akiba AI Database Schema - Core Tables
  
  This migration creates the foundational database structure for the Akiba AI inventory and prediction system.
  
  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key) - Unique identifier for each inventory item
      - `name` (text) - Name of the food item (e.g., "Sukuma Wiki", "Ugali Flour")
      - `category` (text) - Category classification (vegetables, grains, meat, dairy, fruits)
      - `quantity` (numeric) - Current stock quantity
      - `unit` (text) - Unit of measurement (kg, bunches, liters, etc.)
      - `cost` (numeric) - Cost value in KSh
      - `expiry_date` (date) - Expiration date for the item
      - `status` (text) - Current status (good, warning, critical)
      - `user_id` (uuid) - Reference to the user who owns this inventory
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `demand_predictions`
      - `id` (uuid, primary key) - Unique identifier for each prediction
      - `item_name` (text) - Name of the item being predicted
      - `predicted_demand` (numeric) - AI-predicted demand quantity
      - `confidence_score` (numeric) - Confidence percentage (0-100)
      - `recommendation` (text) - Actionable recommendation for the user
      - `factors` (jsonb) - Contributing factors array (weather, events, trends)
      - `timeframe_days` (integer) - Prediction timeframe in days
      - `user_id` (uuid) - Reference to the user
      - `created_at` (timestamptz) - Prediction generation timestamp
      - `expires_at` (timestamptz) - When this prediction becomes stale
    
    - `waste_records`
      - `id` (uuid, primary key) - Unique identifier for waste record
      - `item_name` (text) - Name of the wasted item
      - `quantity` (numeric) - Amount wasted
      - `unit` (text) - Unit of measurement
      - `value_lost` (numeric) - Monetary value lost in KSh
      - `reason` (text) - Reason for waste (expired, spoiled, excess)
      - `prevention_suggestion` (text) - AI suggestion for future prevention
      - `user_id` (uuid) - Reference to the user
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `sales_history`
      - `id` (uuid, primary key) - Unique identifier for sale record
      - `item_name` (text) - Name of the item sold
      - `quantity` (numeric) - Quantity sold
      - `unit` (text) - Unit of measurement
      - `revenue` (numeric) - Revenue generated in KSh
      - `sale_date` (date) - Date of sale
      - `user_id` (uuid) - Reference to the user
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `sync_queue`
      - `id` (uuid, primary key) - Unique identifier for sync operation
      - `data_type` (text) - Type of data (inventory, prediction, sale, waste)
      - `data_payload` (jsonb) - The actual data to sync
      - `operation` (text) - Operation type (create, update, delete)
      - `synced` (boolean) - Whether the data has been synced
      - `user_id` (uuid) - Reference to the user
      - `created_at` (timestamptz) - Queue entry timestamp
      - `synced_at` (timestamptz) - When sync completed
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure users can only access their own records
  
  3. Important Notes
    - All timestamps use timezone-aware types for accurate tracking
    - Numeric types used for quantities and costs to maintain precision
    - JSONB used for flexible data storage of prediction factors
    - Indexes added for common query patterns to optimize performance
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  expiry_date date,
  status text NOT NULL DEFAULT 'good',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('good', 'warning', 'critical')),
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT positive_cost CHECK (cost >= 0)
);

-- Create demand_predictions table
CREATE TABLE IF NOT EXISTS demand_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  predicted_demand numeric NOT NULL,
  confidence_score numeric NOT NULL,
  recommendation text NOT NULL,
  factors jsonb DEFAULT '[]'::jsonb,
  timeframe_days integer NOT NULL DEFAULT 3,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100),
  CONSTRAINT positive_demand CHECK (predicted_demand >= 0),
  CONSTRAINT valid_timeframe CHECK (timeframe_days > 0 AND timeframe_days <= 365)
);

-- Create waste_records table
CREATE TABLE IF NOT EXISTS waste_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  value_lost numeric NOT NULL DEFAULT 0,
  reason text NOT NULL,
  prevention_suggestion text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT positive_value CHECK (value_lost >= 0)
);

-- Create sales_history table
CREATE TABLE IF NOT EXISTS sales_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  revenue numeric NOT NULL DEFAULT 0,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantity CHECK (quantity >= 0),
  CONSTRAINT positive_revenue CHECK (revenue >= 0)
);

-- Create sync_queue table for offline support
CREATE TABLE IF NOT EXISTS sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type text NOT NULL,
  data_payload jsonb NOT NULL,
  operation text NOT NULL,
  synced boolean DEFAULT false,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz,
  CONSTRAINT valid_data_type CHECK (data_type IN ('inventory', 'prediction', 'sale', 'waste')),
  CONSTRAINT valid_operation CHECK (operation IN ('create', 'update', 'delete'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON demand_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_expires ON demand_predictions(expires_at);
CREATE INDEX IF NOT EXISTS idx_waste_user_id ON waste_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_history(sale_date);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_items
CREATE POLICY "Users can view own inventory items"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory items"
  ON inventory_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory items"
  ON inventory_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory items"
  ON inventory_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for demand_predictions
CREATE POLICY "Users can view own predictions"
  ON demand_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON demand_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON demand_predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions"
  ON demand_predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for waste_records
CREATE POLICY "Users can view own waste records"
  ON waste_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own waste records"
  ON waste_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own waste records"
  ON waste_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own waste records"
  ON waste_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for sales_history
CREATE POLICY "Users can view own sales history"
  ON sales_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales history"
  ON sales_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales history"
  ON sales_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales history"
  ON sales_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for sync_queue
CREATE POLICY "Users can view own sync queue"
  ON sync_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync queue"
  ON sync_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync queue"
  ON sync_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync queue"
  ON sync_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory_items
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
