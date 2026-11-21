import { Category } from '../types';
import { api, unwrap } from './api';

export const categoryService = {
  list: () => unwrap<Category[]>(api.get('/categories')),
};
