import { useState as S, useEffect as E } from 'react';
import { supabase as Q } from '../supabaseClient';

export const useRecipe = (_0x1) => {
  const [_0x2, _0x3] = S(null);
  const [_0x4, _0x5] = S(true);

  E(() => {
    const _0x6 = async () => {
      _0x5(true);
      try {
        const { data: _0x7, error: _0x8 } = await Q
          .from('recipes')
          .select('*')
          .eq('slug', _0x1)
          .single();

        if (_0x8) throw _0x8;

        if (_0x7) {
          const { data: _0x9 } = await Q
            .from('steps')
            .select('*')
            .ilike('recipe_title', `%${_0x7.title.trim()}%`) 
            .order('step_number', { ascending: true });

          const { data: _0xa } = await Q
            .from('ingredients')
            .select('*')
            .eq('recipe_id', _0x7.id); 

          const _0xb = (_0xa && _0xa.length > 0) ? _0xa : _0x7.ingredients;

          _0x3({ 
            ..._0x7, 
            steps: _0x9 || [], 
            ingredients: _0xb || [] 
          });
        }
      } catch (_0xc) {
        _0x3(null);
      } finally {
        _0x5(false);
      }
    };

    if (_0x1) _0x6();
  }, [_0x1]);

  return { recipe: _0x2, loading: _0x4 };
};