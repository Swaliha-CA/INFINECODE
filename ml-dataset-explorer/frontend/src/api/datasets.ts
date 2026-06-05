import axios from 'axios';
import { Dataset, DatasetCreate, DatasetUpdate, Stats } from '../types';

const api = axios.create({ baseURL: '/datasets' });

export const getAllDatasets = (search?: string): Promise<Dataset[]> =>
  api.get('', { params: search ? { search } : {} }).then(r => r.data);

export const getDataset = (id: number): Promise<Dataset> =>
  api.get(`/${id}`).then(r => r.data);

export const createDataset = (data: DatasetCreate): Promise<Dataset> =>
  api.post('', data, { baseURL: '' }).then(r => r.data);

export const updateDataset = (id: number, data: DatasetUpdate): Promise<Dataset> =>
  api.put(`/${id}`, data).then(r => r.data);

export const deleteDataset = (id: number): Promise<void> =>
  api.delete(`/${id}`).then(r => r.data);

export const getStats = (): Promise<Stats> =>
  axios.get('/datasets/stats').then(r => r.data);
