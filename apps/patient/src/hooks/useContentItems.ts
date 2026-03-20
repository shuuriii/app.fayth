import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface ContentItem {
  id: string;
  module_id: number;
  type: 'worksheet' | 'psychoeducation' | 'exercise' | 'diary' | 'table';
  title: string;
  instructions: string | null;
  schema: any;
  xp_value: number;
  companion_website_ref: string | null;
}

export interface ContentResponse {
  id: string;
  patient_id: string;
  content_item_id: string;
  session_date: string;
  response_data: Record<string, any>;
  ai_feedback: string | null;
  flagged: boolean;
}

export function useContentItems() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContentItems = useCallback(async (moduleId: string | number): Promise<ContentItem[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('yb_content_items')
        .select('*')
        .eq('module_id', Number(moduleId))
        .order('id', { ascending: true });

      if (fetchError) throw fetchError;
      return data ?? [];
    } catch (err: any) {
      const msg = err.message ?? 'Failed to load content items';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContentItem = useCallback(async (itemId: string): Promise<ContentItem | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('yb_content_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      const msg = err.message ?? 'Failed to load content item';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitResponse = useCallback(async (
    contentItemId: string,
    responseData: Record<string, any>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('patient_content_responses')
        .insert({
          patient_id: user.id,
          content_item_id: contentItemId,
          session_date: new Date().toISOString().split('T')[0],
          response_data: responseData,
          flagged: false,
        });

      if (insertError) throw insertError;
      return { success: true };
    } catch (err: any) {
      const msg = err.message ?? 'Failed to submit response';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getResponseForItem = useCallback(async (
    contentItemId: string,
  ): Promise<ContentResponse | null> => {
    if (!user?.id) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('patient_content_responses')
        .select('*')
        .eq('patient_id', user.id)
        .eq('content_item_id', contentItemId)
        .order('session_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return data;
    } catch {
      return null;
    }
  }, [user?.id]);

  const getResponsesForModule = useCallback(async (
    contentItemIds: string[],
  ): Promise<Map<string, ContentResponse>> => {
    if (!user?.id || contentItemIds.length === 0) return new Map();

    try {
      const { data, error: fetchError } = await supabase
        .from('patient_content_responses')
        .select('*')
        .eq('patient_id', user.id)
        .in('content_item_id', contentItemIds)
        .order('session_date', { ascending: false });

      if (fetchError) throw fetchError;

      const map = new Map<string, ContentResponse>();
      for (const row of data ?? []) {
        // Keep only the latest response per content item
        if (!map.has(row.content_item_id)) {
          map.set(row.content_item_id, row);
        }
      }
      return map;
    } catch {
      return new Map();
    }
  }, [user?.id]);

  return {
    loading,
    error,
    fetchContentItems,
    fetchContentItem,
    submitResponse,
    getResponseForItem,
    getResponsesForModule,
  };
}
