
-- Create API keys table for external plugin authentication
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  permissions JSONB NOT NULL DEFAULT '{"read": true, "write": false, "webhook": false}'::jsonb,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 100,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API usage tracking table
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook configurations table
CREATE TABLE public.webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{"analysis.completed", "analysis.failed"}',
  secret TEXT NOT NULL, -- For webhook signature verification
  is_active BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_keys
CREATE POLICY "Users can manage their own API keys"
  ON public.api_keys
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS policies for api_usage
CREATE POLICY "Users can view their own API usage"
  ON public.api_usage
  FOR SELECT
  USING (api_key_id IN (SELECT id FROM public.api_keys WHERE user_id = auth.uid()));

-- Service role can manage API usage for tracking
CREATE POLICY "Service role can manage API usage"
  ON public.api_usage
  FOR ALL
  USING (true);

-- RLS policies for webhook_configs
CREATE POLICY "Users can manage their own webhook configs"
  ON public.webhook_configs
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_usage_api_key_id ON public.api_usage(api_key_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at);
CREATE INDEX idx_webhook_configs_user_id ON public.webhook_configs(user_id);
CREATE INDEX idx_webhook_configs_api_key_id ON public.webhook_configs(api_key_id);

-- Function to check API rate limits
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  p_api_key_id UUID,
  p_rate_limit INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_hour_start TIMESTAMP WITH TIME ZONE;
  usage_count INTEGER;
BEGIN
  -- Calculate current hour window
  current_hour_start := date_trunc('hour', now());
  
  -- Get usage count for current hour
  SELECT COUNT(*)
  INTO usage_count
  FROM public.api_usage
  WHERE api_key_id = p_api_key_id
    AND created_at >= current_hour_start;
  
  -- Check if under limit
  RETURN usage_count < p_rate_limit;
END;
$$;

-- Function to validate API key and get user info
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key_hash TEXT)
RETURNS TABLE(
  api_key_id UUID,
  user_id UUID,
  permissions JSONB,
  rate_limit_per_hour INTEGER,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.id,
    ak.user_id,
    ak.permissions,
    ak.rate_limit_per_hour,
    (ak.is_active AND (ak.expires_at IS NULL OR ak.expires_at > now())) as is_valid
  FROM public.api_keys ak
  WHERE ak.key_hash = p_key_hash;
  
  -- Update last used timestamp
  UPDATE public.api_keys 
  SET last_used_at = now()
  WHERE key_hash = p_key_hash;
END;
$$;

-- Function to log API usage
CREATE OR REPLACE FUNCTION public.log_api_usage(
  p_api_key_id UUID,
  p_endpoint TEXT,
  p_method TEXT,
  p_status_code INTEGER,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_request_size_bytes INTEGER DEFAULT NULL,
  p_response_size_bytes INTEGER DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.api_usage (
    api_key_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    request_size_bytes,
    response_size_bytes,
    ip_address,
    user_agent
  ) VALUES (
    p_api_key_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time_ms,
    p_request_size_bytes,
    p_response_size_bytes,
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_api_keys_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_api_keys_updated_at();

CREATE TRIGGER update_webhook_configs_updated_at
  BEFORE UPDATE ON public.webhook_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
