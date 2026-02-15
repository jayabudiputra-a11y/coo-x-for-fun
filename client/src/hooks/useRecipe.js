import { useState as S, useEffect as E } from 'react';
import { supabase as Q } from '../supabaseClient';
import { getCache as _gC, setCache as _sC } from '../utils/localCache';
import { setSessionHash as _sSH } from '../utils/cookieHash';
import { queueAction as _qA } from '../utils/indexedDbQueue';

export const useRecipe = (_0x1) => {
  const [_0x2, _0x3] = S(null);
  const [_0x4, _0x5] = S(true);

  E(() => {
    let _m = true;
    const _0x6 = async () => {
      _0x5(true);
      
      const _cacheKey = `recipe_full_${_0x1}`;
      const _cachedData = _gC(_cacheKey);
      if (_cachedData) {
        if (_m) {
          _0x3(_cachedData);
          _0x5(false);
        }
        return;
      }

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

          const _finalRecipe = { 
            ..._0x7, 
            steps: _0x9 || [], 
            ingredients: _0xb || [] 
          };

          if (_m) {
            _0x3(_finalRecipe);
            _sC(_cacheKey, _finalRecipe);
            _sSH({ last_slug: _0x1, ts: Date.now() });
            _qA({ type: 'RECIPE_LOAD', slug: _0x1 });
          }
        }
      } catch (_0xc) {
        if (_m) _0x3(null);
      } finally {
        if (_m) _0x5(false);
      }
    };

    if (_0x1) _0x6();
    return () => { _m = false; };
  }, [_0x1]);

  return { recipe: _0x2, loading: _0x4 };
};